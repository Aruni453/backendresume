import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    collation: { locale: 'en', strength: 2 },
  },
  password: {
    type: String,
    required: true,
  },
  resumesCreated: {
    type: Number,
    default: 0,
  },
  authType: {
    type: String,
    enum: ['jwt', 'session'],
    default: 'jwt',
  },
},{timestamps:true});

export default mongoose.model("User", userSchema);
