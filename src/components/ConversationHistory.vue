<template>
  <div class="conversation-history">
    <div class="history-header">
      <h3 class="history-title">聊天</h3>
    </div>

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
        :class="{ active: conversation.conversationId === currentConversationId }"
      >
        <button
          class="conversation-content"
          @click="loadConversation(conversation.conversationId)"
          :title="conversation.title"
        >
          <span class="conversation-title">{{ conversation.title }}</span>
          <span class="conversation-date">
            {{ formatDate(conversation.createdAt) }}
          </span>
        </button>
        <button
          class="delete-button"
          @click.stop="handleDeleteConversation(conversation.conversationId)"
          title="删除对话"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M3 6h18"></path>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
            <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        </button>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import {
  deleteConversation,
  getConversations,
  type ConversationSummary,
} from "../api/chatHistory";
import { useChatStore } from "../store/chat";

const chatStore = useChatStore();
const currentConversationId = computed(() => chatStore.currentConversationId);

const conversations = ref<ConversationSummary[]>([]);
const isLoading = ref(false);
const errorMessage = ref("");

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString([], {
    month: "2-digit",
    day: "2-digit",
  });
};

const loadConversation = async (conversationId: string) => {
  await chatStore.loadConversation(conversationId);
};

const fetchConversations = async () => {
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
};

const handleDeleteConversation = async (conversationId: string) => {
  if (!confirm("确定要删除这个对话吗？此操作不可恢复。")) {
    return;
  }

  try {
    const success = await deleteConversation(conversationId);
    if (!success) {
      alert("删除对话失败，请重试");
      return;
    }

    if (conversationId === currentConversationId.value) {
      await chatStore.startNewConversation();
    }

    await fetchConversations();
  } catch (error) {
    console.error("Error deleting conversation:", error);
    alert("删除对话时出错");
  }
};

onMounted(async () => {
  await fetchConversations();
  window.addEventListener("conversation-updated", fetchConversations);
});

onUnmounted(() => {
  window.removeEventListener("conversation-updated", fetchConversations);
});
</script>

<style scoped>
.conversation-history {
  display: flex;
  flex: 1;
  min-height: 0;
  flex-direction: column;
}

.history-header {
  flex-shrink: 0;
  padding: 4px 6px 8px;
}

.history-title {
  margin: 0;
  font-size: 13px;
  font-weight: 650;
  color: var(--text-secondary);
}

.conversation-list {
  flex: 1;
  min-height: 0;
  list-style: none;
  padding: 0;
  margin: 0;
  overflow-y: auto;
}

.conversation-item {
  display: flex;
  align-items: center;
  gap: 4px;
  border-radius: var(--radius-md);
  margin-bottom: 2px;
  transition: background var(--transition-fast);
}

.conversation-item:hover,
.conversation-item.active {
  background: var(--bg-hover);
}

.conversation-content {
  display: flex;
  flex: 1;
  min-width: 0;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  padding: 10px 8px;
  border: none;
  background: transparent;
  color: var(--text-primary);
  text-align: left;
  cursor: pointer;
}

.conversation-title {
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 14px;
  line-height: 1.25;
}

.conversation-date {
  font-size: 12px;
  color: var(--text-muted);
}

.delete-button {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 30px;
  height: 30px;
  margin-right: 4px;
  border: none;
  background: transparent;
  cursor: pointer;
  color: var(--text-muted);
  border-radius: var(--radius-sm);
  transition: opacity var(--transition-fast), background var(--transition-fast),
    color var(--transition-fast);
  opacity: 0;
}

.conversation-item:hover .delete-button {
  opacity: 1;
}

.delete-button:hover {
  background: #f9dedc;
  color: #d93025;
}

.loading,
.error-message,
.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 88px;
  padding: 16px;
  color: var(--text-muted);
  font-size: 13px;
  text-align: center;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid var(--border-light);
  border-top-color: var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.error-message {
  color: #d93025;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 900px) {
  .conversation-list {
    max-height: 190px;
  }
}
</style>
