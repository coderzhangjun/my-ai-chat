import { defineStore, storeToRefs } from "pinia";
import { ref, watch } from "vue";
import type { Message } from "../types/message";
import type { UploadedDocument } from "../types/document";
import { sendToDeepseekAPI } from "../api/deepseek";
import { sendToCustomModelAPI } from "../api/customModel";
import {
  saveMessages,
  getMessages,
  deleteConversation,
} from "../api/chatHistory";
import {
  DEFAULT_CONTEXT_BUDGET,
  prepareContextMessages,
} from "../utils/chatPayload";
import { buildDocumentContext } from "../utils/documents";
import { useRoleStore } from "./roles";
import { useModelStore } from "./models";

const STREAM_UPDATE_INTERVAL = 240;
const MAX_ACTIVE_DOCUMENTS = 5;

const parseStoredMessages = (): Message[] => {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem("chatMessages") || "[]");
    return Array.isArray(parsed) ? (parsed as Message[]) : [];
  } catch (error) {
    console.error("加载本地聊天记录失败:", error);
    return [];
  }
};

export const useChatStore = defineStore("chat", () => {
  // From localStorage, load the current conversation ID or generate a new one
  const currentConversationId = ref<string>(
    localStorage.getItem("currentConversationId") || Date.now().toString()
  );

  // From localStorage, load messages
  const messages = ref<Message[]>(
    parseStoredMessages()
  );

  const uploadedDocuments = ref<UploadedDocument[]>([]);

  // Loading state for conversations
  const isLoading = ref<boolean>(false);

  // Error message
  const errorMessage = ref<string>("");

  // Watch for changes to currentConversationId and save to localStorage
  watch(currentConversationId, (newConversationId) => {
    localStorage.setItem("currentConversationId", newConversationId);
  });

  const getPersistableMessages = (items: Message[]) =>
    items.filter((msg) => !msg.loading);

  const persistLocalMessages = () => {
    localStorage.setItem(
      "chatMessages",
      JSON.stringify(getPersistableMessages(messages.value))
    );
  };

  const getConversationTitle = (items: Message[]) => {
    const firstUserMessage = items.find((msg) => msg.role === "user");
    return firstUserMessage
      ? firstUserMessage.content.substring(0, 50) +
          (firstUserMessage.content.length > 50 ? "..." : "")
      : `Conversation ${new Date().toLocaleString()}`;
  };

  const saveCurrentConversation = async () => {
    const stableMessages = getPersistableMessages(messages.value);
    if (stableMessages.length === 0) {
      return;
    }

    try {
      await saveMessages(
        stableMessages,
        currentConversationId.value,
        getConversationTitle(stableMessages)
      );
      window.dispatchEvent(new CustomEvent("conversation-updated"));
    } catch (error) {
      console.error("Failed to save messages to backend:", error);
    }
  };

  const sendMessageToAI = async (text: string) => {
    const roleStore = useRoleStore();
    const modelStore = useModelStore();
    const { currentModel } = storeToRefs(modelStore);
    const { currentRole } = storeToRefs(roleStore);
    const activeModel = currentModel.value;

    if (!activeModel) {
      throw new Error("未找到可用模型，请先配置模型");
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: new Date().toISOString(),
    };
    messages.value.push(userMessage);

    const aiMessageId = (Date.now() + 1).toString();
    const aiMessage: Message = {
      id: aiMessageId,
      role: "assistant",
      content: "",
      timestamp: new Date().toISOString(),
      loading: true,
    };
    messages.value.push(aiMessage);
    persistLocalMessages();

    let contentBuffer = ""; // 累积从 API 返回的内容
    let lastUpdateTime = 0;
    let chunkCount = 0;

    const updateAssistantMessage = (content: string, loading = true) => {
      const index = messages.value.findIndex((msg) => msg.id === aiMessageId);
      if (index !== -1) {
        messages.value[index].content = content;
        messages.value[index].loading = loading;
      }
    };

    try {
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

      const documentContext = buildDocumentContext(uploadedDocuments.value, text);
      const apiMessages = [...messages.value.slice(0, -1)];
      const latestUserIndex = apiMessages.length - 1;

      if (documentContext && latestUserIndex >= 0) {
        apiMessages[latestUserIndex] = {
          ...userMessage,
          content: `${documentContext}\n\n用户问题：\n${text}`,
        };
      }

      const contextMessages = prepareContextMessages(
        apiMessages,
        DEFAULT_CONTEXT_BUDGET
      );

      const handleChunk = (chunk: string) => {
        chunkCount++;
        contentBuffer += chunk;

        const now = Date.now();
        if (lastUpdateTime === 0 || now - lastUpdateTime >= STREAM_UPDATE_INTERVAL) {
          updateAssistantMessage(contentBuffer);
          lastUpdateTime = now;
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

      console.log(`✅ [流式完成] ${chunkCount} chunks，长度 ${contentBuffer.length}`);
      updateAssistantMessage(contentBuffer, false);
      persistLocalMessages();
      await saveCurrentConversation();
    } catch (error) {
      console.error("❌ [错误] 发送消息失败:", error);

      const index = messages.value.findIndex((msg) => msg.id === aiMessageId);
      if (index !== -1) {
        messages.value[index].content =
          error instanceof Error ? error.message : "抱歉，发生了错误，请稍后再试。";
        messages.value[index].loading = false;
        messages.value[index].error = true;
      }
      persistLocalMessages();
      await saveCurrentConversation();
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
      uploadedDocuments.value = [];

      // Generate a new conversation ID
      currentConversationId.value = Date.now().toString();
      persistLocalMessages();

      // 触发历史列表更新
      window.dispatchEvent(new CustomEvent("conversation-updated"));
    } catch (error) {
      console.error("Error clearing messages:", error);
      errorMessage.value = "Failed to clear conversation";
    }
  };

  // Start new conversation (开始新对话，保留旧对话)
  const startNewConversation = async () => {
    await saveCurrentConversation();

    // 当前对话会自动通过 watch 保存到后端
    // 直接清空消息数组并生成新的对话 ID
    messages.value = [];
    uploadedDocuments.value = [];
    currentConversationId.value = Date.now().toString();
    persistLocalMessages();

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
        uploadedDocuments.value = [];
        currentConversationId.value = conversationId;
        persistLocalMessages();
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

  const attachDocument = (document: UploadedDocument) => {
    uploadedDocuments.value = [
      document,
      ...uploadedDocuments.value.filter((item) => item.id !== document.id),
    ].slice(0, MAX_ACTIVE_DOCUMENTS);
  };

  const removeDocument = (documentId: string) => {
    uploadedDocuments.value = uploadedDocuments.value.filter(
      (document) => document.id !== documentId
    );
  };

  const clearDocuments = () => {
    uploadedDocuments.value = [];
  };

  return {
    messages,
    uploadedDocuments,
    currentConversationId,
    isLoading,
    errorMessage,
    sendMessageToAI,
    clearMessages,
    startNewConversation,
    loadConversation,
    attachDocument,
    removeDocument,
    clearDocuments,
  };
});
