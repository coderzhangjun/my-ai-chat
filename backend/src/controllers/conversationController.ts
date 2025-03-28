import { Request, Response } from "express";
import Conversation from "../models/Conversation";

// Get all conversations
export const getAllConversations = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const conversations = await Conversation.find()
      .sort({ updatedAt: -1 })
      .exec();

    res.status(200).json({
      success: true,
      count: conversations.length,
      data: conversations,
    });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

// Get a single conversation
export const getConversation = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { conversationId } = req.params;

    const conversation = await Conversation.findOne({ conversationId });

    if (!conversation) {
      res.status(404).json({
        success: false,
        error: "Conversation not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: conversation,
    });
  } catch (error) {
    console.error("Error fetching conversation:", error);
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

// Update conversation title
export const updateConversationTitle = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { conversationId } = req.params;
    const { title } = req.body;

    if (!title) {
      res.status(400).json({
        success: false,
        error: "Please provide a title",
      });
      return;
    }

    const conversation = await Conversation.findOneAndUpdate(
      { conversationId },
      { title },
      { new: true }
    );

    if (!conversation) {
      res.status(404).json({
        success: false,
        error: "Conversation not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: conversation,
    });
  } catch (error) {
    console.error("Error updating conversation title:", error);
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};
