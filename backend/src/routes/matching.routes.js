const express = require("express");

const matchingController = require("../controllers/matching.controller");
const authenticateStudent = require("../middlewares/auth.middleware");

const router = express.Router();

// 9.2 Recommended projects
router.get(
    "/matching/projects",
    authenticateStudent,
    matchingController.getRecommendedProjects
);

// 9.3 Team skill coverage
router.get(
    "/teams/:teamId/skill-coverage",
    authenticateStudent,
    matchingController.getTeamSkillCoverage
);

// 9.4 Complete my team (creator only, enforced in the service)
router.get(
    "/teams/:teamId/matching/candidates",
    authenticateStudent,
    matchingController.getMatchingCandidates
);

module.exports = router;