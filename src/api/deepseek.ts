// 发送消息到 DeepSeek API 并处理流式响应
export const sendToDeepseekAPI = async (
  userMessage: string,
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

    // 4. 构造请求体，与 OpenAI 类似
    const requestBody = {
      model: modelName,
      messages: [
        {
          role: "user",
          content: userMessage,
        },
      ],
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
      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

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
            if (jsonStr === "[DONE]") continue;

            // 确保是有效的 JSON 字符串
            if (!jsonStr.startsWith("{")) {
              continue;
            }

            const json = JSON.parse(jsonStr);
            // 提取实际的消息内容
            if (json.choices && json.choices[0] && json.choices[0].delta) {
              const content = json.choices[0].delta.content;
              if (content) {
                onChunk(content);
              }
            }
          } catch (e) {
            console.error("解析响应数据出错，跳过此行:", line);
            console.debug("详细错误:", e);
          }
        }
      }
    } else {
      // 如果不支持流式响应，则作为普通响应处理
      const data = await response.json();
      onChunk(data.response || "");
    }
  } catch (error) {
    console.error("API 请求错误:", error);
    throw error;
  }
};
