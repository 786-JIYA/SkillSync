-- Ensure only one pending invitation exists
-- for a team and invitee combination.

CREATE UNIQUE INDEX "invitations_one_pending_per_team_invitee"
ON "invitations" ("team_id", "invitee_id")
WHERE "status" = 'PENDING';


-- Ensure only one pending join request exists
-- for a team and student combination.

CREATE UNIQUE INDEX "join_requests_one_pending_per_team_student"
ON "join_requests" ("team_id", "student_id")
WHERE "status" = 'PENDING';