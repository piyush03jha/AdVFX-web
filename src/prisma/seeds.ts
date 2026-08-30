import 'dotenv/config';
import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL?.toLowerCase().trim();

  if (!email) {
    throw new Error('ADMIN_EMAIL is not configured');
  }

  await prisma.user.upsert({
    where: { email },
    update: {
      role: UserRole.ADMIN,
      isActive: true,
    },
    create: {
      email,
      name: process.env.ADMIN_NAME ?? 'Administrator',
      role: UserRole.ADMIN,
      isActive: true,
    },
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
