import express from "express";
import {
  getAllConversations,
  getConversation,
  updateConversationTitle,
} from "../controllers/conversationController";

const router = express.Router();

// GET /api/conversations - Get all conversations
router.get("/", getAllConversations);

// GET /api/conversations/:conversationId - Get a single conversation
router.get("/:conversationId", getConversation);

// PATCH /api/conversations/:conversationId - Update conversation title
router.patch("/:conversationId", updateConversationTitle);

export default router;
