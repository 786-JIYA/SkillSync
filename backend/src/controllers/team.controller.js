
const teamService = require("../services/team.service");

// GET /api/v1/teams/:teamId
const getTeamById = async (req, res) => {
    try {
        const team = await teamService.getTeamById(
            req.params.teamId,
            req.student.id
        );

        return res.status(200).json({
            success: true,
            message: "Team fetched successfully",
            data: team,
        });
    } catch (error) {
        console.error("Get team error:", error);

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.statusCode
                ? error.message
                : "Internal server error",
            ...(error.code && { code: error.code }),
        });
    }
};

// DELETE /api/v1/teams/:teamId/members/me
const leaveTeam = async (req, res) => {
    try {
        const result = await teamService.leaveTeam(
            req.params.teamId,
            req.student.id
        );

        return res.status(200).json({
            success: true,
            message: "You have left the team successfully",
            data: result,
        });
    } catch (error) {
        console.error("Leave team error:", error);

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
    getTeamById,
    leaveTeam,
};
