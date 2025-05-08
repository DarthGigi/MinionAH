import type { Auction, Minion, User } from "$generated/prisma";

// extend the Auction type to include the user and minion
interface Seller extends Auction {
  id: string;
  timeCreated: string | number | Date;
  user: User;
  minion: Minion;
}

export type { Auction, Minion, Seller };
