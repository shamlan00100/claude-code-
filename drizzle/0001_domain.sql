CREATE TYPE "public"."body_region" AS ENUM('upper', 'core', 'lower');--> statement-breakpoint
CREATE TYPE "public"."coaching_status" AS ENUM('invited', 'active', 'paused', 'ended');--> statement-breakpoint
CREATE TYPE "public"."credit_outcome" AS ENUM('consumed', 'returned', 'waived');--> statement-breakpoint
CREATE TYPE "public"."intensity" AS ENUM('light', 'moderate', 'hard');--> statement-breakpoint
CREATE TYPE "public"."muscle_role" AS ENUM('primary', 'secondary');--> statement-breakpoint
CREATE TYPE "public"."package_status" AS ENUM('active', 'paused', 'completed', 'expired', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."package_structure" AS ENUM('session_pack', 'monthly');--> statement-breakpoint
CREATE TYPE "public"."program_status" AS ENUM('draft', 'active', 'completed', 'archived');--> statement-breakpoint
CREATE TYPE "public"."rest_reason" AS ENUM('sore', 'unwell', 'travelling', 'no_time', 'other');--> statement-breakpoint
CREATE TYPE "public"."session_kind" AS ENUM('pt', 'self_directed');--> statement-breakpoint
CREATE TYPE "public"."session_location" AS ENUM('gym', 'home', 'outdoor', 'online');--> statement-breakpoint
CREATE TYPE "public"."session_status" AS ENUM('unscheduled', 'booked', 'confirmed', 'in_progress', 'completed', 'rescheduled', 'substituted', 'rested', 'cancelled', 'no_show', 'missed');--> statement-breakpoint
CREATE TYPE "public"."sex" AS ENUM('female', 'male', 'unspecified');--> statement-breakpoint
CREATE TYPE "public"."tracking_type" AS ENUM('weight_reps', 'reps', 'time', 'distance_time', 'time_level');--> statement-breakpoint
CREATE TABLE "client_invites" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"trainer_client_id" uuid NOT NULL,
	"token_hash" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"accepted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "client_invites_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
CREATE TABLE "clients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"full_name" text NOT NULL,
	"full_name_ar" text,
	"phone" text,
	"email" text,
	"date_of_birth" date,
	"sex" "sex" DEFAULT 'unspecified' NOT NULL,
	"locale" "locale" DEFAULT 'en' NOT NULL,
	"timezone" text DEFAULT 'Asia/Bahrain' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "clients_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "exercise_muscles" (
	"exercise_id" uuid NOT NULL,
	"muscle_group_id" uuid NOT NULL,
	"role" "muscle_role" NOT NULL,
	CONSTRAINT "exercise_muscles_exercise_id_muscle_group_id_pk" PRIMARY KEY("exercise_id","muscle_group_id")
);
--> statement-breakpoint
CREATE TABLE "exercises" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"external_id" text,
	"name_en" text NOT NULL,
	"name_ar" text,
	"tracking_type" "tracking_type" NOT NULL,
	"equipment" text,
	"category" text,
	"instructions_en" text,
	"instructions_ar" text,
	"created_by_trainer_id" uuid,
	"is_custom" boolean DEFAULT false NOT NULL,
	"archived_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "exercises_external_id_unique" UNIQUE("external_id"),
	CONSTRAINT "exercises_custom_owner" CHECK (not "exercises"."is_custom" or "exercises"."created_by_trainer_id" is not null or "exercises"."archived_at" is not null)
);
--> statement-breakpoint
CREATE TABLE "muscle_groups" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" text NOT NULL,
	"name_en" text NOT NULL,
	"name_ar" text,
	"region" "body_region" NOT NULL,
	"display_order" smallint DEFAULT 0 NOT NULL,
	CONSTRAINT "muscle_groups_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "package_allowances" (
	"package_id" uuid NOT NULL,
	"location" "session_location" NOT NULL,
	"sessions" smallint NOT NULL,
	CONSTRAINT "package_allowances_package_id_location_pk" PRIMARY KEY("package_id","location"),
	CONSTRAINT "package_allowances_positive" CHECK ("package_allowances"."sessions" > 0)
);
--> statement-breakpoint
CREATE TABLE "package_template_allowances" (
	"template_id" uuid NOT NULL,
	"location" "session_location" NOT NULL,
	"sessions" smallint NOT NULL,
	CONSTRAINT "package_template_allowances_template_id_location_pk" PRIMARY KEY("template_id","location"),
	CONSTRAINT "package_template_allowances_positive" CHECK ("package_template_allowances"."sessions" > 0)
);
--> statement-breakpoint
CREATE TABLE "package_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"trainer_id" uuid NOT NULL,
	"name" text NOT NULL,
	"structure" "package_structure" NOT NULL,
	"validity_days" smallint,
	"session_minutes" smallint NOT NULL,
	"cancellation_hours" smallint NOT NULL,
	"free_late_cancels" smallint NOT NULL,
	"price_minor" integer NOT NULL,
	"currency" text DEFAULT 'BHD' NOT NULL,
	"archived_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "packages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"trainer_id" uuid NOT NULL,
	"client_id" uuid NOT NULL,
	"template_id" uuid,
	"name" text NOT NULL,
	"structure" "package_structure" NOT NULL,
	"starts_on" date NOT NULL,
	"expires_on" date,
	"session_minutes" smallint NOT NULL,
	"cancellation_hours" smallint NOT NULL,
	"free_late_cancels" smallint NOT NULL,
	"price_minor" integer NOT NULL,
	"currency" text NOT NULL,
	"status" "package_status" DEFAULT 'active' NOT NULL,
	"paused_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "packages_price" CHECK ("packages"."price_minor" >= 0),
	CONSTRAINT "packages_dates" CHECK ("packages"."expires_on" is null or "packages"."expires_on" >= "packages"."starts_on"),
	CONSTRAINT "packages_paused_at" CHECK (("packages"."status" = 'paused') = ("packages"."paused_at" is not null))
);
--> statement-breakpoint
CREATE TABLE "program_days" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"program_id" uuid NOT NULL,
	"order_index" smallint NOT NULL,
	"name" text NOT NULL,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "program_exercises" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"program_day_id" uuid NOT NULL,
	"exercise_id" uuid NOT NULL,
	"order_index" smallint NOT NULL,
	"target_sets" smallint,
	"target_reps_min" smallint,
	"target_reps_max" smallint,
	"target_weight_kg" numeric(6, 2),
	"target_duration_s" integer,
	"target_distance_m" numeric(9, 2),
	"target_level" numeric(4, 1),
	"rest_s" smallint,
	"notes" text,
	CONSTRAINT "program_exercises_sets" CHECK ("program_exercises"."target_sets" is null or "program_exercises"."target_sets" > 0),
	CONSTRAINT "program_exercises_reps" CHECK ("program_exercises"."target_reps_min" is null or "program_exercises"."target_reps_max" is null or "program_exercises"."target_reps_max" >= "program_exercises"."target_reps_min"),
	CONSTRAINT "program_exercises_non_negative" CHECK (coalesce("program_exercises"."target_reps_min", 0) >= 0 and coalesce("program_exercises"."target_weight_kg", 0) >= 0 and coalesce("program_exercises"."target_duration_s", 0) >= 0 and coalesce("program_exercises"."target_distance_m", 0) >= 0 and coalesce("program_exercises"."rest_s", 0) >= 0)
);
--> statement-breakpoint
CREATE TABLE "programs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"trainer_id" uuid NOT NULL,
	"client_id" uuid,
	"source_program_id" uuid,
	"name_en" text NOT NULL,
	"name_ar" text,
	"notes" text,
	"status" "program_status" DEFAULT 'draft' NOT NULL,
	"starts_on" date,
	"ends_on" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "programs_assigned_has_start" CHECK ("programs"."client_id" is null or "programs"."status" = 'draft' or "programs"."starts_on" is not null),
	CONSTRAINT "programs_template_not_active" CHECK ("programs"."client_id" is not null or "programs"."status" in ('draft', 'archived')),
	CONSTRAINT "programs_dates" CHECK ("programs"."ends_on" is null or "programs"."starts_on" is null or "programs"."ends_on" >= "programs"."starts_on")
);
--> statement-breakpoint
CREATE TABLE "session_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"from_status" "session_status",
	"to_status" "session_status" NOT NULL,
	"actor_user_id" uuid,
	"reason" text,
	"data" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session_exercises" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"exercise_id" uuid NOT NULL,
	"order_index" smallint NOT NULL,
	"from_program_exercise_id" uuid,
	"added_live" boolean DEFAULT false NOT NULL,
	"target_sets" smallint,
	"target_reps_min" smallint,
	"target_reps_max" smallint,
	"target_weight_kg" numeric(6, 2),
	"target_duration_s" integer,
	"target_distance_m" numeric(9, 2),
	"target_level" numeric(4, 1),
	"rest_s" smallint,
	"notes" text,
	CONSTRAINT "session_exercises_sets" CHECK ("session_exercises"."target_sets" is null or "session_exercises"."target_sets" > 0),
	CONSTRAINT "session_exercises_reps" CHECK ("session_exercises"."target_reps_min" is null or "session_exercises"."target_reps_max" is null or "session_exercises"."target_reps_max" >= "session_exercises"."target_reps_min"),
	CONSTRAINT "session_exercises_non_negative" CHECK (coalesce("session_exercises"."target_reps_min", 0) >= 0 and coalesce("session_exercises"."target_weight_kg", 0) >= 0 and coalesce("session_exercises"."target_duration_s", 0) >= 0 and coalesce("session_exercises"."target_distance_m", 0) >= 0 and coalesce("session_exercises"."rest_s", 0) >= 0)
);
--> statement-breakpoint
CREATE TABLE "session_feedback" (
	"session_id" uuid PRIMARY KEY NOT NULL,
	"overall" "intensity",
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session_feedback_areas" (
	"session_id" uuid NOT NULL,
	"muscle_group_id" uuid NOT NULL,
	"intensity" "intensity" NOT NULL,
	"is_pain" boolean DEFAULT false NOT NULL,
	CONSTRAINT "session_feedback_areas_session_id_muscle_group_id_pk" PRIMARY KEY("session_id","muscle_group_id")
);
--> statement-breakpoint
CREATE TABLE "session_substitutions" (
	"session_id" uuid PRIMARY KEY NOT NULL,
	"activity" text NOT NULL,
	"duration_s" integer,
	"distance_m" numeric(9, 2),
	"intensity" "intensity",
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "session_substitutions_non_negative" CHECK (coalesce("session_substitutions"."duration_s", 0) >= 0 and coalesce("session_substitutions"."distance_m", 0) >= 0)
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" uuid NOT NULL,
	"trainer_id" uuid,
	"kind" "session_kind" NOT NULL,
	"status" "session_status" NOT NULL,
	"location" "session_location" NOT NULL,
	"location_note" text,
	"scheduled_start" timestamp with time zone,
	"scheduled_end" timestamp with time zone,
	"package_id" uuid,
	"program_day_id" uuid,
	"rescheduled_from_id" uuid,
	"rescheduled_to_id" uuid,
	"rest_reason" "rest_reason",
	"credit_outcome" "credit_outcome",
	"confirmed_at" timestamp with time zone,
	"started_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"trainer_note" text,
	"client_note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sessions_time_set" CHECK (("sessions"."scheduled_start" is null) = ("sessions"."scheduled_end" is null) and ("sessions"."scheduled_end" is null or "sessions"."scheduled_end" > "sessions"."scheduled_start")),
	CONSTRAINT "sessions_unscheduled_has_no_time" CHECK (("sessions"."status" = 'unscheduled') = ("sessions"."scheduled_start" is null)),
	CONSTRAINT "sessions_pt_has_trainer" CHECK ("sessions"."kind" <> 'pt' or "sessions"."trainer_id" is not null),
	CONSTRAINT "sessions_rested_has_reason" CHECK (("sessions"."status" = 'rested') = ("sessions"."rest_reason" is not null)),
	CONSTRAINT "sessions_rescheduled_has_target" CHECK (("sessions"."status" = 'rescheduled') = ("sessions"."rescheduled_to_id" is not null)),
	CONSTRAINT "sessions_package_is_pt" CHECK ("sessions"."package_id" is null or "sessions"."kind" = 'pt')
);
--> statement-breakpoint
CREATE TABLE "set_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_exercise_id" uuid NOT NULL,
	"set_index" smallint NOT NULL,
	"weight_kg" numeric(6, 2),
	"reps" smallint,
	"duration_s" integer,
	"distance_m" numeric(9, 2),
	"level" numeric(4, 1),
	"rpe" numeric(3, 1),
	"is_warmup" boolean DEFAULT false NOT NULL,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "set_logs_non_negative" CHECK (coalesce("set_logs"."weight_kg", 0) >= 0 and coalesce("set_logs"."reps", 0) >= 0 and coalesce("set_logs"."duration_s", 0) >= 0 and coalesce("set_logs"."distance_m", 0) >= 0 and coalesce("set_logs"."level", 0) >= 0),
	CONSTRAINT "set_logs_rpe" CHECK ("set_logs"."rpe" is null or "set_logs"."rpe" between 1 and 10)
);
--> statement-breakpoint
CREATE TABLE "trainer_availability" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"trainer_id" uuid NOT NULL,
	"weekday" smallint NOT NULL,
	"start_minute" smallint NOT NULL,
	"end_minute" smallint NOT NULL,
	"location" "session_location",
	CONSTRAINT "trainer_availability_weekday" CHECK ("trainer_availability"."weekday" between 0 and 6),
	CONSTRAINT "trainer_availability_minutes" CHECK ("trainer_availability"."start_minute" >= 0 and "trainer_availability"."end_minute" <= 1440 and "trainer_availability"."end_minute" > "trainer_availability"."start_minute")
);
--> statement-breakpoint
CREATE TABLE "trainer_clients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"trainer_id" uuid NOT NULL,
	"client_id" uuid NOT NULL,
	"status" "coaching_status" DEFAULT 'invited' NOT NULL,
	"goal_note" text,
	"injury_note" text,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ended_at" timestamp with time zone,
	CONSTRAINT "trainer_clients_ended_at" CHECK (("trainer_clients"."status" = 'ended') = ("trainer_clients"."ended_at" is not null))
);
--> statement-breakpoint
CREATE TABLE "trainers" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"business_name" text,
	"timezone" text DEFAULT 'Asia/Bahrain' NOT NULL,
	"default_session_minutes" smallint DEFAULT 60 NOT NULL,
	"default_cancellation_hours" smallint DEFAULT 24 NOT NULL,
	"default_free_late_cancels" smallint DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "trainers_session_minutes" CHECK ("trainers"."default_session_minutes" > 0),
	CONSTRAINT "trainers_cancellation_hours" CHECK ("trainers"."default_cancellation_hours" >= 0),
	CONSTRAINT "trainers_free_late_cancels" CHECK ("trainers"."default_free_late_cancels" >= 0)
);
--> statement-breakpoint
ALTER TABLE "client_invites" ADD CONSTRAINT "client_invites_trainer_client_id_trainer_clients_id_fk" FOREIGN KEY ("trainer_client_id") REFERENCES "public"."trainer_clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clients" ADD CONSTRAINT "clients_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exercise_muscles" ADD CONSTRAINT "exercise_muscles_exercise_id_exercises_id_fk" FOREIGN KEY ("exercise_id") REFERENCES "public"."exercises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exercise_muscles" ADD CONSTRAINT "exercise_muscles_muscle_group_id_muscle_groups_id_fk" FOREIGN KEY ("muscle_group_id") REFERENCES "public"."muscle_groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exercises" ADD CONSTRAINT "exercises_created_by_trainer_id_trainers_user_id_fk" FOREIGN KEY ("created_by_trainer_id") REFERENCES "public"."trainers"("user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "package_allowances" ADD CONSTRAINT "package_allowances_package_id_packages_id_fk" FOREIGN KEY ("package_id") REFERENCES "public"."packages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "package_template_allowances" ADD CONSTRAINT "package_template_allowances_template_id_package_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."package_templates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "package_templates" ADD CONSTRAINT "package_templates_trainer_id_trainers_user_id_fk" FOREIGN KEY ("trainer_id") REFERENCES "public"."trainers"("user_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "packages" ADD CONSTRAINT "packages_trainer_id_trainers_user_id_fk" FOREIGN KEY ("trainer_id") REFERENCES "public"."trainers"("user_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "packages" ADD CONSTRAINT "packages_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "packages" ADD CONSTRAINT "packages_template_id_package_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."package_templates"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "program_days" ADD CONSTRAINT "program_days_program_id_programs_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."programs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "program_exercises" ADD CONSTRAINT "program_exercises_program_day_id_program_days_id_fk" FOREIGN KEY ("program_day_id") REFERENCES "public"."program_days"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "program_exercises" ADD CONSTRAINT "program_exercises_exercise_id_exercises_id_fk" FOREIGN KEY ("exercise_id") REFERENCES "public"."exercises"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "programs" ADD CONSTRAINT "programs_trainer_id_trainers_user_id_fk" FOREIGN KEY ("trainer_id") REFERENCES "public"."trainers"("user_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "programs" ADD CONSTRAINT "programs_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "programs" ADD CONSTRAINT "programs_source_program_id_programs_id_fk" FOREIGN KEY ("source_program_id") REFERENCES "public"."programs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_events" ADD CONSTRAINT "session_events_session_id_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_events" ADD CONSTRAINT "session_events_actor_user_id_user_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_exercises" ADD CONSTRAINT "session_exercises_session_id_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_exercises" ADD CONSTRAINT "session_exercises_exercise_id_exercises_id_fk" FOREIGN KEY ("exercise_id") REFERENCES "public"."exercises"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_exercises" ADD CONSTRAINT "session_exercises_from_program_exercise_id_program_exercises_id_fk" FOREIGN KEY ("from_program_exercise_id") REFERENCES "public"."program_exercises"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_feedback" ADD CONSTRAINT "session_feedback_session_id_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_feedback_areas" ADD CONSTRAINT "session_feedback_areas_session_id_session_feedback_session_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."session_feedback"("session_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_feedback_areas" ADD CONSTRAINT "session_feedback_areas_muscle_group_id_muscle_groups_id_fk" FOREIGN KEY ("muscle_group_id") REFERENCES "public"."muscle_groups"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_substitutions" ADD CONSTRAINT "session_substitutions_session_id_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_trainer_id_trainers_user_id_fk" FOREIGN KEY ("trainer_id") REFERENCES "public"."trainers"("user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_package_id_packages_id_fk" FOREIGN KEY ("package_id") REFERENCES "public"."packages"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_program_day_id_program_days_id_fk" FOREIGN KEY ("program_day_id") REFERENCES "public"."program_days"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_rescheduled_from_id_sessions_id_fk" FOREIGN KEY ("rescheduled_from_id") REFERENCES "public"."sessions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_rescheduled_to_id_sessions_id_fk" FOREIGN KEY ("rescheduled_to_id") REFERENCES "public"."sessions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "set_logs" ADD CONSTRAINT "set_logs_session_exercise_id_session_exercises_id_fk" FOREIGN KEY ("session_exercise_id") REFERENCES "public"."session_exercises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trainer_availability" ADD CONSTRAINT "trainer_availability_trainer_id_trainers_user_id_fk" FOREIGN KEY ("trainer_id") REFERENCES "public"."trainers"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trainer_clients" ADD CONSTRAINT "trainer_clients_trainer_id_trainers_user_id_fk" FOREIGN KEY ("trainer_id") REFERENCES "public"."trainers"("user_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trainer_clients" ADD CONSTRAINT "trainer_clients_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trainers" ADD CONSTRAINT "trainers_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "client_invites_trainer_client_idx" ON "client_invites" USING btree ("trainer_client_id");--> statement-breakpoint
CREATE INDEX "packages_client_idx" ON "packages" USING btree ("client_id");--> statement-breakpoint
CREATE INDEX "packages_trainer_idx" ON "packages" USING btree ("trainer_id");--> statement-breakpoint
CREATE INDEX "program_days_program_idx" ON "program_days" USING btree ("program_id","order_index");--> statement-breakpoint
CREATE INDEX "program_exercises_day_idx" ON "program_exercises" USING btree ("program_day_id","order_index");--> statement-breakpoint
CREATE UNIQUE INDEX "programs_one_active_per_client" ON "programs" USING btree ("client_id") WHERE "programs"."client_id" is not null and "programs"."status" = 'active';--> statement-breakpoint
CREATE INDEX "programs_trainer_idx" ON "programs" USING btree ("trainer_id");--> statement-breakpoint
CREATE INDEX "session_events_session_idx" ON "session_events" USING btree ("session_id","created_at");--> statement-breakpoint
CREATE INDEX "session_exercises_session_idx" ON "session_exercises" USING btree ("session_id","order_index");--> statement-breakpoint
CREATE INDEX "session_exercises_exercise_idx" ON "session_exercises" USING btree ("exercise_id");--> statement-breakpoint
CREATE INDEX "sessions_client_start_idx" ON "sessions" USING btree ("client_id","scheduled_start");--> statement-breakpoint
CREATE INDEX "sessions_trainer_start_idx" ON "sessions" USING btree ("trainer_id","scheduled_start");--> statement-breakpoint
CREATE INDEX "sessions_package_idx" ON "sessions" USING btree ("package_id");--> statement-breakpoint
CREATE UNIQUE INDEX "set_logs_order" ON "set_logs" USING btree ("session_exercise_id","set_index");--> statement-breakpoint
CREATE INDEX "trainer_availability_trainer_idx" ON "trainer_availability" USING btree ("trainer_id","weekday");--> statement-breakpoint
CREATE UNIQUE INDEX "trainer_clients_open_unique" ON "trainer_clients" USING btree ("trainer_id","client_id") WHERE "trainer_clients"."status" <> 'ended';--> statement-breakpoint
CREATE INDEX "trainer_clients_client_idx" ON "trainer_clients" USING btree ("client_id");