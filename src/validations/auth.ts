import { z } from "zod";

export const loginSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(1, "Enter your username or email.")
    .max(254, "Username or email is too long."),
  password: z
    .string()
    .min(1, "Enter your password.")
    .max(128, "Password is too long."),
  rememberMe: z.boolean(),
});

export type LoginInput = z.infer<typeof loginSchema>;
