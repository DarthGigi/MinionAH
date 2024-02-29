import type { Minion, Auction, User } from "@prisma/client";

// extend the Auction type to include the user and minion
interface Seller extends Auction {
  id: any;
  timeCreated: string | number | Date;
  user: User;
  minion: Minion;
}

export type { Minion, Auction, Seller };
