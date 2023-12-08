import { z } from "zod";

// mincraft username regex is /^[a-zA-Z0-9_]{3,16}$/
export const formSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(16, "Username must be at most 16 characters")
    .regex(/^[a-zA-Z0-9_]{3,16}$/, "Username must be 3-16 characters and only contain letters, numbers, and underscores"),
  "current-password": z.string().min(8, "Passwords are at least 8 characters")
});
export type FormSchema = typeof formSchema;
