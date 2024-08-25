import { z } from "zod";

export const verifyCodeSchema = z.object({
  code: z.string().length(6, "Verification code must be of 6 digits"),
});
