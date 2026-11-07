
const express = require("express");
const router = express.Router();

const projectController = require("../controllers/project.controller");
const authenticateStudent = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validate.middleware");

const {
    createProjectSchema,
    updateProjectSchema,
    replaceRequiredSkillsSchema
} = require("../validations/project.validation");

router.get(
    "/",
    authenticateStudent,
    projectController.getAllProjects
);

// GET /api/v1/projects/me
router.get(
    "/me",
    authenticateStudent,
    projectController.getMyProjects
);

router.get(
    "/:projectId",
    authenticateStudent,
    projectController.getProjectById
);



// POST /api/v1/projects
router.post(
    "/",
    authenticateStudent,
    validate(createProjectSchema),
    projectController.createProject
);

router.patch(
    "/:projectId",
    authenticateStudent,
    validate(updateProjectSchema),
    projectController.updateProject
);

router.put(
    "/:projectId/required-skills",
    authenticateStudent,
    validate(replaceRequiredSkillsSchema),
    projectController.replaceRequiredSkills
);

module.exports = router;
