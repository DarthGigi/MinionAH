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
    .max(512, "You can't sell more than 512 minions at once")
    .default("" as unknown as number),
  price: z.coerce
    .number({ required_error: "Please enter a price" })
    .int()
    .min(1, "Minion's price can't be lower than 1 coin")
    .max(10000000000000, "Minion's price can't be higher than 10000000000000 coins")
    .default("" as unknown as number),
  infusion: z.boolean(),
  "free-will": z.boolean(),
  negotiable: z.boolean().default(false)
});

export const formSchemaDelete = z.object({
  id: z.string()
});

export const formSchemaBump = z.object({
  id: z.string()
});

export type FormSchemaCreate = typeof formSchemaCreate;

export type FormSchemaDelete = typeof formSchemaDelete;

export type FormSchemaBump = typeof formSchemaBump;
