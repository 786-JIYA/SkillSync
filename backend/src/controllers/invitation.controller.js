
const invitationService = require("../services/invitation.service");

// POST /api/v1/teams/:teamId/invitations
const createInvitation = async (req, res, next) => {
    try {
        const invitation = await invitationService.createInvitation(
            req.params.teamId,
            req.student.id,
            req.body?.inviteeId
        );

        return res.status(201).json({
            success: true,
            message: "Invitation sent successfully",
            data: invitation,
        });
    } catch (error) {
        next(error);
    }
};

// GET /api/v1/teams/:teamId/invitations
const getTeamInvitations = async (req, res, next) => {
    try {
        const invitations = await invitationService.getTeamInvitations(
            req.params.teamId,
            req.student.id
        );

        return res.status(200).json({
            success: true,
            message: "Team invitations fetched successfully",
            data: invitations,
        });
    } catch (error) {
        next(error);
    }
};

// GET /api/v1/invitations/me
const getMyInvitations = async (req, res, next) => {
    try {
        const invitations = await invitationService.getMyInvitations(
            req.student.id,
            req.query.status
        );

        return res.status(200).json({
            success: true,
            message: "Your invitations fetched successfully",
            data: invitations,
        });
    } catch (error) {
        next(error);
    }
};

// PATCH /api/v1/invitations/:invitationId
const respondToInvitation = async (req, res, next) => {
    try {
        if (
            !req.body ||
            typeof req.body !== "object" ||
            Array.isArray(req.body)
        ) {
            return res.status(400).json({
                success: false,
                message: "Request body must be a valid JSON object",
                code: "VALIDATION_ERROR",
            });
        }

        const { status } = req.body;

        const invitation = await invitationService.respondToInvitation(
            req.params.invitationId,
            req.student.id,
            status
        );

        return res.status(200).json({
            success: true,
            message: "Invitation updated successfully",
            data: invitation,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createInvitation,
    getTeamInvitations,
    getMyInvitations,
    respondToInvitation,
};
