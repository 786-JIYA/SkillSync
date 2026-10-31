
const prisma = require("../lib/prisma");

// Add or update a skill for the logged-in student
const addStudentSkill = async (studentId, skillId, proficiency) => {

    // Validate skill ID
    if (
        !skillId ||
        typeof skillId !== "string" ||
        !skillId.trim()
    ) {
        const error = new Error("Valid skill ID is required");
        error.statusCode = 400;
        throw error;
    }

    // Validate proficiency (1 to 5)
    if (
        !Number.isInteger(proficiency) ||
        proficiency < 1 ||
        proficiency > 5
    ) {
        const error = new Error(
            "Proficiency must be an integer between 1 and 5"
        );
        error.statusCode = 400;
        throw error;
    }

    // Check whether the skill exists
    const skill = await prisma.skill.findUnique({
        where: {
            id: skillId
        }
    });

    if (!skill) {
        const error = new Error("Skill not found");
        error.statusCode = 404;
        throw error;
    }

    // Add the skill or update its proficiency if already selected
    const studentSkill = await prisma.studentSkill.upsert({
        where: {
            studentId_skillId: {
                studentId: studentId,
                skillId: skillId
            }
        },
        update: {
            proficiency: proficiency
        },
        create: {
            studentId: studentId,
            skillId: skillId,
            proficiency: proficiency
        }
    });

    return studentSkill;
};


// Delete a skill selected by the logged-in student
const deleteStudentSkill = async (studentId, skillId) => {

    // Validate skill ID
    if (
        !skillId ||
        typeof skillId !== "string" ||
        !skillId.trim()
    ) {
        const error = new Error("Valid skill ID is required");
        error.statusCode = 400;
        throw error;
    }

    // Delete using the composite primary key
    await prisma.studentSkill.delete({
        where: {
            studentId_skillId: {
                studentId: studentId,
                skillId: skillId
            }
        }
    });

    return true;
};


// Get all skills selected by the logged-in student
const getStudentSkills = async (studentId) => {

    const studentSkills = await prisma.studentSkill.findMany({
        where: {
            studentId: studentId
        },
        select: {
            proficiency: true,
            skill: {
                select: {
                    id: true,
                    name: true,
                    category: true
                }
            }
        },
        orderBy: {
            skill: {
                name: "asc"
            }
        }
    });

    return studentSkills.map((studentSkill) => ({
        id: studentSkill.skill.id,
        name: studentSkill.skill.name,
        category: studentSkill.skill.category,
        proficiency: studentSkill.proficiency
    }));
};


module.exports = {
    addStudentSkill,
    deleteStudentSkill,
    getStudentSkills
};
