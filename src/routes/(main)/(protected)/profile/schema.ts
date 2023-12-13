import { z } from "zod";
export const formSchemaCreate = z.object({
  type: z.string().min(1, "Please choose a minion"),
  tier: z.coerce
    .number({ required_error: "Please choose a tier" })
    .int()
    .min(1, "A minion's tier can't be lower than 0")
    .max(12, "A minion's tier can't be higher than 12")
    .default("" as unknown as number),
  amount: z.coerce
    .number({ required_error: "Please enter an amount" })
    .int()
    .min(1, "You must sell at least 1 minion")
    .max(64, "You can't sell more than 64 minions at once")
    .default("" as unknown as number),
  price: z.coerce
    .number({ required_error: "Please enter a price" })
    .int()
    .min(1, "Minion's price can't be lower than 1 coin")
    .max(9999999999999, "Minion's price can't be higher than 9999999999999 coins")
    .default("" as unknown as number),
  infusion: z.boolean()
});

export const formSchemaDelete = z.object({
  id: z.string()
});

export type FormSchemaCreate = typeof formSchemaCreate;

export type FormSchemaDelete = typeof formSchemaDelete;
