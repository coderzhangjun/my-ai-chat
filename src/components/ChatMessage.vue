<template>
  <div class="message" :class="[message.role]">
    <div class="message-avatar">
      <div class="avatar" :class="message.role">
        {{ message.role === "user" ? "👤" : "🤖" }}
      </div>
    </div>
    <div class="message-content">
      <div class="message-header">
        <span class="message-role">{{
          message.role === "user" ? "你" : "AI"
        }}</span>
        <span class="message-time">{{ formatTime(message.timestamp) }}</span>
        <button class="copy-button" @click="copyMessage" title="复制消息">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path
              d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"
            ></path>
          </svg>
        </button>
      </div>
      <div class="message-text" v-if="!message.loading">
        {{ message.content }}
      </div>
      <div class="message-loading" v-else>
        <div class="loading-content">
          <div class="loading-dots">
            <span class="loading-dot"></span>
            <span class="loading-dot"></span>
            <span class="loading-dot"></span>
          </div>
          <span class="loading-text">AI 正在思考...</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Message } from "../types/message";

const props = defineProps<{
  message: Message;
}>();

// 格式化时间
const formatTime = (timestamp: string) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

// 复制消息内容
const copyMessage = async () => {
  try {
    await navigator.clipboard.writeText(props.message.content);
    // 可以添加一个复制成功的提示
    alert("已复制到剪贴板");
  } catch (err) {
    console.error("复制失败:", err);
    alert("复制失败，请手动选择并复制");
  }
};
</script>

<style scoped>
.message {
  display: flex;
  margin-bottom: var(--spacing-md);
  animation: fadeIn 0.3s ease;
}

.message-avatar {
  margin-right: var(--spacing-sm);
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.avatar.user {
  background-color: var(--user-color, #e6f7ff);
}

.avatar.assistant {
  background-color: var(--ai-color, #f6ffed);
}

.message-content {
  flex: 1;
  background: white;
  padding: var(--spacing-sm);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
}

.message.user .message-content {
  background-color: var(--user-bg, #e6f7ff);
}

.message.assistant .message-content {
  background-color: var(--ai-bg, #f6ffed);
}

.message-header {
  display: flex;
  align-items: center;
  margin-bottom: 4px;
}

.message-role {
  font-weight: 600;
  margin-right: var(--spacing-sm);
}

.message-time {
  font-size: 12px;
  color: cornflowerblue;
  margin-right: auto;
}

.copy-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  cursor: pointer;
  color: var(--text-light, #999);
  border-radius: var(--radius-sm);
  opacity: 0;
  transition: all 0.2s;
}

.message-content:hover .copy-button {
  opacity: 1;
}

.copy-button:hover {
  background-color: var(--bg-hover, rgba(0, 0, 0, 0.05));
  color: var(--primary-color, #1890ff);
}

.message-text {
  white-space: pre-wrap;
  line-height: 1.5;
}

.message-loading {
  display: flex;
  align-items: center;
  min-height: 40px;
  padding: 8px 0;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
}

.loading-dots {
  display: flex;
  align-items: center;
}

.loading-dot {
  width: 10px;
  height: 10px;
  margin-right: 6px;
  border-radius: 50%;
  background-color: var(--primary-color, #1890ff);
  animation: bounce 1.4s infinite ease-in-out both;
}

.loading-dot:nth-child(1) {
  animation-delay: -0.32s;
}

.loading-dot:nth-child(2) {
  animation-delay: -0.16s;
}

.loading-text {
  font-size: 14px;
  color: var(--text-light, #666);
}

@keyframes bounce {
  0%,
  80%,
  100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>

<style scoped>
/* 只修改颜色相关的样式 */
.avatar.user {
  background-color: #1890ff; /* 更鲜明的用户头像背景色 */
  color: white; /* 白色文字 */
}

.avatar.assistant {
  background-color: #52c41a; /* 更鲜明的AI头像背景色 */
  color: white; /* 白色文字 */
}

.message.user .message-content {
  background-color: #e6f7ff; /* 保持用户消息背景色 */
  border-left: 3px solid #1890ff; /* 添加左侧边框增强辨识度 */
}

.message.assistant .message-content {
  background-color: #f6ffed; /* 保持AI消息背景色 */
  border-left: 3px solid #52c41a; /* 添加左侧边框增强辨识度 */
}

.message-role {
  font-weight: 600;
  margin-right: var(--spacing-sm);
  color: #333; /* 更深的文字颜色 */
}

.message-text {
  white-space: pre-wrap;
  line-height: 1.5;
  color: #262626; /* 更深的文字颜色，提高对比度 */
}

/* 其他样式保持不变 */
</style>
