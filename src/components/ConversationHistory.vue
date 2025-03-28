<template>
  <div class="conversation-history">
    <h3 class="history-title">历史对话</h3>

    <div v-if="isLoading" class="loading">
      <div class="spinner"></div>
      <span>加载中...</span>
    </div>

    <div v-else-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </div>

    <div v-else-if="conversations.length === 0" class="empty-state">
      暂无历史对话
    </div>

    <ul v-else class="conversation-list">
      <li
        v-for="conversation in conversations"
        :key="conversation.conversationId"
        class="conversation-item"
        :class="{
          active: conversation.conversationId === currentConversationId,
        }"
        @click="loadConversation(conversation.conversationId)"
      >
        <div class="conversation-title">{{ conversation.title }}</div>
        <div class="conversation-date">
          {{ formatDate(conversation.createdAt) }}
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { getConversations } from "../api/chatHistory";
import { useChatStore } from "../store/chat";

const chatStore = useChatStore();
const currentConversationId = chatStore.currentConversationId;

const conversations = ref<any[]>([]);
const isLoading = ref(false);
const errorMessage = ref("");

// Format date to readable string
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return (
    date.toLocaleDateString() +
    " " +
    date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  );
};

// Load conversation from store
const loadConversation = async (conversationId: string) => {
  await chatStore.loadConversation(conversationId);
};

// Fetch conversations on mount
onMounted(async () => {
  isLoading.value = true;
  errorMessage.value = "";

  try {
    conversations.value = await getConversations();
  } catch (error) {
    console.error("Failed to fetch conversations:", error);
    errorMessage.value = "无法加载对话历史";
  } finally {
    isLoading.value = false;
  }
});
</script>

<style scoped>
.conversation-history {
  border-radius: var(--radius-md);
  background-color: var(--bg-white);
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-md);
  box-shadow: var(--shadow-sm);
}

.history-title {
  font-size: 16px;
  font-weight: 600;
  margin-top: 0;
  margin-bottom: var(--spacing-md);
  color: var(--text-dark);
}

.conversation-list {
  list-style: none;
  padding: 0;
  margin: 0;
  max-height: 300px;
  overflow-y: auto;
}

.conversation-item {
  padding: var(--spacing-sm);
  border-radius: var(--radius-sm);
  cursor: pointer;
  margin-bottom: var(--spacing-xs);
  transition: all 0.2s ease;
  border-left: 3px solid transparent;
}

.conversation-item:hover {
  background-color: var(--bg-light);
}

.conversation-item.active {
  border-left-color: var(--primary-color);
  background-color: rgba(0, 132, 255, 0.08);
}

.conversation-title {
  font-weight: 500;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.conversation-date {
  font-size: 12px;
  color: #666;
}

.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-md);
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(0, 132, 255, 0.3);
  border-radius: 50%;
  border-top-color: var(--primary-color);
  animation: spin 1s linear infinite;
  margin-right: var(--spacing-sm);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error-message {
  color: #e53935;
  padding: var(--spacing-md);
  text-align: center;
}

.empty-state {
  color: #666;
  padding: var(--spacing-md);
  text-align: center;
  font-style: italic;
}
</style>
