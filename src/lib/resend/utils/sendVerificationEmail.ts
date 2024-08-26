import { ApiResponse } from "./../../../types/ApiResponse";
import VerificationEmail from "../emailTemplates/VerificationEmail";
import { resend } from "../resend";

export async function sendVerificationEmail(
  email: string,
  username: string,
  verifyCode: string
): Promise<ApiResponse> {
  try {
    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: email,
      subject: "Stealth Message | Verification code",
      react: VerificationEmail({ username, otp: verifyCode }),
    });

    return { success: true, message: "Verification email sent successfully" };
  } catch (error) {
    console.error("Error sending verification email", error);
    return {
      success: false,
      message: "Error sending verification email",
    };
  }
}
