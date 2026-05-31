import { PrismaClient } from "@prisma/client";

// Invalidate cache explicitly in development to pick up new schema changes (like the 'nama' field)
if (process.env.NODE_ENV !== "production") {
  delete globalThis.prismaGlobal;
}

const prismaClientSingleton = () => {
  return new PrismaClient();
};

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== "production") globalThis.prismaGlobal = prisma;
