-- A trainer can't be booked into two overlapping PT sessions. Only sessions
-- that still hold the time slot count; cancelled, rescheduled and finished
-- ones free it. Deferrable so a reschedule can create the new session and
-- release the old slot in one transaction.
CREATE EXTENSION IF NOT EXISTS btree_gist;
--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_no_trainer_overlap"
  EXCLUDE USING gist (
    "trainer_id" WITH =,
    tstzrange("scheduled_start", "scheduled_end") WITH &&
  )
  WHERE ("kind" = 'pt' AND "status" IN ('booked', 'confirmed', 'in_progress'))
  DEFERRABLE INITIALLY IMMEDIATE;
--> statement-breakpoint
-- Trainer accounts created before the trainers table existed.
INSERT INTO "trainers" ("user_id")
  SELECT "id" FROM "user" WHERE "role" = 'trainer'
  ON CONFLICT DO NOTHING;
