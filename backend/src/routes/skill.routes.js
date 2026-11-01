const express = require("express");
const router = express.Router();

const skillController = require("../controllers/skill.controller");
const authenticateStudent = require("../middlewares/auth.middleware");

// GET all available skills
router.get(
    "/",
    authenticateStudent,
    skillController.getAllSkills
);

module.exports = router;