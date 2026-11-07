
const {
    calculateIndividualMatch,
    calculateTeamCoverage,
    calculateTeamImprovement,
    calculateCombinedScore,
} = require("./src/matching/matching.utils");
const projectSkills = [
    {
        skillId: "skill3",
        importance: "NICE_TO_HAVE",
        skill: { name: "Node.js" },
    },
];
const studentSkills = [];

const teamMembers = [
    {
        student: {
            studentSkills: [
                { skillId: "skill1" },
            ],
        },
    },
];

const individual = calculateIndividualMatch(
    projectSkills,
    studentSkills
);

const coverage = calculateTeamCoverage(
    projectSkills,
    teamMembers
);

const improvement = calculateTeamImprovement(
    projectSkills,
    teamMembers,
    studentSkills
);

const combined = calculateCombinedScore(
    individual.individualMatchScore,
    improvement.teamImprovementScore
);

console.log("Individual match:", individual);
console.log("Team coverage:", coverage);
console.log("Team improvement:", improvement);
console.log("Combined score:", combined);
