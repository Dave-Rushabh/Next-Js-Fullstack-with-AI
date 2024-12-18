import dbConnect from "@/lib/dbConnect";
import { sendVerificationEmail } from "@/lib/resend/utils/sendVerificationEmail";
import UserModel from "@/models/User";
import bcrypt from "bcryptjs";

// Helper functions for verification code and expiry
function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function setVerificationCodeExpiry() {
  const expiryDate = new Date();
  expiryDate.setHours(expiryDate.getHours() + 1);
  return expiryDate;
}

// Helper function for sending the verification email
async function handleSendingEmailForCodeVerification(
  email: string,
  username: string,
  code: string,
  successMsg: string,
  FailureMsg: string
) {
  const sendingEmail = await sendVerificationEmail(email, username, code);

  if (sendingEmail.success) {
    return Response.json({ success: true, message: successMsg });
  } else {
    return Response.json({ success: false, message: FailureMsg });
  }
}

export const POST = async (request: Request) => {
  await dbConnect();

  try {
    const { username, email, password } = await request.json();
    const verifyCode = generateVerificationCode();
    const verifyCodeExpiry = setVerificationCodeExpiry();
    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if user exists with the given email or username
    const existingUser = await UserModel.findOne({
      $or: [{ email }, { username }],
    });

    if (!existingUser) {
      // User is unregistered, create a new user
      const newUser = new UserModel({
        username,
        email,
        password: hashedPassword,
        verifyCode,
        verifyCodeExpiry,
        isVerified: false,
        isAcceptingMessages: true,
        messages: [],
      });
      await newUser.save();
      return handleSendingEmailForCodeVerification(
        email,
        username,
        verifyCode,
        "User registered & Verification email sent",
        "User registered but issue while sending the verification email; please sign up again with same credentials"
      );
    } else if (!existingUser.isVerified) {
      // User exists but is unverified, update verification code and expiry
      existingUser.verifyCode = verifyCode;
      existingUser.verifyCodeExpiry = verifyCodeExpiry;
      existingUser.email = email;
      existingUser.password = hashedPassword;
      existingUser.username = username;
      await existingUser.save();
      return handleSendingEmailForCodeVerification(
        email,
        username,
        verifyCode,
        "Verification email resent. Please check your email",
        "Issue while sending the verification email; please sign up again with same credentials"
      );
    } else {
      // User is already registered and verified
      return Response.json({
        success: false,
        message:
          "User already exists. Please use a different email or username.",
      });
    }
  } catch (error) {
    console.error("Error registering the new user", error);
    return Response.json({
      success: false,
      message: "Error registering the new user",
    });
  }
};
