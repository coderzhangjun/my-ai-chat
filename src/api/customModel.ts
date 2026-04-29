import type { Message } from "../types/message";
import { readApiErrorMessage, readOpenAICompatibleStream } from "./openAiStream";
import { toChatApiMessages } from "../utils/chatPayload";

export interface CustomModelOptions {
  apiKey: string;
  baseUrl: string;
  model: string;
  endpoint?: string;
}

export const sendToCustomModelAPI = async (
  conversationMessages: Message[],
  systemPrompt: string,
  onChunk: (chunk: string) => void,
  options: CustomModelOptions
): Promise<void> => {
  const { apiKey, baseUrl, model, endpoint = "/v1/chat/completions" } = options;

  if (!apiKey) {
    throw new Error("缺少自定义模型 API Key");
  }
  if (!baseUrl) {
    throw new Error("缺少自定义模型 Base URL");
  }
  if (!model) {
    throw new Error("缺少自定义模型名称");
  }

  const cleanBase = baseUrl.replace(/\/+$/, "");
  const apiMessages = toChatApiMessages(conversationMessages, systemPrompt);

  console.log(
    "[custom-model] 请求配置:",
    JSON.stringify(
      {
        model,
        baseUrl: cleanBase,
        endpoint,
        messageCount: apiMessages.length,
      },
      null,
      2
    )
  );

  const response = await fetch(`${cleanBase}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: apiMessages,
      stream: true,
    }),
  });

  if (!response.ok) {
    const message = await readApiErrorMessage(response, "自定义模型请求失败");
    console.error("[custom-model] 请求失败", message);
    throw new Error(message);
  }

  await readOpenAICompatibleStream(response, onChunk, "[custom-model]");
};
