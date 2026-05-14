const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Testing query...');
    const user = await prisma.user.findUnique({
      where: { email: 'admin@cybershield.com' },
    });
    console.log('User found:', user);
  } catch (e) {
    console.error('Prisma Error:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
