
const test = require("node:test");
const assert = require("node:assert/strict");

const {
    getSkillWeight,
    calculateIndividualMatch,
    calculateTeamCoverage,
    calculateTeamImprovement,
    calculateCombinedScore,
} = require("./matching.utils");

// Sample project requirements
const projectSkills = [
    {
        skillId: "react",
        importance: "REQUIRED",
        skill: { name: "React" },
    },
    {
        skillId: "node",
        importance: "REQUIRED",
        skill: { name: "Node.js" },
    },
    {
        skillId: "mongo",
        importance: "NICE_TO_HAVE",
        skill: { name: "MongoDB" },
    },
];

// TEST 1: Skill weights
test("should return correct skill weights", () => {
    assert.equal(getSkillWeight("REQUIRED"), 1.0);
    assert.equal(getSkillWeight("NICE_TO_HAVE"), 0.5);
});

// TEST 2: Invalid importance
test("should reject invalid skill importance", () => {
    assert.throws(() => getSkillWeight("OPTIONAL"));
});

// TEST 3: Individual matching
test("should calculate individual match score correctly", () => {
    const studentSkills = [
        { skillId: "react", proficiency: 4 },
        { skillId: "mongo", proficiency: 3 },
    ];

    const result = calculateIndividualMatch(
        projectSkills,
        studentSkills
    );

    assert.equal(result.individualMatchScore, 63);
    assert.equal(result.matchedSkills.length, 2);
    assert.equal(result.missingSkills.length, 1);
    assert.equal(result.missingSkills[0].name, "Node.js");
});

// TEST 4: Student with no matching skills
test("should return zero when student has no matching skills", () => {
    const result = calculateIndividualMatch(
        projectSkills,
        []
    );

    assert.equal(result.individualMatchScore, 0);
    assert.equal(result.matchedSkills.length, 0);
    assert.equal(result.missingSkills.length, 3);
});

// TEST 5: Invalid proficiency
test("should reject proficiency outside the 1-5 range", () => {
    assert.throws(() =>
        calculateIndividualMatch(
            projectSkills,
            [{ skillId: "react", proficiency: 6 }]
        )
    );
});

// TEST 6: Team coverage
test("should calculate team coverage using unique skills", () => {
    const teamMembers = [
        {
            student: {
                studentSkills: [
                    { skillId: "react" },
                    { skillId: "mongo" },
                ],
            },
        },
        {
            student: {
                studentSkills: [
                    { skillId: "react" },
                ],
            },
        },
    ];

    const result = calculateTeamCoverage(
        projectSkills,
        teamMembers
    );

    assert.equal(result.coverageScore, 50);
    assert.equal(result.coveredSkills.length, 2);
    assert.equal(result.missingSkills.length, 1);
    assert.equal(result.niceToHaveCovered, 1);
    assert.equal(result.niceToHaveTotal, 1);
});

// TEST 7: No required skills
test("should return null coverage score when no required skills exist", () => {
    const result = calculateTeamCoverage(
        [
            {
                skillId: "mongo",
                importance: "NICE_TO_HAVE",
                skill: { name: "MongoDB" },
            },
        ],
        []
    );

    assert.equal(result.coverageScore, null);
    assert.equal(result.niceToHaveCovered, 0);
    assert.equal(result.niceToHaveTotal, 1);
});

// TEST 8: Team improvement
test("should calculate candidate contribution to team gaps", () => {
    const teamMembers = [
        {
            student: {
                studentSkills: [
                    { skillId: "react" },
                ],
            },
        },
    ];

    const candidateSkills = [
        { skillId: "node" },
        { skillId: "mongo" },
    ];

    const result = calculateTeamImprovement(
        projectSkills,
        teamMembers,
        candidateSkills
    );

    assert.equal(result.teamImprovementScore, 100);
    assert.deepEqual(
        result.skillsAddedToTeam,
        ["Node.js", "MongoDB"]
    );
    assert.deepEqual(result.remainingTeamGaps, []);
});

// TEST 9: Candidate adds no missing skills
test("should return zero improvement when candidate adds no team gaps", () => {
    const result = calculateTeamImprovement(
        projectSkills,
        [],
        []
    );

    assert.equal(result.teamImprovementScore, 0);
});

// TEST 10: Combined score
test("should calculate combined score correctly", () => {
    const result = calculateCombinedScore(76, 92);

    assert.equal(result, 85.6);
});
