import { pgTable, uuid, text, boolean, timestamp, jsonb, integer, index } from "drizzle-orm/pg-core";

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
  proSince: timestamp("pro_since", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const cards = pgTable(
  "cards",
  {
    id: uuid("id").defaultRandom().primaryKey(),
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
    theme: jsonb("theme").$type<Theme>().notNull().default({ preset: "midnight", accent: "#7c5cff" }),
    links: jsonb("links").$type<LinkItem[]>().notNull().default([]),
    products: jsonb("products").$type<ProductItem[]>().notNull().default([]),
    leadFormEnabled: boolean("lead_form_enabled").notNull().default(true),
    published: boolean("published").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("cards_user_idx").on(t.userId)]
);

export const events = pgTable(
  "events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    cardId: uuid("card_id")
      .notNull()
      .references(() => cards.id, { onDelete: "cascade" }),
    type: text("type").notNull(), // view | qr_scan | link_click | vcard_save | product_click
    ref: text("ref").notNull().default(""), // link label / product title / utm
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("events_card_idx").on(t.cardId), index("events_type_idx").on(t.type)]
);

export const leads = pgTable(
  "leads",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    cardId: uuid("card_id")
      .notNull()
      .references(() => cards.id, { onDelete: "cascade" }),
    name: text("name").notNull().default(""),
    email: text("email").notNull().default(""),
    phone: text("phone").notNull().default(""),
    note: text("note").notNull().default(""),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("leads_card_idx").on(t.cardId)]
);

export const freeRuns = pgTable("free_leads_count", {
  cardId: uuid("card_id").primaryKey(),
  month: text("month").notNull(), // YYYY-MM
  count: integer("count").notNull().default(0),
});
