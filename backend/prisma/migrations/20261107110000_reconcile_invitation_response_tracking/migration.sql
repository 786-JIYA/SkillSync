-- Reconcile invitation and join request response tracking.
-- Safe for databases where these columns already exist.

ALTER TABLE "invitations"
ADD COLUMN IF NOT EXISTS "responded_at" TIMESTAMP(3);

ALTER TABLE "join_requests"
ADD COLUMN IF NOT EXISTS "responded_at" TIMESTAMP(3);