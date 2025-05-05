import { PrismaClient } from "@prisma/client";
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient;
}

const prisma = global.prisma || new PrismaClient();
global.prisma = prisma;

export default prisma;
