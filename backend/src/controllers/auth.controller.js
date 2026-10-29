
const authService = require("../services/auth.service");

const register = async (req, res) => {
    try {
        const student = await authService.registerStudent(req.body);

        return res.status(201).json({
            success: true,
            message: "Student registered successfully",
            data: { student },
        });
    } catch (error) {
        console.error("Registration error:", error.message);

        return res.status(error.statusCode || 500).json({
            success: false,
            message:
                error.statusCode && error.statusCode < 500
                    ? error.message
                    : "Unable to register student",
        });
    }
};

const login = async (req, res) => {
    try {
        const result = await authService.loginStudent(
            req.body.email,
            req.body.password
        );

        return res.status(200).json({
            success: true,
            message: "Login successful",
            data: result,
        });
    } catch (error) {
        console.error("Login error:", error.message);

        return res.status(error.statusCode || 500).json({
            success: false,
            message:
                error.statusCode === 401
                    ? "Invalid email or password"
                    : "Unable to log in",
        });
    }
};

const getMe = async (req, res) => {
    return res.status(200).json({
        success: true,
        data: {
            student: req.student,
        },
    });
};


module.exports = {
    register,
    login,
    getMe
};
