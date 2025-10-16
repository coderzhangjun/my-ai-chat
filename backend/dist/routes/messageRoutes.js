"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const messageController_1 = require("../controllers/messageController");
const router = express_1.default.Router();
// GET /api/messages/:conversationId - Get all messages for a conversation
router.get("/:conversationId", messageController_1.getMessagesByConversationId);
// POST /api/messages - Save messages for a conversation
router.post("/", messageController_1.saveMessages);
// DELETE /api/messages/:conversationId - Delete a conversation and its messages
router.delete("/:conversationId", messageController_1.deleteConversation);
exports.default = router;
