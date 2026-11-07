
const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth.routes");
const skillRoutes = require('./routes/skill.routes');
const studentRoutes = require("./routes/student.routes");
const projectRoutes = require("./routes/project.routes");
const teamRoutes = require("./routes/team.routes");
const invitationRoutes = require("./routes/invitation.routes");
const joinRequestRoutes = require("./routes/join-request.routes");
const matchingRoutes = require("./routes/matching.routes");
const errorHandler = require("./middlewares/error.middleware");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        message: "Welcome to SkillSync API!",
    });
});

app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        message: "SkillSync backend is running",
    });
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/skills", skillRoutes);
app.use("/api/v1/students", studentRoutes);
app.use("/api/v1/projects", projectRoutes);
app.use("/api/v1", matchingRoutes);
app.use("/api/v1/teams", teamRoutes);
app.use("/api/v1/invitations", invitationRoutes);
app.use("/api/v1/join-requests", joinRequestRoutes);

app.use(errorHandler);

module.exports = app;


