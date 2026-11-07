
const prisma = require("../lib/prisma");

const validateRequiredSkills = (requiredSkills) => {
    // 1. Ensure at least one skill is provided.
    if (!Array.isArray(requiredSkills) || requiredSkills.length === 0) {
        const error = new Error(
            "At least one required skill must be provided"
        );
        error.statusCode = 400;
        error.code = "REQUIRED_SKILLS_MISSING";
        throw error;
    }

    // 2. Reject duplicate skill IDs.
    const skillIds = requiredSkills.map((skill) => skill.skillId);

    if (new Set(skillIds).size !== skillIds.length) {
        const error = new Error("Duplicate skill IDs are not allowed");
        error.statusCode = 400;
        error.code = "DUPLICATE_SKILL_IDS";
        throw error;
    }

    // 3. Validate importance values.
    const validImportance = ["REQUIRED", "NICE_TO_HAVE"];

    const hasInvalidImportance = requiredSkills.some(
        (skill) => !validImportance.includes(skill.importance)
    );

    if (hasInvalidImportance) {
        const error = new Error("Invalid skill importance");
        error.statusCode = 400;
        error.code = "INVALID_SKILL_IMPORTANCE";
        throw error;
    }

    // 4. At least one skill must be REQUIRED.
    const hasRequiredSkill = requiredSkills.some(
        (skill) => skill.importance === "REQUIRED"
    );

    if (!hasRequiredSkill) {
        const error = new Error(
            "At least one skill must have REQUIRED importance"
        );
        error.statusCode = 400;
        error.code = "REQUIRED_SKILL_MISSING";
        throw error;
    }
};

const createProject = async (studentId, projectData) => {
    const {
        title,
        description,
        preferredTeamSize,
        requiredSkills,
    } = projectData;

    validateRequiredSkills(requiredSkills);

    // Step 1: Check whether all submitted skills exist.
    const skillIds = requiredSkills.map((skill) => skill.skillId);

    const existingSkills = await prisma.skill.findMany({
        where: {
            id: {
                in: skillIds,
            },
        },
        select: {
            id: true,
        },
    });

    if (existingSkills.length !== skillIds.length) {
        const error = new Error("One or more skill IDs are invalid");
        error.statusCode = 400;
        error.code = "INVALID_SKILL_IDS";
        throw error;
    }

    // Step 2: Create everything inside one transaction.
    const project = await prisma.$transaction(async (tx) => {

        // Create the project.
        const newProject = await tx.project.create({
            data: {
                title,
                description,
                preferredTeamSize,
                creatorId: studentId,
            },
        });

        // Add the project's required skills.
        await tx.projectRequiredSkill.createMany({
            data: requiredSkills.map((skill) => ({
                projectId: newProject.id,
                skillId: skill.skillId,
                importance: skill.importance,
            })),
        });

        // Create a team for the project.
        const team = await tx.team.create({
            data: {
                projectId: newProject.id,
            },
        });

        // Add the creator as the first team member.
        await tx.teamMember.create({
            data: {
                teamId: team.id,
                studentId,
                role: "CREATOR",
            },
        });

        // Return the complete project details.
        return tx.project.findUnique({
            where: {
                id: newProject.id,
            },
            include: {
                requiredSkills: {
                    include: {
                        skill: {
                            select: {
                                id: true,
                                name: true,
                                category: true,
                            },
                        },
                    },
                },
                team: {
                    include: {
                        _count: {
                            select: {
                                members: true,
                            },
                        },
                    },
                },
            },
        });
    });

    return project;
};


const getAllProjects = async (query) => {
    const {
        status = "OPEN",
        search,
        skillId,
    } = query;

    // Validate status.
    const allowedStatuses = [
        "OPEN",
        "IN_PROGRESS",
        "COMPLETED",
        "CANCELLED",
    ];

    if (!allowedStatuses.includes(status)) {
        const error = new Error("Invalid project status");
        error.statusCode = 400;
        error.code = "INVALID_PROJECT_STATUS";
        throw error;
    }

    // Validate search.
    if (search !== undefined && typeof search !== "string") {
        const error = new Error("Search must be a string");
        error.statusCode = 400;
        throw error;
    }

    // Validate skillId.
    if (skillId !== undefined && typeof skillId !== "string") {
        const error = new Error("Skill ID must be a string");
        error.statusCode = 400;
        throw error;
    }

    // Validate pagination.
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 20);

    if (!Number.isInteger(page) || page < 1) {
        const error = new Error("Page must be a positive integer");
        error.statusCode = 400;
        throw error;
    }

    if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
        const error = new Error("Limit must be an integer between 1 and 100");
        error.statusCode = 400;
        throw error;
    }

    const skip = (page - 1) * limit;

    // Build project filters.
    const where = {
        status,
    };

    const trimmedSearch = search?.trim();
    const trimmedSkillId = skillId?.trim();

    if (trimmedSearch) {
        where.OR = [
            {
                title: {
                    contains: trimmedSearch,
                    mode: "insensitive",
                },
            },
            {
                description: {
                    contains: trimmedSearch,
                    mode: "insensitive",
                },
            },
        ];
    }

    if (trimmedSkillId) {
        where.requiredSkills = {
            some: {
                skillId: trimmedSkillId,
            },
        };
    }

    // Fetch projects and total count together.
    const [projects, total] = await Promise.all([
        prisma.project.findMany({
            where,
            skip,
            take: limit,
            orderBy: {
                createdAt: "desc",
            },
            include: {
                creator: {
                    select: {
                        id: true,
                        name: true,
                        department: true,
                    },
                },
                requiredSkills: {
                    include: {
                        skill: {
                            select: {
                                id: true,
                                name: true,
                                category: true,
                            },
                        },
                    },
                },
                team: {
                    include: {
                        _count: {
                            select: {
                                members: true,
                            },
                        },
                    },
                },
            },
        }),

        prisma.project.count({
            where,
        }),
    ]);

    return {
        projects,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
};

const getMyProjects = async (studentId) => {
    return prisma.project.findMany({
        where: {
            creatorId: studentId,
        },
        orderBy: {
            createdAt: "desc",
        },
        include: {
            team: {
                select: {
                    id: true,
                },
            },
        },
    });
};

const getProjectById = async (projectId) => {
    const project = await prisma.project.findUnique({
        where: {
            id: projectId,
        },
        include: {
            creator: {
                select: {
                    id: true,
                    name: true,
                    department: true,
                    classYear: true,
                    division: true,
                },
            },

            requiredSkills: {
                include: {
                    skill: {
                        select: {
                            id: true,
                            name: true,
                            category: true,
                        },
                    },
                },
            },

            team: {
                include: {
                    members: {
                        include: {
                            student: {
                                select: {
                                    id: true,
                                    name: true,
                                    department: true,
                                    classYear: true,
                                    division: true,
                                },
                            },
                        },
                    },

                    _count: {
                        select: {
                            members: true,
                        },
                    },
                },
            },
        },
    });

    if (!project) {
        const error = new Error("Project not found");
        error.statusCode = 404;
        error.code = "PROJECT_NOT_FOUND";
        throw error;
    }

    return project;
};

const updateProject = async (projectId, studentId, updateData) => {
    return prisma.$transaction(
        async (tx) => {
            // 1. Fetch project and its team.
            const project = await tx.project.findUnique({
                where: { id: projectId },
                select: {
                    id: true,
                    creatorId: true,
                    status: true,
                    team: {
                        select: {
                            id: true,
                        },
                    },
                },
            });

            if (!project) {
                const error = new Error("Project not found");
                error.statusCode = 404;
                error.code = "PROJECT_NOT_FOUND";
                throw error;
            }

            // 2. Check creator authorization.
            if (project.creatorId !== studentId) {
                const error = new Error(
                    "You are not authorized to update this project"
                );
                error.statusCode = 403;
                error.code = "FORBIDDEN";
                throw error;
            }

            // 3. Validate status transitions.
            if (updateData.status !== undefined) {
                const allowedTransitions = {
                    OPEN: ["IN_PROGRESS", "CANCELLED"],
                    IN_PROGRESS: ["COMPLETED", "CANCELLED"],
                    COMPLETED: [],
                    CANCELLED: [],
                };

                if (
                    !allowedTransitions[project.status].includes(
                        updateData.status
                    )
                ) {
                    const error = new Error(
                        `Cannot change project status from ${project.status} to ${updateData.status}`
                    );
                    error.statusCode = 400;
                    error.code = "INVALID_STATE_TRANSITION";
                    throw error;
                }
            }

            // 4. Check existing team size before reducing capacity.
            if (updateData.preferredTeamSize !== undefined) {
                if (!project.team) {
                    const error = new Error("Project team not found");
                    error.statusCode = 409;
                    error.code = "PROJECT_TEAM_NOT_FOUND";
                    throw error;
                }

                const currentMemberCount = await tx.teamMember.count({
                    where: {
                        teamId: project.team.id,
                    },
                });

                if (updateData.preferredTeamSize < currentMemberCount) {
                    const error = new Error(
                        `Preferred team size cannot be less than the current team size (${currentMemberCount})`
                    );
                    error.statusCode = 400;
                    error.code = "TEAM_SIZE_BELOW_MEMBER_COUNT";
                    throw error;
                }
            }

            // 5. Update only if the project still has the status we checked.
            const updateResult = await tx.project.updateMany({
                where: {
                    id: projectId,
                    creatorId: studentId,
                    status: project.status,
                },
                data: updateData,
            });

            if (updateResult.count !== 1) {
                const error = new Error(
                    "Project was modified by another request. Please try again."
                );
                error.statusCode = 409;
                error.code = "PROJECT_MODIFIED";
                throw error;
            }

            // 6. Return the updated project.
            return tx.project.findUnique({
                where: { id: projectId },
                include: {
                    requiredSkills: {
                        include: {
                            skill: {
                                select: {
                                    id: true,
                                    name: true,
                                    category: true,
                                },
                            },
                        },
                    },
                    team: {
                        include: {
                            _count: {
                                select: {
                                    members: true,
                                },
                            },
                        },
                    },
                },
            });
        },
        {
            isolationLevel: "Serializable",
        }
    );
};

const replaceRequiredSkills = async (
    projectId,
    studentId,
    requiredSkills
) => {

    validateRequiredSkills(requiredSkills);

    return prisma.$transaction(
        async (tx) => {
            // 1. Check project existence, ownership and status.
            const project = await tx.project.findUnique({
                where: { id: projectId },
                select: {
                    id: true,
                    creatorId: true,
                    status: true,
                },
            });

            if (!project) {
                const error = new Error("Project not found");
                error.statusCode = 404;
                error.code = "PROJECT_NOT_FOUND";
                throw error;
            }

            // 2. Only the creator can modify required skills.
            if (project.creatorId !== studentId) {
                const error = new Error(
                    "You are not authorized to modify required skills"
                );
                error.statusCode = 403;
                error.code = "FORBIDDEN";
                throw error;
            }

            // 3. Only OPEN projects can modify required skills.
            if (project.status !== "OPEN") {
                const error = new Error(
                    "Required skills can only be modified for OPEN projects"
                );
                error.statusCode = 400;
                error.code = "PROJECT_NOT_OPEN";
                throw error;
            }

            // 4. Verify that all submitted skills exist.
            const skillIds = requiredSkills.map(
                (skill) => skill.skillId
            );

            const existingSkills = await tx.skill.findMany({
                where: {
                    id: {
                        in: skillIds,
                    },
                },
                select: {
                    id: true,
                },
            });

            if (existingSkills.length !== skillIds.length) {
                const error = new Error(
                    "One or more skill IDs are invalid"
                );
                error.statusCode = 400;
                error.code = "INVALID_SKILL_IDS";
                throw error;
            }

            // 5. Delete existing skills.
            await tx.projectRequiredSkill.deleteMany({
                where: { projectId },
            });

            // 6. Insert the new required skills.
            await tx.projectRequiredSkill.createMany({
                data: requiredSkills.map((skill) => ({
                    projectId,
                    skillId: skill.skillId,
                    importance: skill.importance,
                })),
            });

            // 7. Return the updated project.
            return tx.project.findUnique({
                where: { id: projectId },
                include: {
                    requiredSkills: {
                        include: {
                            skill: {
                                select: {
                                    id: true,
                                    name: true,
                                    category: true,
                                },
                            },
                        },
                    },
                },
            });
        },
        {
            isolationLevel: "Serializable",
        }
    );
};



module.exports = {
    createProject,
    getAllProjects,
    getMyProjects,
    getProjectById,
    updateProject,
    replaceRequiredSkills
};
