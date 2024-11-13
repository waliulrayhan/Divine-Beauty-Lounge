/* eslint-disable no-var */
import { PrismaClient } from '@prisma/client';

// Extend the NodeJS global type
declare global {
  var prisma: PrismaClient | undefined;
}

let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
  prisma = global.prisma;
}

export default prisma;

/* eslint-enable no-var */ // Re-enable the rule after the block
