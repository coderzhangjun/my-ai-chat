import type { Message } from "../types/message";

// API Base URL
const API_BASE_URL = "http://localhost:3001/api";

export interface ConversationSummary {
  conversationId: string;
  title: string;
  createdAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

interface BackendMessage {
  messageId: string;
  role: Message["role"];
  content: string;
  timestamp: string;
}

const summarizeErrorText = (text: string): string => {
  const normalized = text.trim().replace(/\s+/g, " ");

  if (!normalized) {
    return "";
  }

  if (normalized.startsWith("<!DOCTYPE") || normalized.startsWith("<html")) {
    return "服务器返回了 HTML 错误页，请检查接口地址或请求体大小限制";
  }

  return normalized.length > 300 ? `${normalized.slice(0, 300)}...` : normalized;
};

const readApiResponse = async <T>(
  response: Response,
  fallbackMessage: string
): Promise<ApiResponse<T>> => {
  const contentType = response.headers.get("content-type") ?? "";

  if (!contentType.includes("application/json")) {
    const text = await response.text().catch(() => "");
    throw new Error(
      `${fallbackMessage}: ${response.status} ${response.statusText}${
        text ? ` - ${summarizeErrorText(text)}` : ""
      }`
    );
  }

  const data = (await response.json()) as ApiResponse<T>;

  if (!response.ok || !data.success) {
    throw new Error(
      data.error ||
        `${fallbackMessage}: ${response.status} ${response.statusText}`
    );
  }

  return data;
};

/**
 * Saves chat messages to the backend
 * @param messages - Array of messages to save
 * @param conversationId - The conversation ID, generates a new one if not provided
 * @param title - Optional conversation title
 */
export const saveMessages = async (
  messages: Message[],
  conversationId: string,
  title?: string
): Promise<{ success: boolean; conversationId: string }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        conversationId,
        title,
        messages,
      }),
    });

    const data = await readApiResponse<{
      conversationId: string;
    }>(response, "Failed to save messages");

    return {
      success: true,
      conversationId: data.data.conversationId,
    };
  } catch (error) {
    console.error("Error saving messages:", error);
    return {
      success: false,
      conversationId,
    };
  }
};

/**
 * Fetches all conversations
 */
export const getConversations = async (): Promise<ConversationSummary[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/conversations`);
    const data = await readApiResponse<ConversationSummary[]>(
      response,
      "Failed to fetch conversations"
    );

    return data.data;
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return [];
  }
};

/**
 * Fetches messages from a specific conversation
 * @param conversationId - The conversation ID to fetch messages from
 */
export const getMessages = async (
  conversationId: string
): Promise<Message[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/messages/${conversationId}`);
    const data = await readApiResponse<BackendMessage[]>(
      response,
      "Failed to fetch messages"
    );

    if (!Array.isArray(data.data)) {
      console.error("API返回的data不是数组:", data.data);
      return [];
    }

    return data.data.map((msg) => ({
      id: msg.messageId,
      role: msg.role,
      content: msg.content,
      timestamp: msg.timestamp,
    }));
  } catch (error) {
    console.error("获取消息详细错误:", error);
    return [];
  }
};

/**
 * Deletes a conversation and all its messages
 * @param conversationId - The conversation ID to delete
 */
export const deleteConversation = async (
  conversationId: string
): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/messages/${conversationId}`, {
      method: "DELETE",
    });

    const data = await readApiResponse<unknown>(
      response,
      "Failed to delete conversation"
    );
    return data.success;
  } catch (error) {
    console.error("Error deleting conversation:", error);
    return false;
  }
};
