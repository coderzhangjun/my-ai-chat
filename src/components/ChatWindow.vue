<template>
  <div class="chat-window" id="chatWindow">
    <!-- 标题栏和控制按钮 -->
    <div class="chat-header">
      <div class="header-left">
        <div class="status-indicator"></div>
        <h2 class="chat-title">聊天对话</h2>
      </div>
      <div class="header-controls">
        <!-- 开始新对话按钮 -->
        <button
          class="new-chat-button"
          @click="handleNewChat"
          title="开始新对话"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
            ></path>
            <line x1="12" y1="9" x2="12" y2="15"></line>
            <line x1="9" y1="12" x2="15" y2="12"></line>
          </svg>
        </button>
        <!-- 清除按钮 -->
        <button
          class="clear-button"
          @click="handleClearChat"
          title="清除当前对话"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
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
      <!-- 欢迎消息 -->
      <div v-if="messages.length === 0" class="welcome-message">
        <div class="welcome-icon">💬</div>
        <h3>开始新的对话</h3>
        <p>我是你的智能助手，有什么可以帮助你的吗？</p>
      </div>

      <!-- 遍历 Pinia store 中的消息数组，使用 ChatMessage 展示每条消息 -->
      <ChatMessage
        v-for="(msg, index) in messages"
        :key="msg.id"
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
import { ref, nextTick, watch, computed } from "vue";
import { useChatStore } from "../store/chat";
import ChatMessage from "./ChatMessage.vue";
import ChatInput from "./ChatInput.vue";
import ViewControls from "./ViewControls.vue";

// 获取 Pinia 中的 chat store
const chatStore = useChatStore();
// 使用 computed 确保响应式
const messages = computed(() => chatStore.messages);

/**
 * 当发送新消息时：
 * 1. 将用户消息添加到 store 中
 * 2. 调用 sendMessageToAI 方法处理流式响应
 */
const handleSendMessage = async (text: string) => {
  await chatStore.sendMessageToAI(text);
};

// 处理开始新对话
const handleNewChat = async () => {
  if (messages.value.length === 0) {
    // 如果当前没有消息，无需操作
    return;
  }

  if (confirm("开始新对话？当前对话将自动保存到历史记录。")) {
    await chatStore.startNewConversation();
  }
};

// 处理添加新聊天的方法（如果需要）
const handleAddChat = () => {
  // 实现添加新聊天的逻辑
  console.log("添加新聊天");
};

// 处理清除聊天记录
const handleClearChat = async () => {
  if (confirm("确定要清除当前对话吗？此操作不可恢复。")) {
    await chatStore.clearMessages();
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
  () => [
    messages.value.length,
    messages.value[messages.value.length - 1]?.content,
  ],
  () => {
    console.log("🔄 [ChatWindow] Watch触发，消息数:", messages.value.length);
    scrollToBottom();
  }
);
</script>

<style scoped>
.chat-window {
  display: flex;
  flex-direction: column;
  height: 100vh;
  max-height: 700px;
  background: #ffffff;
  border: 1px solid #e5e5e5;
  overflow: hidden;
}

.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #ffffff;
  border-bottom: 1px solid #e5e5e5;
  position: relative;
  z-index: 10;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-indicator {
  display: none;
}

.chat-title {
  margin: 0;
  font-size: 14px;
  font-weight: 500;
  color: #353740;
}

.header-controls {
  display: flex;
  align-items: center;
  gap: 4px;
}

.new-chat-button,
.clear-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  cursor: pointer;
  color: #6e6e80;
  border-radius: 6px;
  transition: all 0.15s ease;
}

.new-chat-button:hover,
.clear-button:hover {
  background: #f7f7f8;
  color: #353740;
}

.new-chat-button:hover {
  color: #10a37f;
}

.messages {
  flex: 1;
  padding: 0;
  overflow-y: auto;
  background: #ffffff;
  scroll-behavior: smooth;
  display: flex;
  flex-direction: column;
  gap: 0;
}

.welcome-message {
  text-align: center;
  padding: 80px 20px;
  color: #6e6e80;
  max-width: 500px;
  margin: 0 auto;
}

.welcome-icon {
  font-size: 32px;
  margin-bottom: 16px;
}

.welcome-message h3 {
  margin: 0 0 8px 0;
  font-size: 20px;
  font-weight: 600;
  color: #353740;
}

.welcome-message p {
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
  color: #6e6e80;
}

.message-appear {
  animation: fadeIn 0.2s ease forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.messages::-webkit-scrollbar {
  width: 8px;
}

.messages::-webkit-scrollbar-track {
  background: transparent;
}

.messages::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 4px;
}

.messages::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

@media (max-width: 768px) {
  .chat-window {
    max-height: 100vh;
    border: none;
  }

  .chat-header {
    padding: 12px 16px;
  }

  .messages {
    padding: 0;
  }

  .welcome-message {
    padding: 60px 16px;
  }
}
</style>
