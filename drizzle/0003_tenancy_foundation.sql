CREATE TABLE "organizations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"display_name" text DEFAULT 'Personal workspace' NOT NULL,
	"owner_id" uuid NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "organizations_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "organization_members" (
	"org_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role" text DEFAULT 'owner' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "organization_members_pk" PRIMARY KEY("org_id","user_id"),
	CONSTRAINT "organization_members_role_check" CHECK ("role" IN ('owner','admin','editor','viewer'))
);
--> statement-breakpoint
ALTER TABLE "cards" ADD COLUMN "org_id" uuid;
--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "org_id" uuid;
--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "org_id" uuid;
--> statement-breakpoint
INSERT INTO "organizations" ("slug", "display_name", "owner_id")
SELECT 'personal-' || replace("id"::text, '-', ''),
       CASE WHEN "name" = '' THEN 'Personal workspace' ELSE "name" END,
       "id"
FROM "users";
--> statement-breakpoint
INSERT INTO "organization_members" ("org_id", "user_id", "role")
SELECT "organizations"."id", "organizations"."owner_id", 'owner'
FROM "organizations";
--> statement-breakpoint
UPDATE "cards" SET "org_id" = "organizations"."id"
FROM "organizations" WHERE "organizations"."owner_id" = "cards"."user_id";
--> statement-breakpoint
UPDATE "events" SET "org_id" = "cards"."org_id"
FROM "cards" WHERE "cards"."id" = "events"."card_id";
--> statement-breakpoint
UPDATE "leads" SET "org_id" = "cards"."org_id"
FROM "cards" WHERE "cards"."id" = "leads"."card_id";
--> statement-breakpoint
ALTER TABLE "cards" ALTER COLUMN "org_id" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "events" ALTER COLUMN "org_id" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "leads" ALTER COLUMN "org_id" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "organization_members" ADD CONSTRAINT "organization_members_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "organization_members" ADD CONSTRAINT "organization_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "cards" ADD CONSTRAINT "cards_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "leads" ADD CONSTRAINT "leads_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "organizations_owner_idx" ON "organizations" USING btree ("owner_id");
--> statement-breakpoint
CREATE INDEX "organization_members_user_idx" ON "organization_members" USING btree ("user_id");
--> statement-breakpoint
CREATE INDEX "cards_org_idx" ON "cards" USING btree ("org_id");
--> statement-breakpoint
CREATE INDEX "events_org_idx" ON "events" USING btree ("org_id");
--> statement-breakpoint
CREATE INDEX "leads_org_idx" ON "leads" USING btree ("org_id");
