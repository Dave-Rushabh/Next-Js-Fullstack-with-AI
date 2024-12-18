import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";

export async function POST(request: Request) {
  await dbConnect();

  try {
    const { username, code } = await request.json();

    const decodedUsername = decodeURIComponent(username);

    const existingUser = await UserModel.findOne({ username: decodedUsername });

    if (!existingUser) {
      return Response.json(
        {
          success: false,
          message: "user not found",
        },
        { status: 404 }
      );
    }
    const isCodeValid =
      existingUser.verifyCode === code &&
      new Date(existingUser.verifyCodeExpiry) > new Date();

    if (!isCodeValid) {
      return Response.json(
        {
          success: false,
          message:
            "Verification code is expired or invalid, please signup with the same credentials to get verified",
        },
        { status: 400 }
      );
    }

    existingUser.isVerified = true;
    await existingUser.save();

    return Response.json(
      {
        success: true,
        message: "Account verified successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("error occurred while verifying the code", error);
    return Response.json(
      {
        success: false,
        message: "error occurred while verifying the code",
      },
      { status: 500 }
    );
  }
}
