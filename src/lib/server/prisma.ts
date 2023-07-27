import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient({ log: ["info"] });

export default prisma;
