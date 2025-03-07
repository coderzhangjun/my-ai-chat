import { defineStore } from "pinia";
import { sendToDeepseekAPI } from "../api/deepseek";

export interface Message {
  type: "user" | "ai";
  text: string;
}

export const useChatStore = defineStore("chat", {
  state: () => ({
    messages: [] as Message[],
  }),
  actions: {
    addMessage(message: Message) {
      this.messages.push(message);
    },
    async sendMessageToAI(userText: string) {
      try {
        // 先将用户消息插入
        this.addMessage({ type: "user", text: userText });
        // 再插入一条空 AI 消息，用于后续拼接流式内容
        this.addMessage({ type: "ai", text: "" });

        // 调用 DeepSeek API
        await sendToDeepseekAPI(userText, (chunk: string) => {
          const lastMessage = this.messages[this.messages.length - 1];
          if (lastMessage && lastMessage.type === "ai") {
            lastMessage.text += chunk;
          }
        });
      } catch (error) {
        console.error("调用 DeepSeek API 失败:", error);
        this.addMessage({
          type: "ai",
          text: "对话接口调用失败，请稍后重试。",
        });
      }
    },
  },
});
