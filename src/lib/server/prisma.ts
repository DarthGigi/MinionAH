import { DATABASE_URL } from "$env/static/private";
import { PrismaClient } from "$generated/prisma";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient;
}

const prisma =
  global.prisma ||
  new PrismaClient({
    datasourceUrl: DATABASE_URL
  });

global.prisma = prisma;

export default prisma;
