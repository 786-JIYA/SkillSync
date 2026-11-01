const studentService = require("../services/student.service");

const addStudentSkill = async (req, res) => {
    try {
        const studentId = req.student.id;
        const { skillId } = req.params;
        const { proficiency } = req.body;

        const result = await studentService.addStudentSkill(
            studentId,
            skillId,
            proficiency
        );

        return res.status(200).json({
            success: true,
            message: "Student skill added successfully",
            data: result
        });

    } catch (error) {
        console.error("Add student skill error:", error);

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.statusCode
                ? error.message
                : "Internal server error"
        });
    }
};

const deleteStudentSkill = async (req, res) => {
    try {
        const studentId = req.student.id;
        const { skillId } = req.params;

        await studentService.deleteStudentSkill(studentId, skillId);

        return res.status(200).json({
            success: true,
            message: "Student skill deleted successfully",
            data: null
        });

    } catch (error) {
        console.error("Delete student skill error:", error);

        const statusCode =
            error.statusCode ||
            (error.code === "P2025" ? 404 : 500);

        return res.status(statusCode).json({
            success: false,
            message: statusCode === 500
                ? "Internal server error"
                : error.message
        });
    }
};

const getStudentSkills = async (req, res) => {
    try {
        const studentId = req.student.id;

        const skills = await studentService.getStudentSkills(studentId);

        return res.status(200).json({
            success: true,
            data: {
                skills
            }
        });
    } catch (error) {
        console.error("Get student skills error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch student skills"
        });
    }
};

module.exports = {
    addStudentSkill,
    deleteStudentSkill,
    getStudentSkills
};