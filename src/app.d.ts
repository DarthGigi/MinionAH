import type { PrismaClient, User } from "@prisma/client";
// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces

declare global {
  namespace App {
    // interface Error {}
    interface Locals {
      user:
        | (User & {
            _count: {
              chatsAsUser1: number;
              chatsAsUser2: number;
              key: number;
            };
          })
        | null;
      session: import("lucia").Session | null;
      isProtectedRoute: boolean;
      isAdmin: boolean | undefined;
    }
    // interface PageData {}
    // interface Platform {}
  }
  var prisma: PrismaClient;
}

export {};
