const MAX_ERROR_DETAIL_LENGTH = 500;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const stringifyUnknown = (value: unknown): string => {
  if (typeof value === "string") {
    return value;
  }

  if (value === undefined || value === null) {
    return "";
  }

  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
};

const extractErrorMessage = (value: unknown): string => {
  if (!isRecord(value)) {
    return "";
  }

  const error = value.error;
  if (typeof error === "string") {
    return error;
  }

  if (isRecord(error) && typeof error.message === "string") {
    return error.message;
  }

  if (typeof value.message === "string") {
    return value.message;
  }

  return "";
};

const summarizeText = (text: string): string => {
  const normalized = text.trim().replace(/\s+/g, " ");

  if (!normalized) {
    return "";
  }

  if (normalized.startsWith("<!DOCTYPE") || normalized.startsWith("<html")) {
    return "服务器返回了 HTML 错误页，请检查接口地址、代理配置或请求体大小限制。";
  }

  return normalized.length > MAX_ERROR_DETAIL_LENGTH
    ? `${normalized.slice(0, MAX_ERROR_DETAIL_LENGTH)}...`
    : normalized;
};

export const readApiErrorMessage = async (
  response: Response,
  label: string
): Promise<string> => {
  const rawText = await response.text().catch(() => "");
  let detail = summarizeText(rawText);

  if ((response.headers.get("content-type") ?? "").includes("application/json")) {
    try {
      const parsed: unknown = JSON.parse(rawText);
      detail = extractErrorMessage(parsed) || detail;
    } catch {
      detail = detail || "错误响应不是有效 JSON。";
    }
  }

  return `${label}: ${response.status} ${response.statusText}${
    detail ? ` - ${detail}` : ""
  }`;
};

const extractDeltaContent = (value: unknown): string => {
  if (!isRecord(value) || !Array.isArray(value.choices)) {
    return "";
  }

  const firstChoice = value.choices[0];
  if (!isRecord(firstChoice) || !isRecord(firstChoice.delta)) {
    return "";
  }

  const content = stringifyUnknown(firstChoice.delta.content);
  if (content) {
    return content;
  }

  return stringifyUnknown(firstChoice.delta.reasoning_content);
};

const parseStreamLine = (line: string): unknown | null => {
  if (line.includes(": keep-alive") || !line.includes("data: ")) {
    return null;
  }

  const jsonText = line.replace(/^data:\s*/, "").trim();
  if (jsonText === "[DONE]" || !jsonText.startsWith("{")) {
    return null;
  }

  return JSON.parse(jsonText) as unknown;
};

export const readOpenAICompatibleStream = async (
  response: Response,
  onChunk: (chunk: string) => void,
  logPrefix: string
): Promise<number> => {
  if (!response.body) {
    throw new Error(`${logPrefix} 响应体为空`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let pendingText = "";
  let totalChunks = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      pendingText += decoder.decode();
      break;
    }

    pendingText += decoder.decode(value, { stream: true });
    const lines = pendingText.split("\n");
    pendingText = lines.pop() ?? "";

    for (const line of lines) {
      try {
        const parsed = parseStreamLine(line);
        const content = extractDeltaContent(parsed);
        if (content) {
          totalChunks += 1;
          onChunk(content);
        }
      } catch (error) {
        console.warn(`${logPrefix} 跳过无法解析的数据块:`, error);
      }
    }
  }

  if (pendingText.trim()) {
    try {
      const parsed = parseStreamLine(pendingText);
      const content = extractDeltaContent(parsed);
      if (content) {
        totalChunks += 1;
        onChunk(content);
      }
    } catch (error) {
      console.warn(`${logPrefix} 跳过末尾不完整的数据块:`, error);
    }
  }

  return totalChunks;
};
