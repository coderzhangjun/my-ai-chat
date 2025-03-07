<template>
  <!-- 根据消息类型动态设置样式：用户消息右对齐，AI 消息左对齐 -->
  <div :class="['chat-message', message.type]">
    <div class="message-content">
      {{ message.text }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from "vue";

/**
 * 定义消息接口，type 表示消息来源（用户或 AI）
 */
interface Message {
  type: "user" | "ai";
  text: string;
}

const props = defineProps<{
  message: Message;
}>();
</script>

<style scoped>
.chat-message {
  margin-bottom: 1rem;
  display: flex;
}

/* 用户消息右对齐 */
.chat-message.user {
  justify-content: flex-end;
}

/* AI 消息左对齐 */
.chat-message.ai {
  justify-content: flex-start;
}

.message-content {
  padding: 0.5rem 1rem;
  border-radius: 8px;
  max-width: 70%;
}

/* 用户消息样式 */
.chat-message.user .message-content {
  background-color: #0084ff;
  color: white;
}

/* AI 消息样式 */
.chat-message.ai .message-content {
  background-color: #e5e5ea;
  color: black;
}
</style>
