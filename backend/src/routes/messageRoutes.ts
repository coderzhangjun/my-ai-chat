import express from "express";
import {
  getMessagesByConversationId,
  saveMessages,
  deleteConversation,
} from "../controllers/messageController";

const router = express.Router();

// GET /api/messages/:conversationId - Get all messages for a conversation
router.get("/:conversationId", getMessagesByConversationId);

// POST /api/messages - Save messages for a conversation
router.post("/", saveMessages);

// DELETE /api/messages/:conversationId - Delete a conversation and its messages
router.delete("/:conversationId", deleteConversation);

export default router;
