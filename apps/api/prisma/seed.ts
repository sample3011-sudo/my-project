import dotenv from 'dotenv';
dotenv.config();

import bcrypt from 'bcryptjs';
import { prisma } from '../src/config/prisma.config';

async function main() {
  console.log('Seeding database...');
  const email = 'admin@example.com';
  const password = 'Admin@123';
  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: { passwordHash },
    create: {
      email,
      passwordHash,
    },
  });

  console.log(`Seeded user: ${user.email} (id: ${user.id})`);
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
