import { dev } from "$app/environment";
import { PrismaAdapter } from "@lucia-auth/adapter-prisma";
import { PrismaClient } from "@prisma/client";
import { Lucia } from "lucia";

const client = new PrismaClient();

export const lucia = new Lucia(new PrismaAdapter(client.session, client.user), {
  sessionCookie: {
    attributes: {
      secure: !dev
    }
  }
});

declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
  }
}
