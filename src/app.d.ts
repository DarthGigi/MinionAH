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
      auth: import("lucia-auth").AuthRequest;
    }
    // interface PageData {}
    // interface Platform {}
  }
  var __prisma: PrismaClient;

  /// <reference types="lucia" />

  declare namespace Lucia {
    type Auth = import("$lib/server/lucia").Auth;
    type UserAttributes = {
      id: string;
      username: string;
      avatar: string;
      banner?: string;
      accent_color?: number;
      locale?: string;
      minions?: Minion[];
    };
  }
}

export {};
