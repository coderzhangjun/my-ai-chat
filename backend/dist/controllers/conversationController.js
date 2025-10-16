"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateConversationTitle = exports.getConversation = exports.getAllConversations = void 0;
const Conversation_1 = __importDefault(require("../models/Conversation"));
// Get all conversations
const getAllConversations = async (req, res) => {
    try {
        const conversations = await Conversation_1.default.find()
            .sort({ updatedAt: -1 })
            .exec();
        res.status(200).json({
            success: true,
            count: conversations.length,
            data: conversations,
        });
    }
    catch (error) {
        console.error("Error fetching conversations:", error);
        res.status(500).json({
            success: false,
            error: "Server Error",
        });
    }
};
exports.getAllConversations = getAllConversations;
// Get a single conversation
const getConversation = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const conversation = await Conversation_1.default.findOne({ conversationId });
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
    }
    catch (error) {
        console.error("Error fetching conversation:", error);
        res.status(500).json({
            success: false,
            error: "Server Error",
        });
    }
};
exports.getConversation = getConversation;
// Update conversation title
const updateConversationTitle = async (req, res) => {
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
        const conversation = await Conversation_1.default.findOneAndUpdate({ conversationId }, { title }, { new: true });
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
    }
    catch (error) {
        console.error("Error updating conversation title:", error);
        res.status(500).json({
            success: false,
            error: "Server Error",
        });
    }
};
exports.updateConversationTitle = updateConversationTitle;
