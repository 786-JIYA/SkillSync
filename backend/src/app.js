
const express = require("express");
const cors = require("cors");

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

module.exports = app;
