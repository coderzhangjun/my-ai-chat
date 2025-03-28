import mongoose, { Document, Schema } from "mongoose";

// Define the Conversation interface
export interface IConversation extends Document {
  conversationId: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
}

// Create the Conversation schema
const ConversationSchema: Schema = new Schema(
  {
    conversationId: {
      type: String,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create and export the Conversation model
export default mongoose.model<IConversation>(
  "Conversation",
  ConversationSchema
);
