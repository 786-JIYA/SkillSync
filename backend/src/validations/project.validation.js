
const { z } = require("zod");

const requiredSkillSchema = z.object({
    skillId: z.string().trim().min(1, "Skill ID is required"),
    importance: z.enum(["REQUIRED", "NICE_TO_HAVE"]),
});

const createProjectSchema = z.object({
    title: z
        .string()
        .trim()
        .min(3, "Title must contain at least 3 characters")
        .max(120, "Title cannot exceed 120 characters"),

    description: z
        .string()
        .trim()
        .min(10, "Description must contain at least 10 characters")
        .max(2000, "Description cannot exceed 2000 characters"),

    preferredTeamSize: z
        .number()
        .int("Preferred team size must be an integer")
        .min(2, "Preferred team size must be at least 2"),

    requiredSkills: z
        .array(requiredSkillSchema)
        .min(1, "At least one required skill must be provided")
        .refine(
            (skills) => new Set(skills.map((skill) => skill.skillId)).size === skills.length,
            "Duplicate skill IDs are not allowed"
        )
        .refine(
            (skills) => skills.some((skill) => skill.importance === "REQUIRED"),
            "At least one skill must have REQUIRED importance"
        ),
});


const updateProjectSchema = z.object({
    preferredTeamSize: z
        .number()
        .int("Preferred team size must be an integer")
        .min(2, "Preferred team size must be at least 2")
        .optional(),

    status: z
        .enum(["OPEN", "IN_PROGRESS", "COMPLETED", "CANCELLED"])
        .optional(),
}).refine(
    (data) => Object.keys(data).length > 0,
    "At least one field must be provided"
);


const replaceRequiredSkillsSchema = z.object({
    requiredSkills: z
        .array(requiredSkillSchema)
        .min(1, "At least one skill must be provided")
        .refine(
            (skills) =>
                new Set(skills.map((skill) => skill.skillId)).size === skills.length,
            "Duplicate skill IDs are not allowed"
        )
        .refine(
            (skills) =>
                skills.some((skill) => skill.importance === "REQUIRED"),
            "At least one skill must have REQUIRED importance"
        ),
});



module.exports = {
    createProjectSchema,
    updateProjectSchema,
    replaceRequiredSkillsSchema
};
