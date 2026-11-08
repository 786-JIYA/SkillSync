
const { Prisma } = require("@prisma/client");
const prisma = require("../lib/prisma");
const { sendEmail } = require("./email.service");

// CUSTOM ERROR
const createError = (message, statusCode, code) => {
    const error = new Error(message);
    error._statusCode = statusCode;
    error._code = code;
    return error;
};

// VALIDATE STRING INPUT
const validateString = (value, fieldName, message) => {
    if (typeof value !== "string" || !value.trim()) {
        throw createError(
            message || `A valid ${fieldName} is required`,
            400,
            "VALIDATION_ERROR"
        );
    }

    return value.trim();
};

// CHECK PRISMA UNIQUE CONSTRAINT ERROR
const isUniqueConstraintError = (error) => {
    return (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
    );
};

// CREATE INVITATION
const createInvitation = async (teamId, inviterId, inviteeId) => {
    teamId = validateString(teamId, "team ID");
    inviterId = validateString(inviterId, "inviter ID");
    inviteeId = validateString(inviteeId, "invitee ID");

    // 1. Check whether the team exists.
    const team = await prisma.team.findUnique({
        where: { id: teamId },
        select: {
            id: true,
            project: {
                select: {
                    id: true,
                    creatorId: true,
                    status: true,
                },
            },
        },
    });

    if (!team) {
        throw createError("Team not found", 404, "TEAM_NOT_FOUND");
    }

    // 2. Only the project creator can send invitations.
    if (team.project.creatorId !== inviterId) {
        throw createError(
            "Only the project creator can send invitations",
            403,
            "FORBIDDEN"
        );
    }

    // 3. Prevent self-invitation.
    if (inviterId === inviteeId) {
        throw createError(
            "You cannot invite yourself",
            422,
            "SELF_INVITE"
        );
    }

    // 4. Check whether the invitee exists.
    const invitee = await prisma.student.findUnique({
        where: { id: inviteeId },
        select: {
            id: true,
            name: true,
            email: true,
        },
    });

    if (!invitee) {
        throw createError(
            "Invited student not found",
            404,
            "STUDENT_NOT_FOUND"
        );
    }

    // 5. Check existing team membership.
    const existingMembership = await prisma.teamMember.findUnique({
        where: {
            teamId_studentId: {
                teamId,
                studentId: inviteeId,
            },
        },
        select: { teamId: true },
    });

    if (existingMembership) {
        throw createError(
            "This student is already a member of the team",
            409,
            "ALREADY_MEMBER"
        );
    }

    // 6. Only OPEN projects can receive invitations.
    if (team.project.status !== "OPEN") {
        throw createError(
            "Invitations can only be sent for OPEN projects",
            422,
            "PROJECT_NOT_OPEN"
        );
    }

    // 7. Check for an existing pending invitation.
    const existingInvitation = await prisma.invitation.findFirst({
        where: {
            teamId,
            inviteeId,
            status: "PENDING",
        },
        select: { id: true },
    });

    if (existingInvitation) {
        throw createError(
            "A pending invitation already exists for this student",
            409,
            "PENDING_INVITATION_EXISTS"
        );
    }

    // 8. Create invitation.
    // The database partial unique index protects against concurrent requests.
    let invitation;

    try {
        invitation = await prisma.invitation.create({
            data: {
                teamId,
                inviterId,
                inviteeId,
            },
            select: {
                id: true,
                teamId: true,
                inviterId: true,
                inviteeId: true,
                status: true,
                createdAt: true,
            },
        });
    } catch (error) {
        if (isUniqueConstraintError(error)) {
            throw createError(
                "A pending invitation already exists for this student",
                409,
                "PENDING_INVITATION_EXISTS"
            );
        }

        throw error;
    }

    // 9. Send invitation email.
    await sendEmail({
        to: invitee.email,
        subject: "New Team Invitation - SkillSync",
        text: `Hello ${invitee.name},

You have received a team invitation on SkillSync.

Log in to your SkillSync account to view and respond to the invitation.

Regards,
SkillSync Team`,
    });

    // 10. Return invitation.
    return invitation;
};


// GET MY RECEIVED INVITATIONS
const getMyInvitations = async (studentId, status) => {
    studentId = validateString(studentId, "student ID");

    const where = {
        inviteeId: studentId,
    };

    // Apply status filter only when provided.
    if (status !== undefined) {
        const allowedStatuses = [
            "PENDING",
            "ACCEPTED",
            "REJECTED",
            "CANCELLED",
        ];

        if (!allowedStatuses.includes(status)) {
            throw createError(
                "Invalid invitation status",
                400,
                "VALIDATION_ERROR"
            );
        }

        where.status = status;
    }

    const invitations = await prisma.invitation.findMany({
        where,
        orderBy: {
            createdAt: "desc",
        },
        select: {
            id: true,
            teamId: true,
            inviterId: true,
            inviteeId: true,
            status: true,
            createdAt: true,
            respondedAt: true,

            inviter: {
                select: {
                    id: true,
                    name: true,
                    department: true,
                    classYear: true,
                },
            },

            team: {
                select: {
                    id: true,
                    project: {
                        select: {
                            id: true,
                            title: true,
                            status: true,
                        },
                    },
                },
            },
        },
    });

    return invitations;
};


// GET TEAM INVITATIONS
const getTeamInvitations = async (teamId, requesterId) => {
    teamId = validateString(teamId, "team ID");
    requesterId = validateString(requesterId, "requester ID");

    // 1. Check whether the team exists.
    const team = await prisma.team.findUnique({
        where: { id: teamId },
        select: {
            id: true,
            project: {
                select: {
                    creatorId: true,
                },
            },
        },
    });

    if (!team) {
        throw createError("Team not found", 404, "TEAM_NOT_FOUND");
    }

    // 2. Only the project creator can view team invitations.
    if (team.project.creatorId !== requesterId) {
        throw createError(
            "Only the project creator can view team invitations",
            403,
            "FORBIDDEN"
        );
    }

    // 3. Fetch invitations with safe student details.
    const invitations = await prisma.invitation.findMany({
        where: { teamId },
        orderBy: {
            createdAt: "desc",
        },
        select: {
            id: true,
            teamId: true,
            inviterId: true,
            inviteeId: true,
            status: true,
            createdAt: true,
            updatedAt: true,
            respondedAt: true,

            invitee: {
                select: {
                    id: true,
                    name: true,
                    department: true,
                    classYear: true,
                },
            },
        },
    });

    return invitations;
};


// RESPOND TO INVITATION
const respondToInvitation = async (
    invitationId,
    studentId,
    newStatus
) => {
    invitationId = validateString(invitationId, "invitation ID");
    studentId = validateString(studentId, "student ID");

    // 1. Validate requested status.
    const allowedStatuses = [
        "ACCEPTED",
        "REJECTED",
        "CANCELLED",
    ];

    if (!allowedStatuses.includes(newStatus)) {
        throw createError(
            "Invalid invitation response status",
            400,
            "VALIDATION_ERROR"
        );
    }

    return prisma.$transaction(async (tx) => {

        // 2. Fetch the team ID.
        const invitationTeam = await tx.invitation.findUnique({
            where: { id: invitationId },
            select: { teamId: true },
        });

        if (!invitationTeam) {
            throw createError(
                "Invitation not found",
                404,
                "INVITATION_NOT_FOUND"
            );
        }

        // 3. Lock the team row to serialize membership acceptances.
        await tx.$queryRaw`
            SELECT id
            FROM teams
            WHERE id = ${invitationTeam.teamId}
            FOR UPDATE
        `;

        // 4. Re-fetch invitation after acquiring the lock.
        const invitation = await tx.invitation.findUnique({
            where: { id: invitationId },
            select: {
                id: true,
                teamId: true,
                inviterId: true,
                inviteeId: true,
                status: true,

                team: {
                    select: {
                        project: {
                            select: {
                                creatorId: true,
                                status: true,
                                preferredTeamSize: true,
                            },
                        },
                    },
                },
            },
        });

        if (!invitation) {
            throw createError(
                "Invitation not found",
                404,
                "INVITATION_NOT_FOUND"
            );
        }

        // 5. Check authorization.
        const isInvitee = invitation.inviteeId === studentId;

        const isCreator =
            invitation.team.project.creatorId === studentId;

        if (
            (newStatus === "CANCELLED" && !isCreator) ||
            (newStatus !== "CANCELLED" && !isInvitee)
        ) {
            throw createError(
                "You are not allowed to respond to this invitation",
                403,
                "FORBIDDEN"
            );
        }

        // 6. Only PENDING invitations can be updated.
        if (invitation.status !== "PENDING") {
            throw createError(
                "This invitation has already been responded to",
                409,
                "INVALID_STATE_TRANSITION"
            );
        }

        // 7. Acceptance requires an OPEN project.
        if (
            newStatus === "ACCEPTED" &&
            invitation.team.project.status !== "OPEN"
        ) {
            throw createError(
                "This project is no longer open",
                422,
                "PROJECT_NOT_OPEN"
            );
        }

        // 8. Check membership and team capacity before acceptance.
        if (newStatus === "ACCEPTED") {

            const existingMembership = await tx.teamMember.findUnique({
                where: {
                    teamId_studentId: {
                        teamId: invitation.teamId,
                        studentId,
                    },
                },
                select: {
                    teamId: true,
                },
            });

            if (existingMembership) {
                throw createError(
                    "You are already a member of this team",
                    409,
                    "ALREADY_MEMBER"
                );
            }

            const currentMemberCount = await tx.teamMember.count({
                where: {
                    teamId: invitation.teamId,
                },
            });

            const preferredTeamSize =
                invitation.team.project.preferredTeamSize;

            if (currentMemberCount >= preferredTeamSize) {
                throw createError(
                    "This team has already reached its preferred size",
                    409,
                    "TEAM_FULL"
                );
            }
        }

        // 9. Atomically claim the pending invitation.
        const respondedAt = new Date();

        const statusUpdate = await tx.invitation.updateMany({
            where: {
                id: invitationId,
                status: "PENDING",
            },
            data: {
                status: newStatus,
                respondedAt,
            },
        });

        if (statusUpdate.count === 0) {
            throw createError(
                "This invitation has already been responded to",
                409,
                "INVALID_STATE_TRANSITION"
            );
        }

        // 10. Handle acceptance.
        if (newStatus === "ACCEPTED") {

            try {
                await tx.teamMember.create({
                    data: {
                        teamId: invitation.teamId,
                        studentId,
                        role: "MEMBER",
                    },
                });
            } catch (error) {
                if (isUniqueConstraintError(error)) {
                    throw createError(
                        "You are already a member of this team",
                        409,
                        "ALREADY_MEMBER"
                    );
                }

                throw error;
            }

            // 11. Cancel other pending invitations for this team/student.
            await tx.invitation.updateMany({
                where: {
                    teamId: invitation.teamId,
                    inviteeId: studentId,
                    status: "PENDING",
                    NOT: {
                        id: invitationId,
                    },
                },
                data: {
                    status: "CANCELLED",
                    respondedAt,
                },
            });

            // 12. Cancel pending join requests for this team/student.
            await tx.joinRequest.updateMany({
                where: {
                    teamId: invitation.teamId,
                    studentId,
                    status: "PENDING",
                },
                data: {
                    status: "CANCELLED",
                    respondedAt,
                },
            });
        }

        // 13. Return updated invitation.
        const updatedInvitation = await tx.invitation.findUnique({
            where: {
                id: invitationId,
            },
            select: {
                id: true,
                teamId: true,
                inviterId: true,
                inviteeId: true,
                status: true,
                createdAt: true,
                respondedAt: true,
            },
        });

        return updatedInvitation;
    });
};


module.exports = {
    createInvitation,
    getMyInvitations,
    getTeamInvitations,
    respondToInvitation,
};
