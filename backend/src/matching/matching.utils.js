
const SKILL_WEIGHTS = Object.freeze({
    REQUIRED: 1.0,
    NICE_TO_HAVE: 0.5,
});

const roundScore = (score) => {
    if (!Number.isFinite(score)) {
        throw new Error("Score must be a finite number");
    }

    return Math.round((score + Number.EPSILON) * 10) / 10;
};

const getSkillWeight = (importance) => {
    if (!Object.prototype.hasOwnProperty.call(SKILL_WEIGHTS, importance)) {
        throw new Error(`Invalid skill importance: ${importance}`);
    }

    return SKILL_WEIGHTS[importance];
};

const validateArrays = (...arrays) => {
    if (arrays.some((item) => !Array.isArray(item))) {
        throw new Error("Expected valid arrays for matching calculations");
    }
};

const validateProficiency = (proficiency) => {
    if (
        !Number.isInteger(proficiency) ||
        proficiency < 1 ||
        proficiency > 5
    ) {
        throw new Error("Invalid skill proficiency");
    }
};

const getTeamSkillIds = (teamMembers) => {
    const teamSkillIds = new Set();

    for (const member of teamMembers) {
        if (!Array.isArray(member.student?.studentSkills)) {
            throw new Error("Invalid team member skill data");
        }

        for (const studentSkill of member.student.studentSkills) {
            teamSkillIds.add(studentSkill.skillId);
        }
    }

    return teamSkillIds;
};

// Calculate how well one student matches a project.
const calculateIndividualMatch = (projectSkills, studentSkills) => {
    validateArrays(projectSkills, studentSkills);

    const studentSkillMap = new Map();

    for (const item of studentSkills) {
        validateProficiency(item.proficiency);
        studentSkillMap.set(item.skillId, item);
    }

    let totalWeight = 0;
    let matchedWeight = 0;
    let totalStrength = 0;

    const matchedSkills = [];
    const missingSkills = [];

    for (const requirement of projectSkills) {
        const weight = getSkillWeight(requirement.importance);

        totalWeight += weight;

        const studentSkill = studentSkillMap.get(requirement.skillId);

        if (studentSkill) {
            matchedWeight += weight;
            totalStrength += studentSkill.proficiency / 5;

            matchedSkills.push({
                skillId: requirement.skillId,
                name: requirement.skill.name,
                proficiency: studentSkill.proficiency,
                importance: requirement.importance,
            });
        } else {
            missingSkills.push({
                skillId: requirement.skillId,
                name: requirement.skill.name,
                importance: requirement.importance,
            });
        }
    }

    const overlap =
        totalWeight === 0 ? 0 : matchedWeight / totalWeight;

    const strength =
        matchedSkills.length === 0
            ? 0
            : totalStrength / matchedSkills.length;

    const individualMatchScore = roundScore(
        100 * (0.7 * overlap + 0.3 * strength)
    );

    return {
        individualMatchScore,
        matchedSkills,
        missingSkills,
    };
};

// Calculate combined skill coverage of a team.
// Skill presence matters, not individual proficiency.
const calculateTeamCoverage = (projectSkills, teamMembers) => {
    validateArrays(projectSkills, teamMembers);

    const teamSkillIds = getTeamSkillIds(teamMembers);

    const coveredSkills = [];
    const missingSkills = [];

    let requiredTotal = 0;
    let requiredCovered = 0;
    let niceToHaveTotal = 0;
    let niceToHaveCovered = 0;

    for (const requirement of projectSkills) {
        // Also validates the importance value.
        getSkillWeight(requirement.importance);

        const isCovered = teamSkillIds.has(requirement.skillId);

        const skill = {
            skillId: requirement.skillId,
            name: requirement.skill.name,
            importance: requirement.importance,
        };

        if (isCovered) {
            coveredSkills.push(skill);
        } else {
            missingSkills.push(skill);
        }

        if (requirement.importance === "REQUIRED") {
            requiredTotal++;

            if (isCovered) {
                requiredCovered++;
            }
        } else {
            niceToHaveTotal++;

            if (isCovered) {
                niceToHaveCovered++;
            }
        }
    }

    return {
        coverageScore:
            requiredTotal === 0
                ? null
                : roundScore((requiredCovered / requiredTotal) * 100),

        coveredSkills,
        missingSkills,
        niceToHaveCovered,
        niceToHaveTotal,
    };
};

// Calculate how much a candidate improves the existing team.
const calculateTeamImprovement = (
    projectSkills,
    teamMembers,
    candidateSkills
) => {
    validateArrays(projectSkills, teamMembers, candidateSkills);

    const teamSkillIds = getTeamSkillIds(teamMembers);

    const candidateSkillIds = new Set(
        candidateSkills.map((skill) => skill.skillId)
    );

    let totalGapWeight = 0;
    let candidateGapWeight = 0;

    const skillsAddedToTeam = [];
    const remainingTeamGaps = [];

    for (const requirement of projectSkills) {
        if (teamSkillIds.has(requirement.skillId)) {
            continue;
        }

        const weight = getSkillWeight(requirement.importance);

        totalGapWeight += weight;

        if (candidateSkillIds.has(requirement.skillId)) {
            candidateGapWeight += weight;
            skillsAddedToTeam.push(requirement.skill.name);
        } else {
            remainingTeamGaps.push(requirement.skill.name);
        }
    }

    const teamImprovementScore =
        totalGapWeight === 0
            ? 0
            : roundScore(
                (candidateGapWeight / totalGapWeight) * 100
            );

    return {
        teamImprovementScore,
        skillsAddedToTeam,
        remainingTeamGaps,
    };
};

// Calculate final candidate ranking score.
const calculateCombinedScore = (
    individualMatchScore,
    teamImprovementScore
) => {
    if (
        !Number.isFinite(individualMatchScore) ||
        !Number.isFinite(teamImprovementScore) ||
        individualMatchScore < 0 ||
        individualMatchScore > 100 ||
        teamImprovementScore < 0 ||
        teamImprovementScore > 100
    ) {
        throw new Error("Invalid matching scores");
    }

    return roundScore(
        0.4 * individualMatchScore +
        0.6 * teamImprovementScore
    );
};

module.exports = {
    getSkillWeight,
    calculateIndividualMatch,
    calculateTeamCoverage,
    calculateTeamImprovement,
    calculateCombinedScore,
};
