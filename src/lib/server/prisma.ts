import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

declare global {
  var prisma: PrismaClient;
}

const prisma = global.prisma || new PrismaClient({ log: ["info"] }).$extends(withAccelerate());
global.prisma = prisma;

export default prisma;
