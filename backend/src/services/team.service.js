
const prisma = require("../lib/prisma");

const createError = (message, statusCode, code) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    error.code = code;
    return error;
};

// GET TEAM DETAILS
const getTeamById = async (teamId, studentId) => {
    const team = await prisma.team.findUnique({
        where: { id: teamId },
        include: {
            project: {
                select: {
                    id: true,
                    title: true,
                    description: true,
                    status: true,
                    creatorId: true,
                },
            },
            members: {
                include: {
                    student: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
                orderBy: {
                    joinedAt: "asc",
                },
            },
            _count: {
                select: {
                    members: true,
                },
            },
        },
    });

    if (!team) {
        throw createError("Team not found", 404, "TEAM_NOT_FOUND");
    }

    // OPEN projects are visible to all authenticated students.
    // Other project statuses are visible only to team members.
    const isMember = team.members.some(
        (member) => member.studentId === studentId
    );

    if (team.project.status !== "OPEN" && !isMember) {
        throw createError(
            "You are not authorized to view this team",
            403,
            "TEAM_ACCESS_DENIED"
        );
    }

    return {
        id: team.id,
        project: team.project,
        members: team.members.map((member) => ({
            studentId: member.student.id,
            name: member.student.name,

            // Project.creatorId is the source of truth for creator identity.
            role:
                member.studentId === team.project.creatorId
                    ? "CREATOR"
                    : "MEMBER",

            joinedAt: member.joinedAt,
        })),
        memberCount: team._count.members,
    };
};

// LEAVE TEAM
const leaveTeam = async (teamId, studentId) => {
    return prisma.$transaction(async (tx) => {
        const team = await tx.team.findUnique({
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

        // The project creator cannot leave their own team.
        if (team.project.creatorId === studentId) {
            throw createError(
                "The project creator cannot leave the team. Cancel the project instead.",
                400,
                "CREATOR_CANNOT_LEAVE"
            );
        }

        const membership = await tx.teamMember.findUnique({
            where: {
                teamId_studentId: {
                    teamId,
                    studentId,
                },
            },
        });

        if (!membership) {
            throw createError(
                "You are not a member of this team",
                404,
                "TEAM_MEMBERSHIP_NOT_FOUND"
            );
        }

        await tx.teamMember.delete({
            where: {
                teamId_studentId: {
                    teamId,
                    studentId,
                },
            },
        });

        return {
            teamId,
            studentId,
        };
    });
};

module.exports = {
    getTeamById,
    leaveTeam,
};
