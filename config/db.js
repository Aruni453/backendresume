import mongoose from "mongoose";

let isConnected = false; // track connection status

export const connectDB = async () => {
  mongoose.set("strictQuery", true);

  if (isConnected) {
    console.log("=> Using existing database connection");
    return;
  }

  try {
    const db = await mongoose.connect(process.env.MONGO_URL);
    isConnected = db.connections[0].readyState;
    console.log("=> New database connection established");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    // DO NOT process.exit(1) here on Vercel
    throw error; 
  }
};
