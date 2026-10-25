ALTER TABLE "users" ADD COLUMN "paddle_environment" text;
--> statement-breakpoint
CREATE TABLE "paddle_checkout_attempts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"transaction_id" text NOT NULL,
	"price_id" text NOT NULL,
	"environment" text NOT NULL,
	"customer_id" text,
	"subscription_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "paddle_checkout_attempts_transaction_id_unique" UNIQUE("transaction_id")
);
--> statement-breakpoint
ALTER TABLE "paddle_checkout_attempts" ADD CONSTRAINT "paddle_checkout_attempts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "paddle_attempts_user_idx" ON "paddle_checkout_attempts" USING btree ("user_id");
--> statement-breakpoint
CREATE INDEX "paddle_attempts_subscription_idx" ON "paddle_checkout_attempts" USING btree ("subscription_id");
