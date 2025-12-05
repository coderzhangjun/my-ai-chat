import { defineStore, storeToRefs } from "pinia";
import { ref, watch } from "vue";
import type { Message } from "../types/message";
import { sendToDeepseekAPI } from "../api/deepseek";
import { sendToCustomModelAPI } from "../api/customModel";
import {
  saveMessages,
  getMessages,
  deleteConversation,
} from "../api/chatHistory";
import { useRoleStore } from "./roles";
import { useModelStore } from "./models";

// 上下文窗口大小：保留最近 20 条消息（约 10 轮对话）
const MAX_CONTEXT_MESSAGES = 20;

export const useChatStore = defineStore("chat", () => {
  // From localStorage, load the current conversation ID or generate a new one
  const currentConversationId = ref<string>(
    localStorage.getItem("currentConversationId") || Date.now().toString()
  );

  // From localStorage, load messages
  const messages = ref<Message[]>(
    JSON.parse(localStorage.getItem("chatMessages") || "[]")
  );

  // Loading state for conversations
  const isLoading = ref<boolean>(false);

  // Error message
  const errorMessage = ref<string>("");

  // Watch for changes to currentConversationId and save to localStorage
  watch(currentConversationId, (newConversationId) => {
    localStorage.setItem("currentConversationId", newConversationId);
  });

  // Watch for changes to messages and save to localStorage and backend
  watch(
    messages,
    async (newMessages) => {
      localStorage.setItem("chatMessages", JSON.stringify(newMessages));

      // 仅在有消息时尝试保存到后端
      if (newMessages.length > 0) {
        // === 新增：如果存在 loading 消息（流式中），则跳过保存，避免频繁写入 ===
        const hasLoading = newMessages.some((msg) => msg.loading === true);
        if (hasLoading) {
          return;
        }

        try {
          // Create a title from the first user message if available
          const firstUserMessage = newMessages.find(
            (msg) => msg.role === "user"
          );
          const title = firstUserMessage
            ? firstUserMessage.content.substring(0, 50) +
              (firstUserMessage.content.length > 50 ? "..." : "")
            : `Conversation ${new Date().toLocaleString()}`;

          await saveMessages(newMessages, currentConversationId.value, title);
        } catch (error) {
          console.error("Failed to save messages to backend:", error);
        }
      }
    },
    { deep: true }
  );

  // Send message to AI
  const sendMessageToAI = async (text: string) => {
    const roleStore = useRoleStore();
    const modelStore = useModelStore();
    const { currentModel } = storeToRefs(modelStore);
    const { currentRole } = storeToRefs(roleStore);
    const activeModel = currentModel.value;

    if (!activeModel) {
      throw new Error("未找到可用模型，请先配置模型");
    }
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: new Date().toISOString(),
    };
    messages.value.push(userMessage);

    // Add AI message placeholder
    const aiMessageId = (Date.now() + 1).toString();
    const aiMessage: Message = {
      id: aiMessageId,
      role: "assistant",
      content: "",
      timestamp: new Date().toISOString(),
      loading: true,
    };
    messages.value.push(aiMessage);

    // === 流式配置 ===
    const TYPEWRITER_MODE = false; // true=打字机模式(更慢更明显), false=节流模式(更快)
    const UPDATE_INTERVAL = 150; // 节流模式的更新间隔（毫秒）- 调大让流式更明显
    const TYPEWRITER_SPEED = 30; // 打字机模式：每个字符显示间隔（毫秒）

    let contentBuffer = ""; // 累积从 API 返回的内容
    let displayedLength = 0; // 已经显示的字符长度
    let lastUpdateTime = 0;
    let chunkCount = 0;
    let typewriterTimer: number | null = null; // 打字机定时器

    console.log(
      `🚀 [流式输出] 开始请求 AI (模式: ${
        TYPEWRITER_MODE ? "打字机" : "节流"
      })...`
    );

    // 打字机效果：逐字显示函数
    const startTypewriter = () => {
      if (typewriterTimer) return; // 已经在运行

      typewriterTimer = setInterval(() => {
        if (displayedLength >= contentBuffer.length) {
          // 已经显示完所有内容，但可能还有新内容到来，继续等待
          return;
        }

        // 每次增加 1-3 个字符（随机，更自然）
        const step = Math.floor(Math.random() * 3) + 1;
        displayedLength = Math.min(
          displayedLength + step,
          contentBuffer.length
        );

        const index = messages.value.findIndex((msg) => msg.id === aiMessageId);
        if (index !== -1) {
          messages.value[index].content = contentBuffer.substring(
            0,
            displayedLength
          );
          console.log(
            `⌨️ [打字机] 显示进度: ${displayedLength}/${contentBuffer.length}`
          );
        }
      }, TYPEWRITER_SPEED);
    };

    // 停止打字机
    const stopTypewriter = () => {
      if (typewriterTimer) {
        clearInterval(typewriterTimer);
        typewriterTimer = null;
        console.log("⏹️ [打字机] 停止");
      }
    };

    try {
      // 准备上下文消息
      const contextMessages = messages.value
        .slice(0, -1)
        .filter((msg) => !msg.loading && !msg.error)
        .slice(-MAX_CONTEXT_MESSAGES);

      // 启动打字机效果（如果启用）
      if (TYPEWRITER_MODE) {
        startTypewriter();
      }

      const apiKeyForModel =
        activeModel.provider === "deepseek"
          ? activeModel.apiKey || import.meta.env.VITE_DEEPSEEK_API_KEY || ""
          : activeModel.apiKey || "";

      if (!apiKeyForModel) {
        throw new Error("请先为当前模型填写 API Key");
      }

      console.log(
        "[chat] 使用模型:",
        JSON.stringify(
          {
            id: activeModel.id,
            provider: activeModel.provider,
            model: activeModel.model,
            baseUrl: activeModel.baseUrl,
            endpoint: activeModel.endpoint,
          },
          null,
          2
        )
      );

      const handleChunk = (chunk: string) => {
        chunkCount++;
        const safeChunk =
          chunk === null || chunk === undefined
            ? ""
            : typeof chunk === "object"
            ? JSON.stringify(chunk)
            : String(chunk);
        contentBuffer += safeChunk;

        if (chunkCount <= 3 || chunkCount % 10 === 0) {
          console.log(
            `📦 [Chunk #${chunkCount}] Buffer总长: ${contentBuffer.length}`
          );
        }

        if (!TYPEWRITER_MODE) {
          const now = Date.now();
          const timeSinceLastUpdate = now - lastUpdateTime;
          if (lastUpdateTime === 0 || timeSinceLastUpdate >= UPDATE_INTERVAL) {
            const index = messages.value.findIndex(
              (msg) => msg.id === aiMessageId
            );
            if (index !== -1) {
              messages.value[index].content = contentBuffer;
              console.log(
                `✨ [节流更新] 显示内容长度: ${contentBuffer.length}，间隔: ${timeSinceLastUpdate}ms`
              );
            }
            lastUpdateTime = now;
          }
        }
      };

      const systemPrompt = currentRole.value.systemPrompt;

      if (activeModel.provider === "deepseek") {
        await sendToDeepseekAPI(contextMessages, systemPrompt, handleChunk, {
          apiKey: apiKeyForModel,
          model: activeModel.model,
          baseUrl: activeModel.baseUrl,
        });
      } else {
        await sendToCustomModelAPI(contextMessages, systemPrompt, handleChunk, {
          apiKey: apiKeyForModel,
          model: activeModel.model,
          baseUrl: activeModel.baseUrl,
          endpoint: activeModel.endpoint,
        });
      }

      console.log(
        `✅ [流式完成] 共收到 ${chunkCount} 个chunk，总长度: ${contentBuffer.length}`
      );

      // 如果是打字机模式，等待所有内容显示完成
      if (TYPEWRITER_MODE) {
        console.log("⏳ [打字机] 等待显示完成...");
        // 等待打字机显示完所有内容
        while (displayedLength < contentBuffer.length) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
        stopTypewriter();
      }

      // === 流式结束后，确保最终内容和状态更新 ===
      const index = messages.value.findIndex((msg) => msg.id === aiMessageId);
      if (index !== -1) {
        messages.value[index].content = contentBuffer; // 保证收尾完整
        messages.value[index].loading = false;
        console.log("🎉 [完成] 设置 loading = false，准备保存到后端");
      }
    } catch (error) {
      console.error("❌ [错误] 发送消息失败:", error);

      // 清理打字机定时器
      stopTypewriter();

      // Handle error, update AI message to error state
      const index = messages.value.findIndex((msg) => msg.id === aiMessageId);
      if (index !== -1) {
        messages.value[index].content = "抱歉，发生了错误，请稍后再试。";
        messages.value[index].loading = false;
        (messages.value[index] as any).error = true;
      }
    }
  };

  // Clear chat messages (删除当前对话)
  const clearMessages = async () => {
    try {
      // Delete conversation from backend if it exists
      if (messages.value.length > 0) {
        await deleteConversation(currentConversationId.value);
      }

      // Clear local messages
      messages.value = [];

      // Generate a new conversation ID
      currentConversationId.value = Date.now().toString();

      // 触发历史列表更新
      window.dispatchEvent(new CustomEvent("conversation-updated"));
    } catch (error) {
      console.error("Error clearing messages:", error);
      errorMessage.value = "Failed to clear conversation";
    }
  };

  // Start new conversation (开始新对话，保留旧对话)
  const startNewConversation = async () => {
    // 当前对话会自动通过 watch 保存到后端
    // 直接清空消息数组并生成新的对话 ID
    messages.value = [];
    currentConversationId.value = Date.now().toString();

    // 触发自定义事件，通知历史列表更新
    window.dispatchEvent(new CustomEvent("conversation-updated"));
  };

  // Load messages from a specific conversation
  const loadConversation = async (conversationId: string) => {
    isLoading.value = true;
    errorMessage.value = "";

    try {
      const fetchedMessages = await getMessages(conversationId);

      if (fetchedMessages.length > 0) {
        messages.value = fetchedMessages;
        currentConversationId.value = conversationId;
      } else {
        errorMessage.value = "No messages found for this conversation";
      }
    } catch (error) {
      console.error("Error loading conversation:", error);
      errorMessage.value = "Failed to load conversation";
    } finally {
      isLoading.value = false;
    }
  };

  return {
    messages,
    currentConversationId,
    isLoading,
    errorMessage,
    sendMessageToAI,
    clearMessages,
    startNewConversation,
    loadConversation,
  };
});
