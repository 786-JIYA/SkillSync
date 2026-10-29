
const { z } = require("zod");

const registerSchema = z.object({
    prn: z.string().trim().min(1, "PRN is required"),

    name: z.string().trim().min(2, "Name must contain at least 2 characters"),

    email: z
        .string()
        .trim()
        .email("Enter a valid email address")
        .toLowerCase(),

    password: z
        .string()
        .min(8, "Password must contain at least 8 characters"),

    department: z.string().trim().min(1, "Department is required"),

    classYear: z.number().int().min(1, "Class year must be a positive integer"),

    division: z.string().trim().optional(),
});

const loginSchema = z.object({
    email: z.string().trim().email("Enter a valid email address").toLowerCase(),

    password: z.string().min(1, "Password is required"),
});

module.exports = {
    registerSchema,
    loginSchema,
};
