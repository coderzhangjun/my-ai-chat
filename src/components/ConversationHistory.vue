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
      >
        <div
          class="conversation-content"
          @click="loadConversation(conversation.conversationId)"
        >
          <div class="conversation-title">{{ conversation.title }}</div>
          <div class="conversation-date">
            {{ formatDate(conversation.createdAt) }}
          </div>
        </div>
        <button
          class="delete-button"
          @click.stop="handleDeleteConversation(conversation.conversationId)"
          title="删除对话"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
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
import { ref, onMounted, onUnmounted, computed } from "vue";
import { getConversations, deleteConversation } from "../api/chatHistory";
import { useChatStore } from "../store/chat";

const chatStore = useChatStore();
const currentConversationId = computed(() => chatStore.currentConversationId);

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

// Fetch conversations
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

// Delete conversation
const handleDeleteConversation = async (conversationId: string) => {
  if (!confirm("确定要删除这个对话吗？此操作不可恢复。")) {
    return;
  }

  try {
    const success = await deleteConversation(conversationId);
    if (success) {
      // 如果删除的是当前对话，则清空当前消息
      if (conversationId === currentConversationId.value) {
        chatStore.startNewConversation();
      }
      // 重新加载对话列表
      await fetchConversations();
    } else {
      alert("删除对话失败，请重试");
    }
  } catch (error) {
    console.error("Error deleting conversation:", error);
    alert("删除对话时出错");
  }
};

// Fetch conversations on mount
onMounted(async () => {
  await fetchConversations();

  // 监听对话更新事件
  window.addEventListener("conversation-updated", fetchConversations);
});

// 清理事件监听
onUnmounted(() => {
  window.removeEventListener("conversation-updated", fetchConversations);
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
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-sm);
  border-radius: var(--radius-sm);
  margin-bottom: var(--spacing-xs);
  transition: all 0.2s ease;
  border-left: 3px solid transparent;
  gap: 8px;
}

.conversation-item:hover {
  background-color: var(--bg-light);
}

.conversation-item.active {
  border-left-color: var(--primary-color);
  background-color: rgba(0, 132, 255, 0.08);
}

.conversation-content {
  flex: 1;
  cursor: pointer;
  min-width: 0;
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

.delete-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  cursor: pointer;
  color: #999;
  border-radius: 4px;
  transition: all 0.15s ease;
  flex-shrink: 0;
  opacity: 0;
}

.conversation-item:hover .delete-button {
  opacity: 1;
}

.delete-button:hover {
  background: #fee;
  color: #e53935;
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
