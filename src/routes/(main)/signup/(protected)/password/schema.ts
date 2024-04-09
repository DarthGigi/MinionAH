import { z } from "zod";
export const formSchema = z
  .object({
    username: z.string().min(3).max(16).optional(),
    "new-password": z.string().min(8, "Password must be at least 8 characters"),
    "confirm-password": z.string()
  })
  .refine((data) => data["new-password"] === data["confirm-password"], {
    message: "Passwords don't match",
    path: ["confirm-password"]
  });
export type FormSchema = typeof formSchema;
