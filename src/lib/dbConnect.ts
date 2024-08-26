import mongoose from "mongoose";

type ConnectionObj = {
  isConnected?: number;
};

const connection: ConnectionObj = {};

const dbConnect = async (): Promise<void> => {
  if (connection.isConnected) {
    console.log("Already connected to the DB");
    return;
  }

  try {
    const db = await mongoose.connect(process.env.MONGODB_URI || "", {});
    connection.isConnected = db.connections[0].readyState;
    console.log("DB connected successfully");
  } catch (error) {
    console.log("DB connection failed", error);
    process.exit(1);
  }
};

export default dbConnect;
