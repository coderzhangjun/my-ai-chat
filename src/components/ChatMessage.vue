<template>
  <div class="message" :class="[message.role]">
    <div class="message-avatar" aria-hidden="true">
      <div class="avatar" :class="message.role">
        <span v-if="message.role === 'user'">👤</span>
        <span v-else>🤖</span>
      </div>
    </div>
    <div class="message-content">
      <div class="message-header">
        <span class="message-role">{{
          message.role === "user" ? "你" : "助手"
        }}</span>
        <span class="message-time">{{ formatTime(message.timestamp) }}</span>
        <button
          class="copy-button"
          @click="copyMessage"
          title="复制消息"
          v-show="!message.loading"
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
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path
              d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"
            ></path>
          </svg>
        </button>
      </div>
      <!-- 流式输出：有内容就显示，即使还在 loading 中 -->
      <div
        class="message-text"
        v-if="message.content || !message.loading"
        v-html="renderedHtml"
        :class="{ streaming: message.loading && message.content }"
      ></div>

      <!-- 只在开始加载且还没有任何内容时显示 loading 动画 -->
      <div class="message-loading" v-if="message.loading && !message.content">
        <div class="loading-content">
          <div class="typing-indicator">
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
          </div>
          <span class="loading-text">正在思考...</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Message } from "../types/message";
import { computed } from "vue";
import { renderMarkdownToHtml } from "../utils/markdown";
import "highlight.js/styles/atom-one-dark.css"; // 代码高亮主题

const props = defineProps<{
  message: Message;
}>();

// Markdown 渲染后的安全 HTML（已做转义与规则控制）
const renderedHtml = computed(() =>
  renderMarkdownToHtml(props.message.content)
);

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
    console.log("已复制到剪贴板");
  } catch (err) {
    console.error("复制失败:", err);
  }
};
</script>

<style scoped>
.message {
  display: flex;
  margin-bottom: 20px;
  animation: messageSlideIn 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  max-width: 100%;
}

.message.user {
  flex-direction: row-reverse;
  margin-left: auto;
  margin-right: 0;
}

.message-avatar {
  flex-shrink: 0;
  margin: 0 12px;
  display: flex;
  align-items: flex-start;
  padding-top: 4px;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 500;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.avatar.user {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.avatar.assistant {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
}

.avatar:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.message-content {
  flex: 1;
  min-width: 0;
  max-width: calc(100% - 64px);
  background: var(--bg-card);
  backdrop-filter: blur(10px);
  border-radius: 18px;
  padding: 20px 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  position: relative;
  overflow: hidden;
}

.message.user .message-content {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
}

.message.assistant .message-content {
  background: var(--bg-white);
  border: 1px solid var(--border-light);
}

.message-content:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
}

.message.user .message-content:hover {
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
}

.message-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  gap: 12px;
}

.message-role {
  font-weight: 600;
  font-size: 14px;
  opacity: 0.9;
}

.message.assistant .message-role {
  color: var(--primary-color);
}

.message-time {
  font-size: 12px;
  opacity: 0.7;
  font-weight: 400;
  white-space: nowrap;
}

.copy-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  opacity: 0.6;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.copy-button:hover {
  opacity: 1;
  background: rgba(255, 255, 255, 0.1);
}

.message.assistant .copy-button:hover {
  background: rgba(102, 126, 234, 0.1);
}

.message-text {
  line-height: 1.8;
  font-size: 15px;
  color: inherit;
  word-wrap: break-word;
  overflow-wrap: break-word;
  max-width: 100%;
  position: relative;
}

/* 流式输出时的光标效果 */
.message-text.streaming::after {
  content: "▋";
  display: inline-block;
  margin-left: 2px;
  animation: cursorBlink 1s infinite;
  color: var(--primary-color);
  font-weight: bold;
}

.message.user .message-text.streaming::after {
  color: rgba(255, 255, 255, 0.8);
}

@keyframes cursorBlink {
  0%,
  50% {
    opacity: 1;
  }
  51%,
  100% {
    opacity: 0;
  }
}

/* 标题样式 */
.message-text :deep(h1),
.message-text :deep(h2),
.message-text :deep(h3),
.message-text :deep(h4) {
  margin: 24px 0 16px 0;
  font-weight: 600;
  line-height: 1.4;
}

.message-text :deep(h1:first-child),
.message-text :deep(h2:first-child),
.message-text :deep(h3:first-child),
.message-text :deep(h4:first-child) {
  margin-top: 0;
}

.message-text :deep(h1) {
  font-size: 1.5em;
  border-bottom: 2px solid rgba(0, 0, 0, 0.1);
  padding-bottom: 8px;
}

.message.user .message-text :deep(h1) {
  border-bottom-color: rgba(255, 255, 255, 0.3);
}

.message-text :deep(h2) {
  font-size: 1.3em;
}

.message-text :deep(h3) {
  font-size: 1.15em;
}

.message-text :deep(h4) {
  font-size: 1.05em;
}

/* 段落样式 */
.message-text :deep(p) {
  margin: 0 0 16px 0;
  line-height: 1.8;
}

.message-text :deep(p:last-child) {
  margin-bottom: 0;
}

/* 代码块样式 - ChatGPT 风格 */
.message-text :deep(pre) {
  background: #282c34;
  border-radius: 8px;
  padding: 16px;
  overflow-x: auto;
  font-family: "Fira Code", "Consolas", "Monaco", monospace;
  margin: 16px 0;
  border: 1px solid rgba(0, 0, 0, 0.1);
  position: relative;
}

.message.user .message-text :deep(pre) {
  background: rgba(0, 0, 0, 0.3);
  border-color: rgba(255, 255, 255, 0.15);
}

.message-text :deep(pre code) {
  background: transparent;
  padding: 0;
  border-radius: 0;
  font-size: 0.9em;
  border: none;
  color: #abb2bf;
  display: block;
}

.message-text :deep(.hljs) {
  background: transparent;
  padding: 0;
}

/* 行内代码样式 */
.message-text :deep(code) {
  background: rgba(0, 0, 0, 0.08);
  padding: 3px 8px;
  border-radius: 4px;
  font-family: "Fira Code", "Consolas", monospace;
  font-size: 0.9em;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.message.user .message-text :deep(code) {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.1);
}

/* 引用块样式 */
.message-text :deep(blockquote) {
  border-left: 4px solid var(--primary-color);
  margin: 16px 0;
  padding: 12px 16px;
  background: rgba(0, 0, 0, 0.03);
  border-radius: 4px;
  opacity: 0.9;
}

.message.user .message-text :deep(blockquote) {
  border-left-color: rgba(255, 255, 255, 0.5);
  background: rgba(255, 255, 255, 0.1);
}

/* 列表样式 */
.message-text :deep(ul),
.message-text :deep(ol) {
  margin: 16px 0;
  padding-left: 24px;
}

.message-text :deep(li) {
  margin: 8px 0;
  line-height: 1.7;
}

.message-text :deep(li > p) {
  margin: 4px 0;
}

/* 嵌套列表 */
.message-text :deep(ul ul),
.message-text :deep(ul ol),
.message-text :deep(ol ul),
.message-text :deep(ol ol) {
  margin: 8px 0;
}

/* 链接样式 */
.message-text :deep(a) {
  color: #667eea;
  text-decoration: underline;
  transition: opacity 0.2s ease;
}

.message-text :deep(a:hover) {
  opacity: 0.8;
}

.message.user .message-text :deep(a) {
  color: rgba(255, 255, 255, 0.95);
  text-decoration: underline;
}

/* 强调样式 */
.message-text :deep(strong) {
  font-weight: 600;
}

.message-text :deep(em) {
  font-style: italic;
}

/* 表格样式 */
.message-text :deep(table) {
  border-collapse: collapse;
  width: 100%;
  margin: 16px 0;
  font-size: 0.95em;
}

.message-text :deep(table th),
.message-text :deep(table td) {
  border: 1px solid rgba(0, 0, 0, 0.1);
  padding: 8px 12px;
  text-align: left;
}

.message.user .message-text :deep(table th),
.message.user .message-text :deep(table td) {
  border-color: rgba(255, 255, 255, 0.2);
}

.message-text :deep(table th) {
  background: rgba(0, 0, 0, 0.03);
  font-weight: 600;
}

.message.user .message-text :deep(table th) {
  background: rgba(255, 255, 255, 0.1);
}

.message-text :deep(table tr:nth-child(even)) {
  background: rgba(0, 0, 0, 0.02);
}

.message.user .message-text :deep(table tr:nth-child(even)) {
  background: rgba(255, 255, 255, 0.05);
}

/* 水平线样式 */
.message-text :deep(hr) {
  border: none;
  border-top: 2px solid rgba(0, 0, 0, 0.1);
  margin: 20px 0;
}

.message.user .message-text :deep(hr) {
  border-top-color: rgba(255, 255, 255, 0.2);
}

/* 删除线样式 */
.message-text :deep(del) {
  text-decoration: line-through;
  opacity: 0.7;
}

.message-loading {
  display: flex;
  align-items: center;
  gap: 12px;
}

.loading-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.typing-indicator {
  display: flex;
  gap: 4px;
  align-items: center;
}

.typing-dot {
  width: 8px;
  height: 8px;
  background: var(--primary-color);
  border-radius: 50%;
  animation: typingPulse 1.4s infinite ease-in-out;
}

.typing-dot:nth-child(1) {
  animation-delay: -0.32s;
}

.typing-dot:nth-child(2) {
  animation-delay: -0.16s;
}

.loading-text {
  font-size: 14px;
  opacity: 0.7;
  font-style: italic;
}

@keyframes typingPulse {
  0%,
  80%,
  100% {
    opacity: 0.3;
    transform: scale(1);
  }
  40% {
    opacity: 1;
    transform: scale(1.2);
  }
}

@keyframes messageSlideIn {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .message-content {
    max-width: calc(100% - 56px);
  }

  .avatar {
    width: 36px;
    height: 36px;
    font-size: 16px;
  }

  .message.user .message-content,
  .message.assistant .message-content {
    padding: 12px 16px;
    border-radius: 16px 16px 16px 4px;
  }

  .message.user .message-content {
    border-radius: 16px 4px 16px 16px;
  }

  .message-text {
    font-size: 14px;
  }
}
</style>
