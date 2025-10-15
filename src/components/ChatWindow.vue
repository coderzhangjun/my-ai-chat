<template>
  <div class="chat-window" id="chatWindow">
    <!-- 标题栏和控制按钮 -->
    <div class="chat-header">
      <div class="header-left">
        <div class="status-indicator"></div>
        <h2 class="chat-title">聊天对话</h2>
      </div>
      <div class="header-controls">
        <!-- 添加清除按钮 -->
        <button
          class="clear-button"
          @click="handleClearChat"
          title="清除聊天记录"
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
  max-height: 700px;
  border-radius: 20px;
  overflow: hidden;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
}

/* 标题栏样式 */
.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  position: relative;
  z-index: 10;
  overflow: visible;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.status-indicator {
  width: 8px;
  height: 8px;
  background: linear-gradient(45deg, #00d4aa, #00c4a7);
  border-radius: 50%;
  box-shadow: 0 0 10px rgba(0, 212, 170, 0.3);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.1);
  }
}

.chat-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
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
  width: 40px;
  height: 40px;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  cursor: pointer;
  color: #666;
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.clear-button:hover {
  background: rgba(245, 34, 45, 0.1);
  color: #f5222d;
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(245, 34, 45, 0.15);
}

/* 消息区域样式 */
.messages {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.95) 0%,
    rgba(248, 250, 252, 0.95) 100%
  );
  scroll-behavior: smooth;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 欢迎消息样式 */
.welcome-message {
  text-align: center;
  padding: 60px 20px;
  color: #666;
  max-width: 400px;
  margin: 0 auto;
}

.welcome-icon {
  font-size: 48px;
  margin-bottom: 20px;
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.1));
}

.welcome-message h3 {
  margin: 0 0 12px 0;
  font-size: 24px;
  font-weight: 600;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.welcome-message p {
  margin: 0;
  font-size: 16px;
  line-height: 1.6;
  opacity: 0.8;
}

/* 消息出现动画 */
.message-appear {
  animation: fadeInUp 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* 滚动条样式 */
.messages::-webkit-scrollbar {
  width: 6px;
}

.messages::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 3px;
}

.messages::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #667eea, #764ba2);
  border-radius: 3px;
}

.messages::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #5a67d8, #6b46c1);
}

/* 响应式：移动端样式调整 */
@media (max-width: 768px) {
  .chat-window {
    max-height: calc(100vh - 40px);
    border-radius: 16px;
  }

  .chat-header {
    padding: 16px 20px;
  }

  .messages {
    padding: 20px 16px;
  }

  .welcome-message {
    padding: 40px 16px;
  }
}
</style>
