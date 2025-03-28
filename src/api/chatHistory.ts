import type { Message } from "../types/message";

// API Base URL
const API_BASE_URL = "http://localhost:3001/api";

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

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || "Failed to save messages");
    }

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
export const getConversations = async (): Promise<any[]> => {
  console.log("API URL:", `${API_BASE_URL}/conversations`);
  try {
    const response = await fetch(`${API_BASE_URL}/conversations`);
    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || "Failed to fetch conversations");
    }

    return data.data;
  } catch (error) {
    console.error("Error details:", error);
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
  console.log("请求消息API URL:", `${API_BASE_URL}/messages/${conversationId}`);

  try {
    const response = await fetch(`${API_BASE_URL}/messages/${conversationId}`);
    console.log("API响应状态:", response.status);

    const data = await response.json();
    console.log("API响应数据:", data);

    if (!data.success) {
      throw new Error(data.error || "Failed to fetch messages");
    }

    // 检查数据结构
    if (!Array.isArray(data.data)) {
      console.error("API返回的data不是数组:", data.data);
      return [];
    }

    // 转换格式
    return data.data.map((msg: any) => ({
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

    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error("Error deleting conversation:", error);
    return false;
  }
};
