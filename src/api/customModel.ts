import type { Message } from "../types/message";

interface APIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

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
  const apiMessages: APIMessage[] = [
    { role: "system", content: systemPrompt || "你是一个有帮助的AI助手" },
    ...conversationMessages
      .filter((msg) => !msg.loading && !msg.error)
      .map((msg) => ({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      })),
  ];

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

  if (!response.ok || !response.body) {
    const text = await response.text().catch(() => "");
    console.error("[custom-model] 请求失败", response.status, text);
    throw new Error(
      `自定义模型请求失败: ${response.status} ${response.statusText}`
    );
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });
    const lines = chunk.split("\n").filter((line) => line.trim() !== "");

    for (const line of lines) {
      if (line.includes(": keep-alive") || !line.includes("data: ")) continue;
      const jsonStr = line.replace(/^data: /, "").trim();
      if (jsonStr === "[DONE]") continue;
      if (!jsonStr.startsWith("{")) continue;
      const parsed = JSON.parse(jsonStr);
      const delta = parsed.choices?.[0]?.delta;
      const content: unknown = delta?.content ?? "";
      if (typeof content === "string" && content) {
        onChunk(content);
      }
    }
  }
};
