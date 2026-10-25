import { pgTable, uuid, text, boolean, timestamp, jsonb, integer, index, primaryKey } from "drizzle-orm/pg-core";

export type LinkItem = { type: string; label: string; url: string };
export type ProductItem = { title: string; price: string; url: string; image: string; desc: string };
export type Theme = { preset: string; accent: string };

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull().default(""),
  plan: text("plan").notNull().default("free"), // free | pro
  paddleCustomerId: text("paddle_customer_id"),
  paddleSubscriptionId: text("paddle_subscription_id"),
  paddleEnvironment: text("paddle_environment"),
  paddleEventAt: timestamp("paddle_event_at", { withTimezone: true }),
  proSince: timestamp("pro_since", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const organizations = pgTable("organizations", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").notNull().unique(),
  displayName: text("display_name").notNull().default("Personal workspace"),
  ownerId: uuid("owner_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [index("organizations_owner_idx").on(t.ownerId)]);

export const organizationMembers = pgTable("organization_members", {
  orgId: uuid("org_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  role: text("role").notNull().default("owner"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [primaryKey({ columns: [t.orgId, t.userId], name: "organization_members_pk" }), index("organization_members_user_idx").on(t.userId)]);

export const sessions = pgTable(
  "sessions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    tokenHash: text("token_hash").notNull().unique(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("sessions_user_idx").on(t.userId), index("sessions_expiry_idx").on(t.expiresAt)]
);

export const paddleWebhookEvents = pgTable(
  "paddle_webhook_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    eventId: text("event_id").notNull().unique(),
    eventType: text("event_type").notNull(),
    occurredAt: timestamp("occurred_at", { withTimezone: true }),
    processedAt: timestamp("processed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("paddle_events_type_idx").on(t.eventType)]
);

export const paddleCheckoutAttempts = pgTable(
  "paddle_checkout_attempts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    transactionId: text("transaction_id").notNull().unique(),
    priceId: text("price_id").notNull(),
    environment: text("environment").notNull(),
    customerId: text("customer_id"),
    subscriptionId: text("subscription_id"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("paddle_attempts_user_idx").on(t.userId), index("paddle_attempts_subscription_idx").on(t.subscriptionId)]
);

export const rateLimitBuckets = pgTable("rate_limit_buckets", {
  key: text("key").primaryKey(),
  windowStartedAt: timestamp("window_started_at", { withTimezone: true }).notNull(),
  count: integer("count").notNull().default(0),
});

export const cards = pgTable(
  "cards",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orgId: uuid("org_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    slug: text("slug").notNull().unique(),
    brandName: text("brand_name").notNull().default(""),
    headline: text("headline").notNull().default(""),
    bio: text("bio").notNull().default(""),
    avatarUrl: text("avatar_url").notNull().default(""),
    coverUrl: text("cover_url").notNull().default(""),
    phone: text("phone").notNull().default(""),
    email: text("email").notNull().default(""),
    website: text("website").notNull().default(""),
    address: text("address").notNull().default(""),
    theme: jsonb("theme").$type<Theme>().notNull().default({ preset: "snow", accent: "#ea3a2e" }),
    links: jsonb("links").$type<LinkItem[]>().notNull().default([]),
    products: jsonb("products").$type<ProductItem[]>().notNull().default([]),
    leadFormEnabled: boolean("lead_form_enabled").notNull().default(true),
    published: boolean("published").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("cards_user_idx").on(t.userId), index("cards_org_idx").on(t.orgId)]
);

export const events = pgTable(
  "events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orgId: uuid("org_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    cardId: uuid("card_id")
      .notNull()
      .references(() => cards.id, { onDelete: "cascade" }),
    type: text("type").notNull(), // view | qr_scan | link_click | vcard_save | product_click | lead
    ref: text("ref").notNull().default(""), // link label / product title / utm
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("events_card_idx").on(t.cardId), index("events_type_idx").on(t.type), index("events_org_idx").on(t.orgId)]
);

export const leads = pgTable(
  "leads",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orgId: uuid("org_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    cardId: uuid("card_id")
      .notNull()
      .references(() => cards.id, { onDelete: "cascade" }),
    name: text("name").notNull().default(""),
    email: text("email").notNull().default(""),
    phone: text("phone").notNull().default(""),
    note: text("note").notNull().default(""),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("leads_card_idx").on(t.cardId), index("leads_org_idx").on(t.orgId)]
);

export const freeRuns = pgTable("free_leads_count", {
  cardId: uuid("card_id").primaryKey(),
  month: text("month").notNull(), // YYYY-MM
  count: integer("count").notNull().default(0),
});
