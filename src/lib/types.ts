import type { Auction, Minion, User } from "@prisma/client";

// extend the Auction type to include the user and minion
interface Seller extends Auction {
  id: string;
  timeCreated: string | number | Date;
  user: User;
  minion: Minion;
}

export type { Auction, Minion, Seller };
