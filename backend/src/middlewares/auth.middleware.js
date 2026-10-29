
const jwt = require("jsonwebtoken");
const prisma = require("../lib/prisma");

const authenticateStudent = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Authentication token is required",
            });
        }

        const token = authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Authentication token is required",
            });
        }

        if (!process.env.JWT_SECRET) {
            console.error("JWT_SECRET is not configured");

            return res.status(500).json({
                success: false,
                message: "Authentication configuration error",
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (typeof decoded.sub !== "string") {
            return res.status(401).json({
                success: false,
                message: "Invalid authentication token",
            });
        }

        const student = await prisma.student.findUnique({
            where: { id: decoded.sub },
            select: {
                id: true,
                prn: true,
                name: true,
                email: true,
                department: true,
                classYear: true,
                division: true,
            },
        });

        if (!student) {
            return res.status(401).json({
                success: false,
                message: "Student account not found",
            });
        }

        req.student = student;

        next();
    } catch (error) {
        if (
            error.name === "JsonWebTokenError" ||
            error.name === "TokenExpiredError" ||
            error.name === "NotBeforeError"
        ) {
            return res.status(401).json({
                success: false,
                message: "Invalid or expired authentication token",
            });
        }

        console.error("Authentication middleware error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Authentication failed",
        });
    }
};

module.exports = authenticateStudent;
