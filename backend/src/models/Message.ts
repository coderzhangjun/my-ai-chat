import mongoose, { Document, Schema } from "mongoose";

// Define the Message interface
export interface IMessage extends Document {
  messageId: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  conversationId: string;
}

// Create the Message schema
const MessageSchema: Schema = new Schema(
  {
    messageId: {
      type: String,
      required: true,
      unique: true,
    },
    role: {
      type: String,
      enum: ["user", "assistant"],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    conversationId: {
      type: String,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create and export the Message model
export default mongoose.model<IMessage>("Message", MessageSchema);
