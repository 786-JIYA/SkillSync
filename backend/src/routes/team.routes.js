
const express = require("express");
const router = express.Router();

const authenticateStudent = require("../middlewares/auth.middleware");
const teamController = require("../controllers/team.controller");

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

module.exports = router;
