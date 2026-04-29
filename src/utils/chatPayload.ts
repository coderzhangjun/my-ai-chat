import type { Message } from "../types/message";

export interface ChatApiMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ContextBudgetOptions {
  maxMessages: number;
  maxTotalChars: number;
  maxMessageChars: number;
}

export const DEFAULT_CONTEXT_BUDGET: ContextBudgetOptions = {
  maxMessages: 12,
  maxTotalChars: 24000,
  maxMessageChars: 12000,
};

const TRUNCATION_MARKER = "\n\n[内容过长，已截断中间部分]\n\n";

const truncateMiddle = (content: string, maxChars: number): string => {
  if (content.length <= maxChars) {
    return content;
  }

  const markerLength = TRUNCATION_MARKER.length;
  const availableChars = Math.max(maxChars - markerLength, 0);
  const headLength = Math.ceil(availableChars * 0.35);
  const tailLength = Math.max(availableChars - headLength, 0);

  return `${content.slice(0, headLength)}${TRUNCATION_MARKER}${content.slice(
    -tailLength
  )}`;
};

export const prepareContextMessages = (
  messages: Message[],
  budget: ContextBudgetOptions = DEFAULT_CONTEXT_BUDGET
): Message[] => {
  let remainingChars = budget.maxTotalChars;
  const selected: Message[] = [];

  const candidates = messages
    .filter((msg) => !msg.loading && !msg.error && msg.content.trim() !== "")
    .slice(-budget.maxMessages);

  for (let index = candidates.length - 1; index >= 0; index -= 1) {
    if (remainingChars <= 0) {
      break;
    }

    const message = candidates[index];
    const normalizedContent = message.content.trim();
    const perMessageLimit = Math.min(budget.maxMessageChars, remainingChars);
    const content = truncateMiddle(normalizedContent, perMessageLimit);

    selected.unshift({
      ...message,
      content,
    });

    remainingChars -= content.length;
  }

  return selected;
};

export const toChatApiMessages = (
  conversationMessages: Message[],
  systemPrompt: string
): ChatApiMessage[] => [
  {
    role: "system",
    content: systemPrompt || "你是一个有帮助的AI助手",
  },
  ...conversationMessages.map((msg) => ({
    role: msg.role,
    content: msg.content,
  })),
];
