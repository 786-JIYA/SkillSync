const prisma = require("../lib/prisma");
const addStudentSkill = async (studentId, skillId, proficiency) => {

    // 1. Validate proficiency
    if (
        !Number.isInteger(proficiency) ||
        proficiency < 1 ||
        proficiency > 5
    ) {
        throw new Error("Proficiency must be an integer between 1 and 5");
    }

    // 2. Check whether skill exists
    const skill = await prisma.skill.findUnique({
        where: {
            id: skillId
        }
    });

    if (!skill) {
        throw new Error("Skill not found");
    }

    // 3. Add or update student skill
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

const deleteStudentSkill = async (studentId, skillId) => {

    // Delete only the selected student's skill
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

module.exports = {
    addStudentSkill,
    deleteStudentSkill
};