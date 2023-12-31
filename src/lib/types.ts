import type { MinionSeller, Minion, User } from "@prisma/client";

// extend the MinionSeller type to include the user and minion
interface Seller extends MinionSeller {
  user: User;
  minion: Minion;
}

export type { MinionSeller, Minion, Seller };
