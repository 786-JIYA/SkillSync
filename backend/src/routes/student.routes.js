const express = require("express");
const router = express.Router();

const studentController = require("../controllers/student.controller");
const authenticateStudent = require("../middlewares/auth.middleware");

// Add or update student skill
router.put(
    "/me/skills/:skillId",
    authenticateStudent,
    studentController.addStudentSkill
);

// Delete a skill from student's profile
router.delete(
    "/me/skills/:skillId",
    authenticateStudent,
    studentController.deleteStudentSkill
);

module.exports = router;