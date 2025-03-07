<template>
  <div class="chat-window">
    <!-- 消息列表区域 -->
    <div class="messages" ref="messagesContainer">
      <!-- 遍历 Pinia store 中的消息数组，使用 ChatMessage 展示每条消息 -->
      <ChatMessage
        v-for="(msg, index) in messages"
        :key="index"
        :message="msg"
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

// 获取 Pinia 中的 chat store
const chatStore = useChatStore();
const messages = chatStore.messages;

/**
 * 当发送新消息时：
 * 1. 将用户消息添加到 store 中
 * 2. 调用 sendMessageToAI 方法处理流式响应
 */
const handleSendMessage = async (text: string) => {
  chatStore.addMessage({ type: "user", text });
  await chatStore.sendMessageToAI(text);
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
  border: 1px solid #ccc;
  border-radius: 8px;
  overflow: hidden;
}

/* 消息区域样式 */
.messages {
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
  background: #f9f9f9;
}

/* 响应式：移动端样式调整 */
@media (max-width: 600px) {
  .chat-window {
    max-height: 100vh;
  }
}
</style>
