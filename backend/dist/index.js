"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = require("./config/db");
const messageRoutes_1 = __importDefault(require("./routes/messageRoutes"));
const conversationRoutes_1 = __importDefault(require("./routes/conversationRoutes"));
// Load environment variables
dotenv_1.default.config();
// Connect to database
(0, db_1.connectDB)();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// Middleware
app.use((0, cors_1.default)({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"], // Allow frontend to connect
}));
app.use(express_1.default.json());
// Routes
app.use("/api/messages", messageRoutes_1.default);
app.use("/api/conversations", conversationRoutes_1.default);
// Basic route
app.get("/", (req, res) => {
    res.send("AI Chat History API is running");
});
// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
