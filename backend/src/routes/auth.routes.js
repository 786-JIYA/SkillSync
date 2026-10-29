
const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth.controller");
const validate = require("../middlewares/validate.middleware");
const authenticateStudent = require("../middlewares/auth.middleware");

const {
    registerSchema,
    loginSchema,
} = require("../validations/auth.validation");

router.post(
    "/register",
    validate(registerSchema),
    authController.register
);

router.post(
    "/login",
    validate(loginSchema),
    authController.login
);

router.get(
    "/me",
    authenticateStudent,
    authController.getMe
);

module.exports = router;
