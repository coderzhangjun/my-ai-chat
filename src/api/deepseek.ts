/**
 * 调用 Deepseek API 接口，传入用户消息，并通过回调函数处理流式响应数据
 */
export async function sendToDeepseekAPI(
  userMessage: string,
  onChunk: (chunk: string) => void
): Promise<void> {
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

  // 6. 读取流式响应
  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let done = false;

  while (!done) {
    const { value, done: doneReading } = await reader.read();
    done = doneReading;
    if (value) {
      // DeepSeek / OpenAI 风格流式返回通常以 "data: " 开头，分多行
      const chunk = decoder.decode(value);

      // 如果官方文档说明返回格式是纯文本，可直接 onChunk(chunk)
      // 如果与 OpenAI SSE 格式相同，需要解析每行 data
      // 以下示例演示如何解析 SSE 格式：
      const lines = chunk.split("\n");
      for (const line of lines) {
        const trimmed = line.trim();
        // 跳过空行或结束标志
        if (!trimmed || trimmed === "data: [DONE]") {
          continue;
        }
        if (trimmed.startsWith("data:")) {
          // 取出 "data:" 后面的 JSON 字符串
          const jsonStr = trimmed.substring(5).trim();
          try {
            const jsonData = JSON.parse(jsonStr);
            // 如果 DeepSeek 与 OpenAI 格式类似，则 tokens 内容在 choices[].delta.content
            // 也可能在其它字段，请参考官方文档自行修改
            const token = jsonData.choices?.[0]?.delta?.content || "";
            // 通过回调函数把文本传给前端
            if (token) {
              onChunk(token);
            }
          } catch (err) {
            console.warn("解析 DeepSeek SSE 数据失败：", err);
          }
        }
      }
    }
  }
}
