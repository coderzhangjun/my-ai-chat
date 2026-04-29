import type { Message } from "../types/message";
import { readApiErrorMessage, readOpenAICompatibleStream } from "./openAiStream";
import { toChatApiMessages } from "../utils/chatPayload";

export interface DeepseekOptions {
  apiKey: string;
  model?: string;
  baseUrl?: string;
}

export const sendToDeepseekAPI = async (
  conversationMessages: Message[],
  systemPrompt: string,
  onChunk: (chunk: string) => void,
  options: DeepseekOptions
): Promise<void> => {
  try {
    const baseUrl = options.baseUrl || "https://api.deepseek.com";
    const endpoint = "/v1/chat/completions";
    const apiKey = options.apiKey;
    const modelName = options.model || "deepseek-v4-pro";

    if (!apiKey) {
      throw new Error("缺少 DeepSeek API Key");
    }

    const apiMessages = toChatApiMessages(conversationMessages, systemPrompt);

    console.log(
      `📤 [API] 发送请求，上下文消息数: ${conversationMessages.length}`
    );

    const requestBody = {
      model: modelName,
      messages: apiMessages,
      stream: true,
      stream_options: {
        include_usage: true,
      },
      ...(modelName.startsWith("deepseek-v4")
        ? {
            thinking: { type: "enabled" as const },
            reasoning_effort: "high",
          }
        : {}),
    };

    const response = await fetch(baseUrl + endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(await readApiErrorMessage(response, "DeepSeek API 请求失败"));
    }

    console.log("📡 [API] 开始接收流式响应...");
    const totalChunks = await readOpenAICompatibleStream(
      response,
      onChunk,
      "[DeepSeek API]"
    );
    console.log(`✅ [API] 流式接收完成，共处理 ${totalChunks} 个数据块`);
  } catch (error) {
    console.error("API 请求错误:", error);
    throw error;
  }
};
