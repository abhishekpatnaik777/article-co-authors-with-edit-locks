import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function upsertUser(username: string, name: string) {
  const passwordHash = await bcrypt.hash("password", 10);

  return prisma.user.upsert({
    where: { username },
    update: { name, passwordHash },
    create: { username, name, passwordHash },
  });
}

async function main() {
  const zolly = await upsertUser("Zolly", "Zolly");
  const john = await upsertUser("John", "John");

  const existing = await prisma.article.findFirst({
    where: { title: "Welcome article" },
  });

  if (!existing) {
    await prisma.article.create({
      data: {
        title: "Welcome article",
        body: "This is a seeded article.",
        authorId: zolly.id,
        coAuthors: {
          create: [{ userId: john.id }],
        },
      },
    });
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });