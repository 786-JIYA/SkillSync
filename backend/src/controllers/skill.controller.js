const skillService = require("../services/skill.service");

const getAllSkills = async (req, res) => {
    try {
        const skills = await skillService.getAllSkills(req.query);

        return res.status(200).json({
            success: true,
            data: skills
        });

    } catch (error) {
        console.error("Get all skills error:", error);

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.statusCode
                ? error.message
                : "Internal server error"
        });
    }
};

module.exports = {
    getAllSkills
};