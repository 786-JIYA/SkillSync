
const express = require("express");
const router = express.Router();

const authenticateStudent = require("../middlewares/auth.middleware");
const teamController = require("../controllers/team.controller");
const invitationController = require("../controllers/invitation.controller");
const joinRequestController = require("../controllers/join-request.controller");

// Get team details
router.get(
    "/:teamId",
    authenticateStudent,
    teamController.getTeamById
);

// Leave a team
router.delete(
    "/:teamId/members/me",
    authenticateStudent,
    teamController.leaveTeam
);

// Send an invitation
router.post(
    "/:teamId/invitations",
    authenticateStudent,
    invitationController.createInvitation
);

// Get invitations for a team (creator only)
router.get(
    "/:teamId/invitations",
    authenticateStudent,
    invitationController.getTeamInvitations
);

// Join request routes
router.post(
    "/:teamId/join-requests",
    authenticateStudent,
    joinRequestController.createJoinRequest
);

router.get(
    "/:teamId/join-requests",
    authenticateStudent,
    joinRequestController.getTeamJoinRequests
);

module.exports = router;
