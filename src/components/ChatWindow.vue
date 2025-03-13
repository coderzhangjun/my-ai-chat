<template>
  <div class="chat-window" id="chatWindow">
    <!-- 标题栏和控制按钮 -->
    <div class="chat-header">
      <h2 class="chat-title">AI 聊天</h2>
      <div class="header-controls">
        <!-- 添加清除按钮 -->
        <button
          class="clear-button"
          @click="handleClearChat"
          title="清除聊天记录"
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
        <ViewControls
          :showAddButton="false"
          @add="handleAddChat"
          targetElementId="chatWindow"
        />
      </div>
    </div>

    <!-- 消息列表区域 -->
    <div class="messages" ref="messagesContainer">
      <!-- 遍历 Pinia store 中的消息数组，使用 ChatMessage 展示每条消息 -->
      <ChatMessage
        v-for="(msg, index) in messages"
        :key="index"
        :message="msg"
        :class="{ 'message-appear': true }"
        :style="{ animationDelay: `${index * 0.1}s` }"
      />
    </div>

    <!-- 消息输入组件，发送消息时触发 handleSendMessage 方法 -->
    <ChatInput @sendMessage="handleSendMessage" />
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, watch } from "vue";
import { useChatStore } from "../store/chat";
import ChatMessage from "./ChatMessage.vue";
import ChatInput from "./ChatInput.vue";
import ViewControls from "./ViewControls.vue";

// 获取 Pinia 中的 chat store
const chatStore = useChatStore();
const messages = chatStore.messages;

/**
 * 当发送新消息时：
 * 1. 将用户消息添加到 store 中
 * 2. 调用 sendMessageToAI 方法处理流式响应
 */
const handleSendMessage = async (text: string) => {
  await chatStore.sendMessageToAI(text);
};

// 处理添加新聊天的方法（如果需要）
const handleAddChat = () => {
  // 实现添加新聊天的逻辑
  console.log("添加新聊天");
};

// 处理清除聊天记录
const handleClearChat = () => {
  if (confirm("确定要清除所有聊天记录吗？此操作不可恢复。")) {
    chatStore.clearMessages();
  }
};

// 自动滚动到最新消息，保证对话窗口始终显示最新消息
const messagesContainer = ref<HTMLDivElement | null>(null);
const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  });
};

// 监听消息变化，更新滚动位置
watch(
  () => messages.length,
  () => {
    scrollToBottom();
  }
);
</script>

<style scoped>
/* 聊天窗口整体布局 */
.chat-window {
  display: flex;
  flex-direction: column;
  height: 100vh;
  max-height: 600px;
  border-radius: var(--radius-md);
  overflow: hidden;
  box-shadow: var(--shadow-md);
  background-color: var(--bg-white);
  transition: all 0.3s ease;
}

/* 添加聊天标题栏样式 */
.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px var(--spacing-md);
  background-color: var(--bg-light);
  border-bottom: 1px solid var(--border-color, #eee);
}

.chat-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-color, #333);
}

/* 标题栏控制按钮组 */
.header-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 清除按钮样式 */
.clear-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  cursor: pointer;
  color: var(--text-color, #666);
  border-radius: var(--radius-sm, 4px);
  transition: all 0.2s;
}

.clear-button:hover {
  background-color: var(--bg-hover, rgba(0, 0, 0, 0.05));
  color: #f5222d; /* 红色提示危险操作 */
}

/* 消息区域样式 */
.messages {
  flex: 1;
  padding: var(--spacing-md);
  overflow-y: auto;
  background: var(--bg-light);
  scroll-behavior: smooth;
}

/* 消息出现动画 */
.message-appear {
  animation: fadeIn 0.3s ease forwards;
}

/* 滚动条样式 */
.messages::-webkit-scrollbar {
  width: 6px;
}

.messages::-webkit-scrollbar-track {
  background: transparent;
}

.messages::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 20px;
}

/* 响应式：移动端样式调整 */
@media (max-width: 600px) {
  .chat-window {
    max-height: calc(100vh - 100px);
    margin-bottom: var(--spacing-md);
  }
}
</style>
