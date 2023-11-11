import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

declare global {
  var prisma: PrismaClient;
}

const prisma = global.prisma || new PrismaClient().$extends(withAccelerate());
global.prisma = prisma;

export default prisma;
