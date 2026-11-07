
const joinRequestService = require("../services/join-request.service");

// POST /teams/:teamId/join-requests
const createJoinRequest = async (req, res) => {
    try {
        const joinRequest = await joinRequestService.createJoinRequest(
            req.params.teamId,
            req.student.id,
            req.body?.message
        );

        return res.status(201).json({
            success: true,
            message: "Join request sent successfully",
            data: joinRequest,
        });
    } catch (error) {
        console.error("Create join request error:", error);

        return res.status(error._statusCode || 500).json({
            success: false,
            message: error._statusCode
                ? error.message
                : "Internal server error",
            ...(error._code && { code: error._code }),
        });
    }
};

// GET /join-requests/me
const getMyJoinRequests = async (req, res) => {
    try {
        const joinRequests = await joinRequestService.getMyJoinRequests(
            req.student.id,
            req.query.status
        );

        return res.status(200).json({
            success: true,
            message: "Your join requests fetched successfully",
            data: joinRequests,
        });
    } catch (error) {
        console.error("Get my join requests error:", error);

        return res.status(error._statusCode || 500).json({
            success: false,
            message: error._statusCode
                ? error.message
                : "Internal server error",
            ...(error._code && { code: error._code }),
        });
    }
};

// GET /teams/:teamId/join-requests
const getTeamJoinRequests = async (req, res) => {
    try {
        const joinRequests = await joinRequestService.getTeamJoinRequests(
            req.params.teamId,
            req.student.id,
            req.query.status
        );

        return res.status(200).json({
            success: true,
            message: "Team join requests fetched successfully",
            data: joinRequests,
        });
    } catch (error) {
        console.error("Get team join requests error:", error);

        return res.status(error._statusCode || 500).json({
            success: false,
            message: error._statusCode
                ? error.message
                : "Internal server error",
            ...(error._code && { code: error._code }),
        });
    }
};

// PATCH /join-requests/:requestId
const respondToJoinRequest = async (req, res) => {
    try {
        if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
            return res.status(400).json({
                success: false,
                message: "Request body must be a valid JSON object",
                code: "VALIDATION_ERROR",
            });
        }

        const { status } = req.body;

        const joinRequest = await joinRequestService.respondToJoinRequest(
            req.params.requestId,
            req.student.id,
            status
        );

        return res.status(200).json({
            success: true,
            message: "Join request updated successfully",
            data: joinRequest,
        });
    } catch (error) {
        console.error("Respond to join request error:", error);

        return res.status(error._statusCode || 500).json({
            success: false,
            message: error._statusCode
                ? error.message
                : "Internal server error",
            ...(error._code && { code: error._code }),
        });
    }
};

module.exports = {
    createJoinRequest,
    getMyJoinRequests,
    getTeamJoinRequests,
    respondToJoinRequest,
};
