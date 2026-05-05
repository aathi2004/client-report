import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
const u = await p.user.findUnique({
  where: { email: 'aathithya594@gmail.com' },
  select: { id: true, email: true, subscriptionTier: true, stripeCurrentPeriodEnd: true },
});
console.log(JSON.stringify(u, null, 2));
await p.$disconnect();
