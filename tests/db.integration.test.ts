import assert from "node:assert/strict";
import crypto from "node:crypto";
import test from "node:test";
import postgres from "postgres";

const databaseUrl = process.env.DATABASE_URL;

test("fresh migrations and replay preserve legacy records and enforce transactional cap locking", { skip: !databaseUrl }, async () => {
  const sql = postgres(databaseUrl!, { max: 10 });
  const userA = crypto.randomUUID();
  const userB = crypto.randomUUID();
  const orgA = crypto.randomUUID();
  const orgB = crypto.randomUUID();
  const cardA = crypto.randomUUID();
  const cardB = crypto.randomUUID();

  try {
    await sql`truncate rate_limit_buckets, paddle_webhook_events, sessions, leads, events, cards, users cascade`;
    const migrationRows = await sql`select count(*)::int as count from appistic_migrations`;
    assert.equal(Number(migrationRows[0].count), 4);

    await sql`
      insert into users (id, email, password_hash, name, plan)
      values (${userA}, ${`free-${userA}@example.test`}, ${"$2b$12$synthetic"}, 'Free Fixture', 'free'),
             (${userB}, ${`pro-${userB}@example.test`}, ${"$2b$12$synthetic"}, 'Pro Fixture', 'pro')
    `;
    await sql`
      insert into organizations (id, slug, display_name, owner_id)
      values (${orgA}, ${`personal-${userA}`}, 'Free Fixture', ${userA}),
             (${orgB}, ${`personal-${userB}`}, 'Pro Fixture', ${userB})
    `;
    await sql`insert into organization_members (org_id, user_id, role) values (${orgA}, ${userA}, 'owner'), (${orgB}, ${userB}, 'owner')`;
    await sql`
      insert into cards (id, org_id, user_id, slug, brand_name, published)
      values (${cardA}, ${orgA}, ${userA}, ${`legacy-${userA}`}, 'Free Card', true),
             (${cardB}, ${orgB}, ${userB}, ${`legacy-${userB}`}, 'Pro Card', true)
    `;
    await sql`insert into events (org_id, card_id, type, ref) values (${orgA}, ${cardA}, 'view', 'fixture')`;
    await sql`insert into leads (org_id, card_id, name, email) values (${orgA}, ${cardA}, 'Synthetic Lead', 'lead@example.test')`;

    const before = await sql`select c.slug, c.user_id, u.plan from cards c join users u on u.id = c.user_id order by c.slug`;
    const preserved = before.map((row) => [row.slug, row.user_id, row.plan]).sort((a, b) => String(a[0]).localeCompare(String(b[0])));
    const expected = [
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
      await tx`select id from users where id = ${userA} for update`;
      const count = await tx`select count(*)::int as count from cards where user_id = ${userA}`;
      if (Number(count[0].count) >= 2) return false;
      await tx`insert into cards (org_id, user_id, slug, brand_name) values (${orgA}, ${userA}, ${slug}, 'Concurrent')`;
      return true;
    });
    const results = await Promise.all([attempt(`race-a-${userA}`), attempt(`race-b-${userA}`)]);
    assert.equal(results.filter(Boolean).length, 1);

    await sql`insert into paddle_webhook_events (event_id, event_type) values ('evt_fixture', 'transaction.completed') on conflict (event_id) do nothing`;
    await sql`insert into paddle_webhook_events (event_id, event_type) values ('evt_fixture', 'transaction.completed') on conflict (event_id) do nothing`;
    const eventRows = await sql`select count(*)::int as count from paddle_webhook_events where event_id = 'evt_fixture'`;
    assert.equal(Number(eventRows[0].count), 1);
    await sql`insert into rate_limit_buckets (key, window_started_at, count) values ('fixture-key', now(), 1)`;
    await sql`insert into rate_limit_buckets (key, window_started_at, count) values ('fixture-key', now(), 1) on conflict (key) do update set count = rate_limit_buckets.count + 1`;
    const rateRows = await sql`select count from rate_limit_buckets where key = 'fixture-key'`;
    assert.equal(Number(rateRows[0].count), 2);
  } finally {
    await sql`truncate rate_limit_buckets, paddle_webhook_events, sessions, leads, events, cards, users cascade`;
    await sql.end({ timeout: 5 });
  }
});
