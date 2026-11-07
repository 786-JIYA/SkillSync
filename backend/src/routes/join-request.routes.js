
const express = require("express");
const router = express.Router();

const authenticateStudent = require("../middlewares/auth.middleware");
const joinRequestController = require("../controllers/join-request.controller");

// Get join requests received by the logged-in student
router.get(
    "/me",
    authenticateStudent,
    joinRequestController.getMyJoinRequests
);

// Respond to or cancel a join request
router.patch(
    "/:requestId",
    authenticateStudent,
    joinRequestController.respondToJoinRequest
);

module.exports = router;
