const matchingService = require("../services/matching.service");
const createError = require("../utils/createError"); // adjust path if yours differs

const parsePositiveInt = (value, fallback, max = Infinity) => {
    if (value === undefined) return fallback;

    const number = Number(value);

    if (!Number.isInteger(number) || number < 1) {
        throw createError(
            "page and limit must be positive integers",
            400,
            "VALIDATION_ERROR"
        );
    }

    return Math.min(number, max);
};

const getRecommendedProjects = async (req, res, next) => {
    try {
        const page = parsePositiveInt(req.query.page, 1);
        const limit = parsePositiveInt(req.query.limit, 10, 50);

        const { data, meta } = await matchingService.getRecommendedProjects(
            req.student.id,
            page,
            limit
        );

        res.status(200).json({ success: true, data, meta });
    } catch (error) {
        next(error);
    }
};

const getTeamSkillCoverage = async (req, res, next) => {
    try {

        const data = await matchingService.getTeamSkillCoverage(
            req.params.teamId,
            req.student.id
        );

        res.status(200).json({ success: true, data });
    } catch (error) {
        next(error);
    }
};

const getMatchingCandidates = async (req, res, next) => {
    try {
        const page = parsePositiveInt(req.query.page, 1);
        const limit = parsePositiveInt(req.query.limit, 20, 50);

        const { data, meta } = await matchingService.getMatchingCandidates(
            req.params.teamId,
            req.student.id,
            page,
            limit
        );

        res.status(200).json({ success: true, data, meta });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getRecommendedProjects,
    getTeamSkillCoverage,
    getMatchingCandidates,
};