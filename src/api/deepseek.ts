import type { Message } from "../types/message";

// API 消息格式
interface APIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

// 发送消息到 DeepSeek API 并处理流式响应
export const sendToDeepseekAPI = async (
  conversationMessages: Message[],
  systemPrompt: string,
  onChunk: (chunk: string) => void
): Promise<void> => {
  try {
    // 1. 确认 baseUrl 与 endpoint：下面示例假设官方提供的 Chat Completion 接口为：
    //    https://api.deepseek.com/v1/chat/completions
    //    若文档有不同，请自行调整
    const baseUrl = "https://api.deepseek.com";
    const endpoint = "/v1/chat/completions";

    // 2. 替换为你的 DeepSeek API Key
    const API_KEY = "sk-1f14395493b147fda9bcec3ae04e6126";

    // 3. 选择合适的模型名称（如 "DeepSeek-R1" 或 "DeepSeek-V3"）
    const modelName = "deepseek-reasoner";

    // 4. 构造消息数组：系统提示 + 历史对话
    const enhancedSystemPrompt = systemPrompt || "你是一个有帮助的AI助手";

    // 过滤掉 loading 和 error 状态的消息，并映射为 API 格式
    const apiMessages: APIMessage[] = [
      {
        role: "system",
        content: enhancedSystemPrompt,
      },
      ...conversationMessages
        .filter((msg) => !msg.loading && !msg.error)
        .map((msg) => ({
          role: msg.role as "user" | "assistant",
          content: msg.content,
        })),
    ];

    console.log(
      `📤 [API] 发送请求，上下文消息数: ${conversationMessages.length}`
    );

    // 5. 构造请求体
    const requestBody = {
      model: modelName,
      messages: apiMessages,
      stream: true,
    };

    // 5. 发起请求
    const response = await fetch(baseUrl + endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // DeepSeek 同样使用 Bearer Token 进行认证
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok || !response.body) {
      throw new Error(
        `DeepSeek API 请求失败: ${response.status} ${response.statusText}`
      );
    }
    // 检查是否支持流式响应
    if (response.body) {
      console.log("📡 [API] 开始接收流式响应...");
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let totalChunks = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          console.log(`✅ [API] 流式接收完成，共处理 ${totalChunks} 个数据块`);
          break;
        }

        // 解码并处理响应块
        const chunk = decoder.decode(value, { stream: true });
        // 处理数据流
        const lines = chunk.split("\n").filter((line) => line.trim() !== "");

        for (const line of lines) {
          try {
            // 忽略 keep-alive 和其他非 JSON 数据
            if (line.includes(": keep-alive") || !line.includes("data: ")) {
              continue;
            }

            // 移除 "data: " 前缀
            const jsonStr = line.replace(/^data: /, "").trim();
            if (jsonStr === "[DONE]") {
              console.log("🏁 [API] 收到 [DONE] 标记");
              continue;
            }

            // 确保是有效的 JSON 字符串
            if (!jsonStr.startsWith("{")) {
              continue;
            }

            const json = JSON.parse(jsonStr);
            // 提取实际的消息内容
            if (json.choices && json.choices[0] && json.choices[0].delta) {
              const delta = json.choices[0].delta;

              // DeepSeek-reasoner 可能返回 reasoning_content（思考过程）和 content（最终回答）
              // 我们需要处理这两种情况，并确保只处理字符串类型
              let content = "";

              // 处理思考内容（如果存在）
              if (
                delta.reasoning_content &&
                typeof delta.reasoning_content === "string"
              ) {
                content = delta.reasoning_content;
              }

              // 处理正常回答内容（优先级更高）
              if (delta.content && typeof delta.content === "string") {
                content = delta.content;
              }

              if (content) {
                totalChunks++;
                // 只在开发时显示详细日志
                // console.log(
                //   `⬇️ [API] 收到内容块 #${totalChunks}:`,
                //   content.substring(0, 20) + (content.length > 20 ? "..." : "")
                // );
                onChunk(content);
              }
            }
          } catch (e) {
            console.error(
              "❌ [API] 解析响应数据出错，跳过此行:",
              line.substring(0, 100)
            );
            console.debug("详细错误:", e);
          }
        }
      }
    } else {
      console.warn("⚠️ [API] 不支持流式响应，使用普通模式");
      // 如果不支持流式响应，则作为普通响应处理
      const data = await response.json();
      onChunk(data.response || "");
    }
  } catch (error) {
    console.error("API 请求错误:", error);
    throw error;
  }
};
