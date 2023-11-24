import { dev } from "$app/environment";
import { prisma } from "@lucia-auth/adapter-prisma";
import { PrismaClient } from "@prisma/client";
import { lucia } from "lucia";
import { sveltekit } from "lucia/middleware";

const client = new PrismaClient();

export const auth = lucia({
  adapter: prisma(client),
  env: dev ? "DEV" : "PROD",
  middleware: sveltekit()
});

export type Auth = typeof auth;
