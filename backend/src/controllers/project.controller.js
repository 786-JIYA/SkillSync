
const projectService = require("../services/project.service");

const createProject = async (req, res) => {
    try {
        const project = await projectService.createProject(
            req.student.id,
            req.body
        );

        return res.status(201).json({
            success: true,
            message: "Project created successfully",
            data: project,
        });

    } catch (error) {
        console.error("Create project error:", error);

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.statusCode
                ? error.message
                : "Internal server error",
            ...(error.code && { code: error.code }),
        });
    }
};


// GET: Get all projects
const getAllProjects = async (req, res) => {
    try {
        const result = await projectService.getAllProjects(req.query);

        return res.status(200).json({
            success: true,
            message: "Projects fetched successfully",
            data: result,
        });

    } catch (error) {
        console.error("Get all projects error:", error);

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.statusCode
                ? error.message
                : "Internal server error",
            ...(error.code && { code: error.code }),
        });
    }
};

const getMyProjects = async (req, res) => {
    try {
        const projects = await projectService.getMyProjects(
            req.student.id
        );

        return res.status(200).json({
            success: true,
            message: "Your projects fetched successfully",
            data: projects,
        });
    } catch (error) {
        console.error("Get my projects error:", error);

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.statusCode
                ? error.message
                : "Internal server error",
        });
    }
};

const getProjectById = async (req, res) => {
    try {
        const project = await projectService.getProjectById(
            req.params.projectId
        );

        return res.status(200).json({
            success: true,
            message: "Project fetched successfully",
            data: project,
        });

    } catch (error) {
        console.error("Get project by ID error:", error);

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.statusCode
                ? error.message
                : "Internal server error",
            ...(error.code && { code: error.code }),
        });
    }
};


const updateProject = async (req, res) => {
    try {
        const project = await projectService.updateProject(
            req.params.projectId,
            req.student.id,
            req.body
        );

        return res.status(200).json({
            success: true,
            message: "Project updated successfully",
            data: project,
        });

    } catch (error) {
        console.error("Update project error:", error);

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.statusCode
                ? error.message
                : "Internal server error",
            ...(error.code && { code: error.code }),
        });
    }
};


const replaceRequiredSkills = async (req, res) => {
    try {
        const project = await projectService.replaceRequiredSkills(
            req.params.projectId,
            req.student.id,
            req.body.requiredSkills
        );

        return res.status(200).json({
            success: true,
            message: "Project required skills updated successfully",
            data: project,
        });

    } catch (error) {
        console.error("Replace required skills error:", error);

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.statusCode
                ? error.message
                : "Internal server error",
            ...(error.code && { code: error.code }),
        });
    }
};





module.exports = {
    createProject,
    getAllProjects,
    getMyProjects,
    getProjectById,
    updateProject,
    replaceRequiredSkills
};
