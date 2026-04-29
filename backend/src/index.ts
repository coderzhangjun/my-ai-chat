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
const JSON_LIMIT = process.env.JSON_LIMIT || "5mb";

const isPayloadTooLargeError = (
  error: unknown
): error is { status?: number; type?: string } =>
  typeof error === "object" &&
  error !== null &&
  ("status" in error || "type" in error);

// Middleware
app.use(
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"], // Allow frontend to connect
  })
);
app.use(express.json({ limit: JSON_LIMIT }));

app.use(
  (
    error: unknown,
    _req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    if (
      isPayloadTooLargeError(error) &&
      (error.status === 413 || error.type === "entity.too.large")
    ) {
      res.status(413).json({
        success: false,
        error: `请求内容超过服务端限制（${JSON_LIMIT}），请减少上下文或图片识别内容后重试`,
      });
      return;
    }

    next(error);
  }
);

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
