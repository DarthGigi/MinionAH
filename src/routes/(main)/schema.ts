import { z } from "zod";
export const formSchema = z.object({
  search: z.string().max(32),
  tier: z.number().int().min(0).max(12)
});
export type FormSchema = typeof formSchema;
