CREATE TABLE "auth_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kind" text NOT NULL,
	"user_id" uuid,
	"email" text NOT NULL,
	"ip" text,
	"at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "auth_events_known_kind" CHECK ("auth_events"."kind" in ('sign_in','sign_in_failed','sign_out','password_changed'))
);
--> statement-breakpoint
CREATE TABLE "reminder_runs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kind" text NOT NULL,
	"day" date NOT NULL,
	"claimed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"sent_at" timestamp with time zone,
	"sets" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"recipients" jsonb DEFAULT '[]'::jsonb NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "must_change_password" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "shareholders" ADD COLUMN "removed_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "auth_events" ADD CONSTRAINT "auth_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "auth_events_at" ON "auth_events" USING btree ("at");--> statement-breakpoint
CREATE UNIQUE INDEX "reminder_runs_kind_day" ON "reminder_runs" USING btree ("kind","day");