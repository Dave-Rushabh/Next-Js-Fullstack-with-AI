import { z } from "zod";

export const signUpSchema = z.object({
  username: z
    .string()
    .min(4, "username must be at least 4 characters")
    .max(20, "username must not be more than 20 characters")
    .regex(/^[a-zA-Z0-9]+$/, "Username must not contain special characters"),
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(6, { message: "password must be at least 6 characters long" }),
});
