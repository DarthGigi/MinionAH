import type { Minion, PrismaClient } from "@prisma/client";
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
    }
    // interface PageData {}
    // interface Platform {}
  }
  var prisma: PrismaClient;
}

/// <reference types="lucia" />
declare global {
  namespace Lucia {
    type Auth = import("$lib/server/lucia").Auth;
    type UserAttributes = {
      name?: string;
      minions?: Minion[];
    };
  }
}

export {};
