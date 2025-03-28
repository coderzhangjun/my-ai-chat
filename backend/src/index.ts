import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db";
import messageRoutes from "./routes/messageRoutes";
import conversationRoutes from "./routes/conversationRoutes";

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"], // Allow frontend to connect
  })
);
app.use(express.json());

// Routes
app.use("/api/messages", messageRoutes);
app.use("/api/conversations", conversationRoutes);

// Basic route
app.get("/", (req, res) => {
  res.send("AI Chat History API is running");
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
