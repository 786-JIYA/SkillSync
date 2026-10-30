const skillService = require("../services/skill.service");

const getAllSkills = async (req, res) => {
    try {
        const skills = await skillService.getAllSkills(req.query);

        return res.status(200).json({
            success: true,
            data: skills
        });

    } catch (error) {
        console.error("Get skills error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch skills"
        });
    }
};

module.exports = {
    getAllSkills
};