import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";
import { Message } from "@/models/User";

export const POST = async (request: Request) => {
  await dbConnect();

  const { username, content } = await request.json();

  try {
    const foundUser = await UserModel.findOne({ username });

    if (!foundUser) {
      return Response.json(
        {
          success: false,
          message: "User not found to send the message",
        },
        {
          status: 500,
        }
      );
    }

    const isAcceptingMessage = foundUser.isAcceptingMessages;

    if (!isAcceptingMessage) {
      return Response.json(
        {
          success: false,
          message:
            "The user is not accepting the new messages; your message could not be sent",
        },
        {
          status: 403,
        }
      );
    }

    const newMessage = { content, createdAt: new Date() };

    foundUser.messages.push(newMessage as Message);

    await foundUser.save();

    return Response.json(
      {
        success: true,
        message: "Message sent successfully !",
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(error, "Failed to send the message");
    return Response.json(
      {
        success: false,
        message: "Failed to send the message",
      },
      {
        status: 500,
      }
    );
  }
};
