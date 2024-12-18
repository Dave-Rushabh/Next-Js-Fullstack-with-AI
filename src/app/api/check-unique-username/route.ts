import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";
import { z } from "zod";

const UsernameQuerySchema = z.object({
  username: z
    .string()
    .min(4, "username must be at least 4 characters")
    .max(20, "username must not be more than 20 characters")
    .regex(/^[a-zA-Z0-9]+$/, "Username must not contain special characters"),
});

export async function GET(request: Request) {
  await dbConnect();

  try {
    const { searchParams } = new URL(request.url);
    const queryParam = {
      username: searchParams.get("username"),
    };

    // validate with ZOD
    const result = UsernameQuerySchema.safeParse(queryParam);

    if (!result.success) {
      const usernameErrors = result.error.format().username?._errors || [];
      return Response.json(
        {
          success: false,
          message:
            usernameErrors?.length > 0
              ? usernameErrors?.join(",")
              : "Invalid query params",
        },
        { status: 400 }
      );
    }

    const { username } = result.data;

    const existingVerifiedUser = await UserModel.findOne({
      username,
      isVerified: true,
    });

    if (existingVerifiedUser) {
      return Response.json(
        {
          success: false,
          message: "Username is already taken",
        },
        { status: 400 }
      );
    }

    return Response.json(
      {
        success: true,
        message: "Username is available",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("error while checking the unique username", error);
    return Response.json(
      {
        success: false,
        message: "Error while checking the username",
      },
      { status: 500 }
    );
  }
}
