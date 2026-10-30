const prisma = require("../lib/prisma");

const getAllSkills = async (query) => {
    const { search, category, page = 1, limit = 20 } = query;

    const skip = (Number(page) - 1) * Number(limit);

    const where = {};

    // Search skills by name
    if (search) {
        where.name = {
            contains: search,
            mode: "insensitive"
        };
    }

    // Filter skills by category
    if (category) {
        where.category = category;
    }

    // Fetch skills from database
    const [skills, total] = await Promise.all([
        prisma.skill.findMany({
            where,
            skip,
            take: Number(limit),
            orderBy: {
                name: "asc"
            }
        }),

        prisma.skill.count({ where })
    ]);

    return {
        skills,
        pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            totalPages: Math.ceil(total / Number(limit))
        }
    };
};

module.exports = {
    getAllSkills
};