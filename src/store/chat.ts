import { defineStore } from "pinia";
import { ref, watch } from "vue";
import type { Message } from "../types/message";
import { sendToDeepseekAPI } from "../api/deepseek";
import {
  saveMessages,
  getMessages,
  deleteConversation,
} from "../api/chatHistory";
import { useRoleStore } from "./roles";

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

      // Only save to backend if there are messages
      if (newMessages.length > 0) {
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

    try {
      // Call API for AI response
      let responseContent = "";

      await sendToDeepseekAPI(
        text,
        roleStore.currentRole.systemPrompt,
        (chunk: string) => {
          try {
            // Try to parse JSON response
            const jsonData = JSON.parse(chunk);

            // Check for valid content field
            if (jsonData.choices && jsonData.choices.content) {
              responseContent += jsonData.choices.content;
            } else if (
              jsonData.data &&
              jsonData.data.choices &&
              jsonData.data.choices.content
            ) {
              responseContent += jsonData.data.choices.content;
            } else if (jsonData.content) {
              responseContent += jsonData.content;
            } else {
              // If expected content fields not found, try other possible fields
              const possibleContentFields = [
                "content",
                "text",
                "message",
                "response",
              ];
              for (const field of possibleContentFields) {
                if (jsonData[field] && typeof jsonData[field] === "string") {
                  responseContent += jsonData[field];
                  break;
                }
              }
            }
          } catch (e) {
            // If not JSON format, add text content directly
            // Filter possible JSON string prefix
            const cleanedChunk = chunk.replace(/^data:\s*/, "").trim();
            if (cleanedChunk && cleanedChunk !== "[DONE]") {
              responseContent += cleanedChunk;
            }
          }

          // Update AI message content
          const index = messages.value.findIndex(
            (msg) => msg.id === aiMessageId
          );
          if (index !== -1) {
            messages.value[index].content = responseContent;
          }
        }
      );

      // Remove loading state when complete
      const index = messages.value.findIndex((msg) => msg.id === aiMessageId);
      if (index !== -1) {
        messages.value[index].loading = false;
      }
    } catch (error) {
      console.error("Error sending message to AI:", error);
      // Handle error, update AI message to error state
      const index = messages.value.findIndex((msg) => msg.id === aiMessageId);
      if (index !== -1) {
        messages.value[index].content = "抱歉，发生了错误，请稍后再试。";
        messages.value[index].loading = false;
        messages.value[index].error = true;
      }
    }
  };

  // Clear chat messages
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
    } catch (error) {
      console.error("Error clearing messages:", error);
      errorMessage.value = "Failed to clear conversation";
    }
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
    loadConversation,
  };
});
