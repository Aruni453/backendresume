import mongoose from "mongoose";

let isConnected = false; // track connection status

export const connectDB = async () => {
  mongoose.set("strictQuery", true);

  if (isConnected) {
    console.log("=> Using existing database connection");
    return;
  }

  try {
    let mongoUrl = process.env.MONGO_URL;
    
    if (!mongoUrl) {
      throw new Error("MONGO_URL is not defined in environment variables");
    }

    console.log("Attempting to connect to MongoDB...");
    
    const db = await mongoose.connect(mongoUrl);
    isConnected = db.connections[0].readyState;
    console.log("=> New database connection established");
    
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    console.error("\n=== TROUBLESHOOTING ===");
    console.error("1. Make sure your MongoDB Atlas cluster is running");
    console.error("2. Check your IP is whitelisted in MongoDB Atlas > Network Access");
    console.error("3. Verify MONGO_URL in .env file is correct");
    
    // For development, don't crash - just log the error
    if (process.env.NODE_ENV !== 'production') {
      console.log("\n=== Running in development mode - continuing without DB ===");
      return;
    }
    
    throw error; 
  }
};
