
require("dotenv").config();

const { PrismaPg } = require("@prisma/adapter-pg");
const { PrismaClient } = require("@prisma/client");

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

const skills = [
    // Programming
    { name: "Java", category: "Programming" },
    { name: "Python", category: "Programming" },
    { name: "C", category: "Programming" },
    { name: "C++", category: "Programming" },
    { name: "JavaScript", category: "Programming" },

    // Web Development
    { name: "HTML", category: "Web Development" },
    { name: "CSS", category: "Web Development" },
    { name: "React.js", category: "Web Development" },
    { name: "Node.js", category: "Web Development" },
    { name: "Express.js", category: "Web Development" },

    // Database
    { name: "PostgreSQL", category: "Database" },
    { name: "MySQL", category: "Database" },
    { name: "MongoDB", category: "Database" },

    // Computer Science
    { name: "Data Structures", category: "Computer Science" },
    { name: "Algorithms", category: "Computer Science" },
    { name: "Object-Oriented Programming", category: "Computer Science" },
    { name: "DBMS", category: "Computer Science" },

    // Tools
    { name: "Git", category: "Tools" },
    { name: "GitHub", category: "Tools" },
    { name: "Docker", category: "Tools" },

    // AI & ML
    { name: "Machine Learning", category: "AI & ML" },
    { name: "Deep Learning", category: "AI & ML" },
    { name: "TensorFlow", category: "AI & ML" },
];

async function main() {
    console.log("Starting skill seeding...");

    for (const skill of skills) {
        await prisma.skill.upsert({
            where: { name: skill.name },
            update: { category: skill.category },
            create: skill,
        });
    }

    console.log(`Successfully seeded ${skills.length} skills.`);
}

main()
    .catch((error) => {
        console.error("Error seeding skills:", error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
