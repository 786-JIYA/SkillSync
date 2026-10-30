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

        return res.status(500).json({
            success: false,
            message: "Failed to add student skill"
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

        return res.status(500).json({
            success: false,
            message: "Failed to delete student skill"
        });
    }
};

module.exports = {
    addStudentSkill,
    deleteStudentSkill
};