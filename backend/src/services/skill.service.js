
const prisma = require("../lib/prisma");

const getAllSkills = async (query) => {
    const { search, category } = query;

    // Validate search parameter
    if (search !== undefined && typeof search !== "string") {
        const error = new Error("Search must be a string");
        error.statusCode = 400;
        throw error;
    }

    // Validate category parameter
    if (category !== undefined && typeof category !== "string") {
        const error = new Error("Category must be a string");
        error.statusCode = 400;
        throw error;
    }

    // Get pagination values
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 20);

    // Validate page
    if (!Number.isInteger(page) || page < 1) {
        const error = new Error("Page must be a positive integer");
        error.statusCode = 400;
        throw error;
    }

    // Validate limit
    if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
        const error = new Error(
            "Limit must be an integer between 1 and 100"
        );
        error.statusCode = 400;
        throw error;
    }

    // Calculate records to skip
    const skip = (page - 1) * limit;

    // Build search and category filters
    const where = {};

    const trimmedSearch = search?.trim();
    const trimmedCategory = category?.trim();

    if (trimmedSearch) {
        where.name = {
            contains: trimmedSearch,
            mode: "insensitive"
        };
    }

    if (trimmedCategory) {
        where.category = trimmedCategory;
    }

    // Fetch skills and total count together
    const [skills, total] = await Promise.all([
        prisma.skill.findMany({
            where,
            skip,
            take: limit,
            orderBy: {
                name: "asc"
            }
        }),

        prisma.skill.count({
            where
        })
    ]);

    // Return skills with pagination details
    return {
        skills,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        }
    };
};

module.exports = {
    getAllSkills
};
