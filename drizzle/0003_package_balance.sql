ALTER TABLE "package_allowances" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "package_template_allowances" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "package_allowances" CASCADE;--> statement-breakpoint
DROP TABLE "package_template_allowances" CASCADE;--> statement-breakpoint
ALTER TABLE "package_templates" ADD COLUMN "sessions" smallint NOT NULL;--> statement-breakpoint
ALTER TABLE "package_templates" ADD COLUMN "locations" "session_location"[] NOT NULL;--> statement-breakpoint
ALTER TABLE "packages" ADD COLUMN "sessions" smallint NOT NULL;--> statement-breakpoint
ALTER TABLE "packages" ADD COLUMN "locations" "session_location"[] NOT NULL;--> statement-breakpoint
ALTER TABLE "package_templates" ADD CONSTRAINT "package_templates_sessions" CHECK ("package_templates"."sessions" > 0);--> statement-breakpoint
ALTER TABLE "package_templates" ADD CONSTRAINT "package_templates_locations" CHECK (cardinality("package_templates"."locations") > 0);--> statement-breakpoint
ALTER TABLE "package_templates" ADD CONSTRAINT "package_templates_price" CHECK ("package_templates"."price_minor" >= 0);--> statement-breakpoint
ALTER TABLE "packages" ADD CONSTRAINT "packages_sessions" CHECK ("packages"."sessions" > 0);--> statement-breakpoint
ALTER TABLE "packages" ADD CONSTRAINT "packages_locations" CHECK (cardinality("packages"."locations") > 0);