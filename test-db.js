
const prisma = require("./src/lib/prisma");

async function main() {
  await prisma.$connect();

  const count = await prisma.student.count();

  console.log("Database connected successfully!");
  console.log("Student count:", count);
}

main()
  .catch((error) => {
    console.error("Database connection failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
