import lucia from "lucia-auth";
import prismaAdapter from "@lucia-auth/adapter-prisma";
import { sveltekit } from "lucia-auth/middleware";
import { discord } from "@lucia-auth/oauth/providers";
import { dev } from "$app/environment";
import { prisma } from "$lib/server/prisma";
import { CLIENT_ID, CLIENT_SECRET, REDIRECT_URI } from "$env/static/private";

export const auth = lucia({
  adapter: prismaAdapter(prisma),
  env: dev ? "DEV" : "PROD",
  middleware: sveltekit(),
  transformUserData: (userData) => {
    return {
      userId: userData.id,
      name: userData.name,
      minions: userData.minions
    };
  }
});

const config = {
  clientId: CLIENT_ID,
  clientSecret: CLIENT_SECRET,
  redirectUri: REDIRECT_URI
};

export const discordAuth = discord(auth, config);

export type Auth = typeof auth;
