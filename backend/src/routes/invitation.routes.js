const express = require("express");
const router = express.Router();

const authenticateStudent = require("../middlewares/auth.middleware");
const invitationController = require("../controllers/invitation.controller");

// Get invitations received by the logged-in student
router.get(
    "/me",
    authenticateStudent,
    invitationController.getMyInvitations
);

// Respond to or cancel an invitation
router.patch(
    "/:invitationId",
    authenticateStudent,
    invitationController.respondToInvitation
);

module.exports = router;