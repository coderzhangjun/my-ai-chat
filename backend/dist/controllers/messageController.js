"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteConversation = exports.saveMessages = exports.getMessagesByConversationId = void 0;
const Message_1 = __importDefault(require("../models/Message"));
const Conversation_1 = __importDefault(require("../models/Conversation"));
// Get all messages from a specific conversation
const getMessagesByConversationId = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const messages = await Message_1.default.find({ conversationId })
            .sort({ timestamp: 1 })
            .exec();
        res.status(200).json({
            success: true,
            count: messages.length,
            data: messages,
        });
    }
    catch (error) {
        console.error("Error fetching messages:", error);
        res.status(500).json({
            success: false,
            error: "Server Error",
        });
    }
};
exports.getMessagesByConversationId = getMessagesByConversationId;
// Save a batch of messages for a conversation
const saveMessages = async (req, res) => {
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
        const existingConversation = await Conversation_1.default.findOne({ conversationId });
        if (!existingConversation) {
            // Create a new conversation
            await Conversation_1.default.create({
                conversationId,
                title: title || `Conversation ${new Date().toLocaleString()}`,
            });
        }
        else if (title) {
            // Update conversation title if provided
            await Conversation_1.default.updateOne({ conversationId }, { title });
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
        const result = await Message_1.default.bulkWrite(messagesToSave.map((message) => ({
            updateOne: {
                filter: { messageId: message.messageId },
                update: message,
                upsert: true,
            },
        })));
        res.status(201).json({
            success: true,
            data: {
                upsertedCount: result.upsertedCount,
                modifiedCount: result.modifiedCount,
                conversationId,
            },
        });
    }
    catch (error) {
        console.error("Error saving messages:", error);
        res.status(500).json({
            success: false,
            error: "Server Error",
        });
    }
};
exports.saveMessages = saveMessages;
// Delete all messages from a specific conversation
const deleteConversation = async (req, res) => {
    try {
        const { conversationId } = req.params;
        // Delete the conversation
        await Conversation_1.default.deleteOne({ conversationId });
        // Delete all messages in the conversation
        const result = await Message_1.default.deleteMany({ conversationId });
        res.status(200).json({
            success: true,
            data: {
                deletedCount: result.deletedCount,
                conversationId,
            },
        });
    }
    catch (error) {
        console.error("Error deleting conversation:", error);
        res.status(500).json({
            success: false,
            error: "Server Error",
        });
    }
};
exports.deleteConversation = deleteConversation;
