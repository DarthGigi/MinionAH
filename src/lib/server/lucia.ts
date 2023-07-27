import { lucia } from "lucia";
import { prisma } from "@lucia-auth/adapter-prisma";
import { sveltekit } from "lucia/middleware";
import { discord } from "@lucia-auth/oauth/providers";
import { dev } from "$app/environment";
import { PrismaClient } from "@prisma/client";
import { CLIENT_ID, CLIENT_SECRET, REDIRECT_URI } from "$env/static/private";

const client = new PrismaClient();

export const auth = lucia({
  adapter: prisma(client),
  env: dev ? "DEV" : "PROD",
  middleware: sveltekit()
});

const config = {
  clientId: CLIENT_ID,
  clientSecret: CLIENT_SECRET,
  redirectUri: REDIRECT_URI
};

export const discordAuth = discord(auth, config);

export type Auth = typeof auth;
