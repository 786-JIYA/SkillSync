
const prisma = require("../lib/prisma");
const { Prisma } = require("@prisma/client");

const createError = (message, statusCode, code) => {
    const error = new Error(message);
    error._statusCode = statusCode;
    error._code = code;
    return error;
};

const validateString = (value, fieldName) => {
    if (typeof value !== "string" || !value.trim()) {
        throw createError(
            `A valid ${fieldName} is required`,
            400,
            "VALIDATION_ERROR"
        );
    }

    return value.trim();
};

const isUniqueConstraintError = (error) =>
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002";

const VALID_STATUSES = [
    "PENDING",
    "ACCEPTED",
    "REJECTED",
    "CANCELLED",
];

// 1. Create a join request
const createJoinRequest = async (teamId, studentId, message) => {
    teamId = validateString(teamId, "team ID");
    studentId = validateString(studentId, "student ID");

    if (message !== undefined && message !== null) {
        if (typeof message !== "string") {
            throw createError(
                "Message must be a string",
                400,
                "VALIDATION_ERROR"
            );
        }

        if (message.length > 500) {
            throw createError(
                "Message cannot exceed 500 characters",
                400,
                "VALIDATION_ERROR"
            );
        }
    }

    const normalizedMessage = message?.trim() || null;

    const team = await prisma.team.findUnique({
        where: { id: teamId },
        include: {
            project: {
                select: {
                    status: true,
                },
            },
        },
    });

    if (!team) {
        throw createError("Team not found", 404, "TEAM_NOT_FOUND");
    }

    if (team.project.status !== "OPEN") {
        throw createError(
            "Cannot request to join a team for a project that is not open",
            422,
            "PROJECT_NOT_OPEN"
        );
    }

    const student = await prisma.student.findUnique({
        where: { id: studentId },
        select: { id: true },
    });

    if (!student) {
        throw createError("Student not found", 404, "STUDENT_NOT_FOUND");
    }

    const existingMember = await prisma.teamMember.findUnique({
        where: {
            teamId_studentId: {
                teamId,
                studentId,
            },
        },
    });

    if (existingMember) {
        throw createError(
            "You are already a member of this team",
            409,
            "ALREADY_MEMBER"
        );
    }

    const existingRequest = await prisma.joinRequest.findFirst({
        where: {
            teamId,
            studentId,
            status: "PENDING",
        },
    });

    if (existingRequest) {
        throw createError(
            "A pending join request already exists",
            409,
            "PENDING_REQUEST_EXISTS"
        );
    }

    try {
        return await prisma.joinRequest.create({
            data: {
                teamId,
                studentId,
                message: normalizedMessage,
            },
            select: {
                id: true,
                teamId: true,
                studentId: true,
                message: true,
                status: true,
                createdAt: true,
                respondedAt: true,
            },
        });
    } catch (error) {
        if (isUniqueConstraintError(error)) {
            throw createError(
                "A pending join request already exists",
                409,
                "PENDING_REQUEST_EXISTS"
            );
        }

        throw error;
    }
};

// 2. Get join requests received by the logged-in student
const getMyJoinRequests = async (studentId, status) => {
    studentId = validateString(studentId, "student ID");

    if (
        status !== undefined &&
        status !== null &&
        status !== "" &&
        !VALID_STATUSES.includes(status)
    ) {
        throw createError(
            "Invalid join request status",
            400,
            "VALIDATION_ERROR"
        );
    }

    return prisma.joinRequest.findMany({
        where: {
            studentId,
            ...(status && { status }),
        },
        orderBy: {
            createdAt: "desc",
        },
        select: {
            id: true,
            teamId: true,
            studentId: true,
            message: true,
            status: true,
            createdAt: true,
            respondedAt: true,
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
};

// 3. Get join requests for a team (project creator only)
const getTeamJoinRequests = async (teamId, requesterId, status) => {
    teamId = validateString(teamId, "team ID");
    requesterId = validateString(requesterId, "requester ID");

    if (
        status !== undefined &&
        status !== null &&
        status !== "" &&
        !VALID_STATUSES.includes(status)
    ) {
        throw createError(
            "Invalid join request status",
            400,
            "VALIDATION_ERROR"
        );
    }

    const team = await prisma.team.findUnique({
        where: { id: teamId },
        include: {
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

    if (team.project.creatorId !== requesterId) {
        throw createError(
            "Only the project creator can view team join requests",
            403,
            "FORBIDDEN"
        );
    }

    return prisma.joinRequest.findMany({
        where: {
            teamId,
            ...(status && { status }),
        },
        orderBy: {
            createdAt: "desc",
        },
        select: {
            id: true,
            teamId: true,
            studentId: true,
            message: true,
            status: true,
            createdAt: true,
            respondedAt: true,
            student: {
                select: {
                    id: true,
                    name: true,
                    department: true,
                    classYear: true,
                },
            },
        },
    });
};

// 4. Respond to a join request
const respondToJoinRequest = async (
    requestId,
    studentId,
    newStatus
) => {
    requestId = validateString(requestId, "join request ID");
    studentId = validateString(studentId, "student ID");

    const allowedResponses = [
        "ACCEPTED",
        "REJECTED",
        "CANCELLED",
    ];

    if (!allowedResponses.includes(newStatus)) {
        throw createError(
            "Invalid join request response status",
            400,
            "VALIDATION_ERROR"
        );
    }

    return prisma.$transaction(async (tx) => {

        // 1. Fetch the team ID.
        const requestTeam = await tx.joinRequest.findUnique({
            where: { id: requestId },
            select: {
                teamId: true,
            },
        });

        if (!requestTeam) {
            throw createError(
                "Join request not found",
                404,
                "REQUEST_NOT_FOUND"
            );
        }

        // 2. Lock the team row to serialize membership acceptances.
        await tx.$queryRaw`
            SELECT id
            FROM teams
            WHERE id = ${requestTeam.teamId}
            FOR UPDATE
        `;

        // 3. Re-fetch request after acquiring the lock.
        const request = await tx.joinRequest.findUnique({
            where: { id: requestId },
            include: {
                team: {
                    include: {
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

        if (!request) {
            throw createError(
                "Join request not found",
                404,
                "REQUEST_NOT_FOUND"
            );
        }

        // 4. Check authorization.
        const isRequester = request.studentId === studentId;
        const isCreator = request.team.project.creatorId === studentId;

        if (newStatus === "CANCELLED" && !isRequester) {
            throw createError(
                "Only the requester can cancel this join request",
                403,
                "FORBIDDEN"
            );
        }

        if (
            (newStatus === "ACCEPTED" || newStatus === "REJECTED") &&
            !isCreator
        ) {
            throw createError(
                "Only the project creator can respond to this join request",
                403,
                "FORBIDDEN"
            );
        }

        // 5. Only PENDING requests can be processed.
        if (request.status !== "PENDING") {
            throw createError(
                "This join request has already been processed",
                409,
                "INVALID_STATE_TRANSITION"
            );
        }

        // 6. Acceptance requires an OPEN project.
        if (
            newStatus === "ACCEPTED" &&
            request.team.project.status !== "OPEN"
        ) {
            throw createError(
                "Cannot accept a join request for a project that is not open",
                422,
                "PROJECT_NOT_OPEN"
            );
        }

        // 7. Check existing membership and capacity before acceptance.
        if (newStatus === "ACCEPTED") {

            const existingMember = await tx.teamMember.findUnique({
                where: {
                    teamId_studentId: {
                        teamId: request.teamId,
                        studentId: request.studentId,
                    },
                },
                select: {
                    teamId: true,
                },
            });

            if (existingMember) {
                throw createError(
                    "Student is already a member of this team",
                    409,
                    "ALREADY_MEMBER"
                );
            }

            const currentMemberCount = await tx.teamMember.count({
                where: {
                    teamId: request.teamId,
                },
            });

            const preferredTeamSize =
                request.team.project.preferredTeamSize;

            if (currentMemberCount >= preferredTeamSize) {
                throw createError(
                    "This team has already reached its preferred size",
                    409,
                    "TEAM_FULL"
                );
            }
        }

        // 8. Atomically claim the pending request.
        const respondedAt = new Date();

        const claimedRequest = await tx.joinRequest.updateMany({
            where: {
                id: requestId,
                status: "PENDING",
            },
            data: {
                status: newStatus,
                respondedAt,
            },
        });

        if (claimedRequest.count === 0) {
            throw createError(
                "This join request has already been processed",
                409,
                "INVALID_STATE_TRANSITION"
            );
        }

        // 9. Handle acceptance.
        if (newStatus === "ACCEPTED") {

            try {
                await tx.teamMember.create({
                    data: {
                        teamId: request.teamId,
                        studentId: request.studentId,
                        role: "MEMBER",
                    },
                });
            } catch (error) {
                if (isUniqueConstraintError(error)) {
                    throw createError(
                        "Student is already a member of this team",
                        409,
                        "ALREADY_MEMBER"
                    );
                }

                throw error;
            }

            // Cancel other pending join requests for this student and team.
            await tx.joinRequest.updateMany({
                where: {
                    teamId: request.teamId,
                    studentId: request.studentId,
                    status: "PENDING",
                    id: {
                        not: requestId,
                    },
                },
                data: {
                    status: "CANCELLED",
                    respondedAt,
                },
            });

            // Cancel pending invitations for the same student and team.
            await tx.invitation.updateMany({
                where: {
                    teamId: request.teamId,
                    inviteeId: request.studentId,
                    status: "PENDING",
                },
                data: {
                    status: "CANCELLED",
                    respondedAt,
                },
            });
        }

        // 10. Return updated join request.
        return tx.joinRequest.findUnique({
            where: {
                id: requestId,
            },
            select: {
                id: true,
                teamId: true,
                studentId: true,
                message: true,
                status: true,
                createdAt: true,
                respondedAt: true,
            },
        });
    });
};

module.exports = {
    createJoinRequest,
    getMyJoinRequests,
    getTeamJoinRequests,
    respondToJoinRequest,
};
