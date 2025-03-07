/**
 * 调用 Kimi 大模型 API 接口，传入用户消息，并通过回调函数处理流式响应数据
 * 注意：请将 API_KEY 替换为你实际的 API 密钥
 */
export async function sendToKimiAPI(
  userMessage: string,
  onChunk: (chunk: string) => void
): Promise<void> {
  // 假设的 Kimi API URL，请根据实际情况修改
  const API_URL = "https://api.kimi.example.com/v1/chat";
  // TODO: 替换为你的实际 API Key
  const API_KEY = "YOUR_API_KEY_HERE";

  // 发起 POST 请求，设置 stream 参数开启流式响应
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      prompt: userMessage,
      stream: true,
    }),
  });

  if (!response.ok || !response.body) {
    throw new Error(`API 请求失败: ${response.statusText}`);
  }

  // 读取响应的流数据
  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let done = false;

  // 循环读取每个数据块，并通过回调函数返回
  while (!done) {
    const { value, done: doneReading } = await reader.read();
    done = doneReading;
    if (value) {
      const chunk = decoder.decode(value);
      onChunk(chunk);
    }
  }
}
