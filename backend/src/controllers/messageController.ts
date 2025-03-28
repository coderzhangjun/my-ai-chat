import { Request, Response } from "express";
import Message, { IMessage } from "../models/Message";
import Conversation from "../models/Conversation";

// Get all messages from a specific conversation
export const getMessagesByConversationId = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { conversationId } = req.params;

    const messages = await Message.find({ conversationId })
      .sort({ timestamp: 1 })
      .exec();

    res.status(200).json({
      success: true,
      count: messages.length,
      data: messages,
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

// Save a batch of messages for a conversation
export const saveMessages = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { conversationId, title, messages } = req.body;

    if (!conversationId || !messages || !Array.isArray(messages)) {
      res.status(400).json({
        success: false,
        error: "Please provide a valid conversationId and messages array",
      });
      return;
    }

    // Check if conversation exists, if not create it
    const existingConversation = await Conversation.findOne({ conversationId });

    if (!existingConversation) {
      // Create a new conversation
      await Conversation.create({
        conversationId,
        title: title || `Conversation ${new Date().toLocaleString()}`,
      });
    } else if (title) {
      // Update conversation title if provided
      await Conversation.updateOne({ conversationId }, { title });
    }

    // Process messages in batch
    const messagesToSave = messages.map((msg) => ({
      messageId: msg.id,
      role: msg.role,
      content: msg.content,
      timestamp: new Date(msg.timestamp),
      conversationId,
    }));

    // Use insertMany with ordered: false to continue on duplicate key errors
    // and upsert to update existing messages
    const result = await Message.bulkWrite(
      messagesToSave.map((message) => ({
        updateOne: {
          filter: { messageId: message.messageId },
          update: message,
          upsert: true,
        },
      }))
    );

    res.status(201).json({
      success: true,
      data: {
        upsertedCount: result.upsertedCount,
        modifiedCount: result.modifiedCount,
        conversationId,
      },
    });
  } catch (error) {
    console.error("Error saving messages:", error);
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

// Delete all messages from a specific conversation
export const deleteConversation = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { conversationId } = req.params;

    // Delete the conversation
    await Conversation.deleteOne({ conversationId });

    // Delete all messages in the conversation
    const result = await Message.deleteMany({ conversationId });

    res.status(200).json({
      success: true,
      data: {
        deletedCount: result.deletedCount,
        conversationId,
      },
    });
  } catch (error) {
    console.error("Error deleting conversation:", error);
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};
