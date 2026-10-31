
const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth.routes");
const skillRoutes = require('./routes/skill.routes');
const studentRoutes = require("./routes/student.routes");

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

module.exports = app;


