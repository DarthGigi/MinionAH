import type { MinionSeller, Minion, AuthUser } from "@prisma/client";

// extend the MinionSeller type to include the user and minion
interface Seller extends MinionSeller {
  user: AuthUser;
  minion: Minion;
}

export type { MinionSeller, Minion, Seller };
