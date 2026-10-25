import assert from "node:assert/strict";
import crypto from "node:crypto";
import test from "node:test";
import postgres from "postgres";
import { handlePaddleWebhook } from "../src/lib/paddle-hook";
import { POST as submitLead } from "../src/app/api/leads/route";
import { closeDatabase } from "../src/lib/db";

const databaseUrl = process.env.DATABASE_URL;

test("fresh migrations and replay preserve legacy records and enforce transactional cap locking", { skip: !databaseUrl }, async () => {
  const sql = postgres(databaseUrl!, { max: 10 });
  const userA = crypto.randomUUID();
  const userB = crypto.randomUUID();
  const userC = crypto.randomUUID();
  const orgA = crypto.randomUUID();
  const orgB = crypto.randomUUID();
  const orgC = crypto.randomUUID();
  const cardA = crypto.randomUUID();
  const cardB = crypto.randomUUID();
  const draftCard = crypto.randomUUID();
  const attemptId = crypto.randomUUID();

  try {
    await sql`truncate rate_limit_buckets, paddle_checkout_attempts, paddle_webhook_events, sessions, leads, events, cards, users cascade`;
    const migrationRows = await sql`select count(*)::int as count from appistic_migrations`;
    assert.equal(Number(migrationRows[0].count), 5);

    await sql`
      insert into users (id, email, password_hash, name, plan)
      values (${userA}, ${`free-${userA}@example.test`}, ${"$2b$12$synthetic"}, 'Free Fixture', 'free'),
             (${userB}, ${`pro-${userB}@example.test`}, ${"$2b$12$synthetic"}, 'Pro Fixture', 'pro'),
             (${userC}, ${`concurrent-${userC}@example.test`}, ${"$2b$12$synthetic"}, 'Concurrent Fixture', 'free')
    `;
    await sql`
      insert into organizations (id, slug, display_name, owner_id)
      values (${orgA}, ${`personal-${userA}`}, 'Free Fixture', ${userA}),
             (${orgB}, ${`personal-${userB}`}, 'Pro Fixture', ${userB}),
             (${orgC}, ${`personal-${userC}`}, 'Concurrent Fixture', ${userC})
    `;
    await sql`insert into organization_members (org_id, user_id, role) values (${orgA}, ${userA}, 'owner'), (${orgB}, ${userB}, 'owner'), (${orgC}, ${userC}, 'owner')`;
    await sql`
      insert into cards (id, org_id, user_id, slug, brand_name, published)
      values (${cardA}, ${orgA}, ${userA}, ${`legacy-${userA}`}, 'Free Card', true),
             (${cardB}, ${orgB}, ${userB}, ${`legacy-${userB}`}, 'Pro Card', true)
    `;
    await sql`
      insert into cards (id, org_id, user_id, slug, brand_name, lead_form_enabled, published)
      values (${draftCard}, ${orgA}, ${userA}, ${`draft-${userA}`}, 'Draft Card', true, false)
    `;
    await sql`
      insert into paddle_checkout_attempts (id, user_id, transaction_id, price_id, environment)
      values (${attemptId}, ${userA}, 'txn_integration', 'price_good', 'sandbox')
    `;
    await sql`insert into events (org_id, card_id, type, ref) values (${orgA}, ${cardA}, 'view', 'fixture')`;
    await sql`insert into leads (org_id, card_id, name, email) values (${orgA}, ${cardA}, 'Synthetic Lead', 'lead@example.test')`;

    const validLead = await submitLead(new Request("http://localhost/api/leads", {
      method: "POST",
      headers: { "content-type": "application/json", "x-real-ip": "198.51.100.10" },
      body: JSON.stringify({ slug: `legacy-${userA}`, name: "New Lead", email: "new-lead@example.test" }),
    }));
    assert.equal(validLead.status, 200);
    const leadEventCounts = await sql`select type, count(*)::int as count from events where card_id = ${cardA} group by type`;
    assert.equal(Number(leadEventCounts.find((row) => row.type === "lead")?.count || 0), 1);
    assert.equal(Number(leadEventCounts.find((row) => row.type === "view")?.count || 0), 1);

    const draftLead = await submitLead(new Request("http://localhost/api/leads", {
      method: "POST",
      headers: { "content-type": "application/json", "x-real-ip": "198.51.100.11" },
      body: JSON.stringify({ slug: `draft-${userA}`, name: "Draft Lead", email: "draft-lead@example.test" }),
    }));
    assert.equal(draftLead.status, 404);
    const malformedLead = await submitLead(new Request("http://localhost/api/leads", {
      method: "POST",
      headers: { "content-type": "application/json", "x-real-ip": "198.51.100.12" },
      body: JSON.stringify({ slug: `legacy-${userA}`, email: "not-an-email" }),
    }));
    assert.equal(malformedLead.status, 400);

    const before = await sql`select c.slug, c.user_id, u.plan from cards c join users u on u.id = c.user_id order by c.slug`;
    const preserved = before.map((row) => [row.slug, row.user_id, row.plan]).sort((a, b) => String(a[0]).localeCompare(String(b[0])));
    const expected = [
      [`draft-${userA}`, userA, "free"],
      [`legacy-${userA}`, userA, "free"],
      [`legacy-${userB}`, userB, "pro"],
    ].sort((a, b) => String(a[0]).localeCompare(String(b[0])));
    assert.deepEqual(preserved, expected);

    const sessionTokenHash = crypto.createHash("sha256").update("synthetic-session").digest("hex");
    await sql`insert into sessions (user_id, token_hash, expires_at) values (${userA}, ${sessionTokenHash}, now() + interval '1 day')`;
    const active = await sql`select user_id from sessions where token_hash = ${sessionTokenHash} and revoked_at is null and expires_at > now()`;
    assert.equal(active[0].user_id, userA);
    await sql`update sessions set revoked_at = now() where token_hash = ${sessionTokenHash}`;
    const revoked = await sql`select user_id from sessions where token_hash = ${sessionTokenHash} and revoked_at is null and expires_at > now()`;
    assert.equal(revoked.length, 0);

    const attempt = async (slug: string) => sql.begin(async (tx) => {
      await tx`select id from users where id = ${userC} for update`;
      const count = await tx`select count(*)::int as count from cards where user_id = ${userC}`;
      if (Number(count[0].count) >= 1) return false;
      await tx`insert into cards (org_id, user_id, slug, brand_name) values (${orgC}, ${userC}, ${slug}, 'Concurrent')`;
      return true;
    });
    const results = await Promise.all([attempt(`race-a-${userA}`), attempt(`race-b-${userA}`)]);
    assert.equal(results.filter(Boolean).length, 1);

    await sql`insert into paddle_webhook_events (event_id, event_type) values ('evt_fixture', 'transaction.completed') on conflict (event_id) do nothing`;
    await sql`insert into paddle_webhook_events (event_id, event_type) values ('evt_fixture', 'transaction.completed') on conflict (event_id) do nothing`;
    const eventRows = await sql`select count(*)::int as count from paddle_webhook_events where event_id = 'evt_fixture'`;
    assert.equal(Number(eventRows[0].count), 1);

    const previousWebhookSecret = process.env.PADDLE_WEBHOOK_SECRET;
    const previousEnvironment = process.env.PADDLE_ENVIRONMENT;
    const previousProduct = process.env.PADDLE_PRO_PRODUCT_ID;
    const previousMonthlyPrice = process.env.PADDLE_PRO_MONTHLY_PRICE_ID;
    process.env.PADDLE_WEBHOOK_SECRET = "integration-paddle-secret";
    process.env.PADDLE_ENVIRONMENT = "sandbox";
    process.env.PADDLE_PRO_PRODUCT_ID = "product_good";
    process.env.PADDLE_PRO_MONTHLY_PRICE_ID = "price_good";
    const unsigned = await handlePaddleWebhook(new Request("http://localhost/api/webhooks/paddle", {
      method: "POST",
      body: JSON.stringify({ event_id: "evt_unsigned", event_type: "subscription.activated", data: {} }),
    }));
    assert.equal(unsigned.status, 401);
    const signedWebhook = async (event: Record<string, unknown>) => {
      const raw = JSON.stringify(event);
      const ts = Math.floor(Date.now() / 1000).toString();
      const signature = crypto.createHmac("sha256", process.env.PADDLE_WEBHOOK_SECRET!).update(`${ts}:${raw}`).digest("hex");
      return handlePaddleWebhook(new Request("http://localhost/api/webhooks/paddle", {
        method: "POST",
        headers: { "paddle-signature": `ts=${ts};h1=${signature}` },
        body: raw,
      }));
    };
    const activeAt = new Date(Date.now()).toISOString();
    const baseEvent = (eventId: string, type: string, status: string, occurredAt: string, priceId = "price_good") => ({
      event_id: eventId,
      event_type: type,
      occurred_at: occurredAt,
      data: {
        id: type === "transaction.completed" ? "txn_integration" : "sub_integration",
        subscription_id: type === "transaction.completed" ? "sub_integration" : undefined,
        customer_id: "ctm_integration",
        status,
        items: [{ price: { id: priceId, product_id: "product_good" } }],
        custom_data: { appisticCheckoutAttemptId: attemptId, appisticEnvironment: "sandbox" },
      },
    });
    assert.equal((await signedWebhook(baseEvent("evt_wrong_price", "subscription.activated", "active", activeAt, "price_bad"))).status, 200);
    assert.equal((await sql`select plan from users where id = ${userA}`)[0].plan, "free");
    assert.equal((await signedWebhook(baseEvent("evt_completed", "transaction.completed", "completed", activeAt))).status, 200);
    assert.equal((await sql`select plan from users where id = ${userA}`)[0].plan, "free");
    assert.equal((await signedWebhook(baseEvent("evt_active", "subscription.activated", "active", activeAt))).status, 200);
    assert.equal((await signedWebhook(baseEvent("evt_active", "subscription.activated", "active", activeAt))).status, 200);
    assert.equal((await sql`select plan from users where id = ${userA}`)[0].plan, "pro");
    assert.equal((await signedWebhook(baseEvent("evt_old_cancel", "subscription.canceled", "canceled", new Date(Date.now() - 10_000).toISOString()))).status, 200);
    assert.equal((await sql`select plan from users where id = ${userA}`)[0].plan, "pro");
    assert.equal((await signedWebhook(baseEvent("evt_new_cancel", "subscription.canceled", "canceled", new Date(Date.now() + 1_000).toISOString()))).status, 200);
    assert.equal((await sql`select plan from users where id = ${userA}`)[0].plan, "free");
    if (previousWebhookSecret === undefined) delete process.env.PADDLE_WEBHOOK_SECRET;
    else process.env.PADDLE_WEBHOOK_SECRET = previousWebhookSecret;
    if (previousEnvironment === undefined) delete process.env.PADDLE_ENVIRONMENT;
    else process.env.PADDLE_ENVIRONMENT = previousEnvironment;
    if (previousProduct === undefined) delete process.env.PADDLE_PRO_PRODUCT_ID;
    else process.env.PADDLE_PRO_PRODUCT_ID = previousProduct;
    if (previousMonthlyPrice === undefined) delete process.env.PADDLE_PRO_MONTHLY_PRICE_ID;
    else process.env.PADDLE_PRO_MONTHLY_PRICE_ID = previousMonthlyPrice;

    await sql`delete from leads where card_id = ${cardA}`;
    await sql`insert into leads (org_id, card_id, name, email)
      select ${orgA}, ${cardA}, 'Capacity Fixture', 'capacity-' || n || '@example.test'
      from generate_series(1, 49) as n`;
    const leadAttempt = async (email: string) => sql.begin(async (tx) => {
      await tx`select id from users where id = ${userA} for update`;
      const count = await tx`select count(*)::int as count from leads l inner join cards c on c.id = l.card_id where c.user_id = ${userA} and l.created_at >= date_trunc('month', now())`;
      if (Number(count[0].count) >= 50) return false;
      await tx`insert into leads (org_id, card_id, name, email) values (${orgA}, ${cardA}, 'Concurrent Lead', ${email})`;
      return true;
    });
    const leadResults = await Promise.all([leadAttempt(`race-lead-a-${userA}@example.test`), leadAttempt(`race-lead-b-${userA}@example.test`)]);
    assert.equal(leadResults.filter(Boolean).length, 1);
    const leadTotal = await sql`select count(*)::int as count from leads where card_id = ${cardA}`;
    assert.equal(Number(leadTotal[0].count), 50);

    await sql`insert into rate_limit_buckets (key, window_started_at, count) values ('fixture-key', now(), 1)`;
    await sql`insert into rate_limit_buckets (key, window_started_at, count) values ('fixture-key', now(), 1) on conflict (key) do update set count = rate_limit_buckets.count + 1`;
    const rateRows = await sql`select count from rate_limit_buckets where key = 'fixture-key'`;
    assert.equal(Number(rateRows[0].count), 2);
  } finally {
    await sql`truncate rate_limit_buckets, paddle_checkout_attempts, paddle_webhook_events, sessions, leads, events, cards, users cascade`;
    await sql.end({ timeout: 5 });
    await closeDatabase();
  }
});
