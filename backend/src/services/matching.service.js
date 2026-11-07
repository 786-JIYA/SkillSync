
const prisma = require("../lib/prisma");
const createError = require("../utils/createError");

const {
    calculateIndividualMatch,
    calculateTeamCoverage,
    calculateTeamImprovement,
    calculateCombinedScore,
} = require("../matching/matching.utils");

const validateId = (value, fieldName) => {
    if (typeof value !== "string" || !value.trim()) {
        throw createError(
            `Valid ${fieldName} is required`,
            400,
            "VALIDATION_ERROR"
        );
    }

    return value.trim();
};

const validatePagination = (page, limit) => {
    if (
        !Number.isSafeInteger(page) ||
        page < 1 ||
        !Number.isSafeInteger(limit) ||
        limit < 1
    ) {
        throw createError(
            "page and limit must be positive integers",
            400,
            "VALIDATION_ERROR"
        );
    }
};

const validateStatus = (status) => {
    if (
        status !== undefined &&
        status !== null &&
        status !== "" &&
        status !== "OPEN"
    ) {
        throw createError(
            "Invalid project status",
            400,
            "VALIDATION_ERROR"
        );
    }
};

const SKILL_SELECT = {
    select: {
        id: true,
        name: true,
    },
};

const formatImportance = (importance) =>
    importance.toLowerCase().replace(/_/g, "-");

const buildMeta = (page, limit, total) => ({
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
});

// Loads a team with project skills and every member's skills.
const loadTeam = async (teamId) => {
    const team = await prisma.team.findUnique({
        where: { id: teamId },
        include: {
            project: {
                include: {
                    requiredSkills: {
                        include: {
                            skill: SKILL_SELECT,
                        },
                    },
                },
            },
            members: {
                include: {
                    student: {
                        include: {
                            studentSkills: true,
                        },
                    },
                },
            },
        },
    });

    if (!team) {
        throw createError("Team not found", 404, "TEAM_NOT_FOUND");
    }

    return team;
};

// 9.2 Recommended projects
const getRecommendedProjects = async (
    studentId,
    page = 1,
    limit = 10
) => {
    studentId = validateId(studentId, "student ID");
    validatePagination(page, limit);

    const studentSkills = await prisma.studentSkill.findMany({
        where: { studentId },
        select: {
            skillId: true,
            proficiency: true,
        },
    });

    const projects = await prisma.project.findMany({
        where: {
            status: "OPEN",
            creatorId: { not: studentId },

            // Skip projects without required skills.
            requiredSkills: {
                some: {
                    importance: "REQUIRED",
                },
            },

            // Skip projects where the student is already a member.
            NOT: {
                team: {
                    is: {
                        members: {
                            some: { studentId },
                        },
                    },
                },
            },
        },
        include: {
            requiredSkills: {
                include: {
                    skill: SKILL_SELECT,
                },
            },
        },
    });

    const recommendations = projects.map((project) => {
        const result = calculateIndividualMatch(
            project.requiredSkills,
            studentSkills
        );

        return {
            project: {
                id: project.id,
                title: project.title,
                status: project.status,
            },
            individualMatchScore: result.individualMatchScore,
            matchedSkills: result.matchedSkills,
            missingSkills: result.missingSkills,
            explanation: [
                ...result.matchedSkills.map(
                    (skill) =>
                        `Your ${skill.name} skill matches a ${formatImportance(skill.importance)} skill.`
                ),
                ...result.missingSkills.map(
                    (skill) =>
                        `${skill.name} is ${formatImportance(skill.importance)} and not on your profile yet.`
                ),
            ],
        };
    });

    recommendations.sort(
        (a, b) =>
            b.individualMatchScore - a.individualMatchScore ||
            a.project.title.localeCompare(b.project.title) ||
            a.project.id.localeCompare(b.project.id)
    );

    const start = (page - 1) * limit;

    return {
        data: recommendations.slice(start, start + limit),
        meta: buildMeta(page, limit, recommendations.length),
    };
};

// 9.3 Team skill coverage
const getTeamSkillCoverage = async (teamId, studentId) => {
    teamId = validateId(teamId, "team ID");
    studentId = validateId(studentId, "student ID");

    const team = await loadTeam(teamId);

    const isCreator = team.project.creatorId === studentId;

    const isTeamMember = team.members.some(
        (member) => member.student.id === studentId
    );

    if (!isCreator && !isTeamMember) {
        throw createError(
            "You are not authorized to view this team's skill coverage",
            403,
            "TEAM_ACCESS_DENIED"
        );
    }

    return {
        teamId: team.id,
        ...calculateTeamCoverage(
            team.project.requiredSkills,
            team.members
        ),
        members: team.members.map((member) => ({
            id: member.student.id,
            name: member.student.name,
        })),
    };
};

// 9.4 Complete my team
const getMatchingCandidates = async (
    teamId,
    studentId,
    page = 1,
    limit = 20
) => {
    teamId = validateId(teamId, "team ID");
    studentId = validateId(studentId, "student ID");

    validatePagination(page, limit);

    const team = await loadTeam(teamId);

    if (team.project.creatorId !== studentId) {
        throw createError(
            "Only the project creator can view matching candidates",
            403,
            "TEAM_ACCESS_DENIED"
        );
    }

    const projectSkills = team.project.requiredSkills;

    const isTeamFull =
        team.members.length >= team.project.preferredTeamSize;

    if (isTeamFull) {
        return {
            data: [],
            meta: {
                ...buildMeta(page, limit, 0),
                teamFullyCovered: false,
                teamFull: true,
            },
        };
    }

    const hasRequiredSkills = projectSkills.some(
        (skill) => skill.importance === "REQUIRED"
    );

    const teamCoverage = calculateTeamCoverage(
        projectSkills,
        team.members
    );

    // The team already covers every required skill.
    if (hasRequiredSkills && teamCoverage.coverageScore === 100) {
        return {
            data: [],
            meta: {
                ...buildMeta(page, limit, 0),
                teamFullyCovered: true,
            },
        };
    }

    const [pendingInvitations, pendingRequests] = await Promise.all([
        prisma.invitation.findMany({
            where: {
                teamId,
                status: "PENDING",
            },
            select: {
                inviteeId: true,
            },
        }),

        prisma.joinRequest.findMany({
            where: {
                teamId,
                status: "PENDING",
            },
            select: {
                studentId: true,
            },
        }),
    ]);

    const excludedIds = [
        team.project.creatorId,
        ...team.members.map((member) => member.studentId),
        ...pendingInvitations.map(
            (invitation) => invitation.inviteeId
        ),
    ];

    const pendingRequestIds = new Set(
        pendingRequests.map((request) => request.studentId)
    );

    const students = await prisma.student.findMany({
        where: {
            id: {
                notIn: excludedIds,
            },
        },
        select: {
            id: true,
            name: true,
            department: true,
            classYear: true,
            studentSkills: {
                select: {
                    skillId: true,
                    proficiency: true,
                },
            },
        },
    });

    const importanceByName = new Map(
        projectSkills.map((requiredSkill) => [
            requiredSkill.skill.name,
            requiredSkill.importance,
        ])
    );

    const candidates = students.map((student) => {
        const individual = calculateIndividualMatch(
            projectSkills,
            student.studentSkills
        );

        const improvement = calculateTeamImprovement(
            projectSkills,
            team.members,
            student.studentSkills
        );

        const combinedScore = calculateCombinedScore(
            individual.individualMatchScore,
            improvement.teamImprovementScore
        );

        const explanation =
            improvement.skillsAddedToTeam.length > 0
                ? improvement.skillsAddedToTeam.map((name) => {
                    const importance = importanceByName.get(name);

                    return `Adds ${name}, a ${formatImportance(importance)} skill the team is missing.`;
                })
                : [
                    "Does not cover any of the team's current skill gaps.",
                ];

        return {
            student: {
                id: student.id,
                name: student.name,
                department: student.department,
                classYear: student.classYear,
            },
            individualMatchScore: individual.individualMatchScore,
            teamImprovementScore: improvement.teamImprovementScore,
            combinedScore,
            skillsAddedToTeam: improvement.skillsAddedToTeam,
            remainingTeamGaps: improvement.remainingTeamGaps,
            hasPendingJoinRequest: pendingRequestIds.has(student.id),
            explanation,
        };
    });

    candidates.sort(
        (a, b) =>
            b.combinedScore - a.combinedScore ||
            a.student.name.localeCompare(b.student.name) ||
            a.student.id.localeCompare(b.student.id)
    );

    const start = (page - 1) * limit;

    return {
        data: candidates.slice(start, start + limit),
        meta: buildMeta(page, limit, candidates.length),
    };
};

module.exports = {
    getRecommendedProjects,
    getTeamSkillCoverage,
    getMatchingCandidates,
};
