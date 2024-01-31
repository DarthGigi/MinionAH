import type { Minion, MinionSeller, User } from "@prisma/client";

// extend the MinionSeller type to include the user and minion
interface Seller extends MinionSeller {
  id: any;
  timeCreated: string | number | Date;
  user: User;
  minion: Minion;
}

export type { Minion, MinionSeller, Seller };
