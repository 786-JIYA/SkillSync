
const prisma = require("../lib/prisma");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const registerStudent = async (data) => {
    const {
        prn,
        name,
        email,
        password,
        department,
        classYear,
        division,
    } = data;

    // Normalize identifiers before checking for duplicates.
    const normalizedPrn = prn.trim();
    const normalizedEmail = email.trim().toLowerCase();

    // Check for an existing PRN or email.
    const existingStudent = await prisma.student.findFirst({
        where: {
            OR: [
                { prn: normalizedPrn },
                { email: normalizedEmail },
            ],
        },
        select: {
            prn: true,
            email: true,
        },
    });

    if (existingStudent) {
        if (existingStudent.prn === normalizedPrn) {
            const error = new Error("A student with this PRN already exists");
            error.statusCode = 409;
            throw error;
        }

        const error = new Error("A student with this email already exists");
        error.statusCode = 409;
        throw error;
    }

    // Never store the original password.
    const passwordHash = await bcrypt.hash(password, 12);

    try {
        const student = await prisma.student.create({
            data: {
                prn: normalizedPrn,
                name: name.trim(),
                email: normalizedEmail,
                passwordHash,
                department: department.trim(),
                classYear,
                ...(division !== undefined && {
                    division: division.trim(),
                }),
            },
            select: {
                id: true,
                prn: true,
                name: true,
                email: true,
                department: true,
                classYear: true,
                division: true,
                createdAt: true,
            },
        });

        return student;
    } catch (error) {
        // Database unique constraints remain the final protection
        // against duplicate registrations during concurrent requests.
        if (error.code === "P2002") {
            const conflict = new Error(
                "A student with this PRN or email already exists"
            );
            conflict.statusCode = 409;
            throw conflict;
        }

        throw error;
    }
};

const loginStudent = async (email, password) => {
    const normalizedEmail = email.trim().toLowerCase();

    const student = await prisma.student.findUnique({
        where: { email: normalizedEmail },
    });

    // Use the same message for unknown emails and incorrect passwords.
    if (
        !student ||
        !(await bcrypt.compare(password, student.passwordHash))
    ) {
        const error = new Error("Invalid email or password");
        error.statusCode = 401;
        throw error;
    }

    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is not configured");
    }

    const token = jwt.sign(
        { sub: student.id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
    );

    // Never return passwordHash to the client.
    const { passwordHash, ...safeStudent } = student;

    return {
        student: safeStudent,
        token,
    };
};

module.exports = {
    registerStudent,
    loginStudent,
};
