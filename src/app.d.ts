import type { Minion, PrismaClient, User } from "@prisma/client";
import type { Session } from "lucia";
// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces

declare global {
  namespace App {
    // interface Error {}
    interface Locals {
      validate: import("@lucia-auth/sveltekit").Validate;
      validateUser: import("@lucia-auth/sveltekit").ValidateUser;
      setSession: import("@lucia-auth/sveltekit").SetSession;
      auth: import("lucia").AuthRequest;
      user: User | null;
      session: Session | null;
      isProtectedRoute: boolean;
    }
    // interface PageData {}
    // interface Platform {}
  }
  var prisma: PrismaClient;

  /// <reference types="lucia" />
  namespace Lucia {
    type Auth = import("$lib/server/lucia").Auth;
    type DatabaseUserAttributes = {
      id: string;
      username: string;
      loggedInAt: Date;
      avatar: string;
      skin: string;
      cape: string?;
    };
    type DatabaseSessionAttributes = {};
  }
}

export {};
