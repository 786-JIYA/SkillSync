
const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth.routes");

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

module.exports = app;


