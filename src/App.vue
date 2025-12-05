<template>
  <!-- 应用的根容器 -->
  <div id="app">
    <div class="app-header">
      <div class="header-decoration">
        <div class="decoration-circle circle-1"></div>
        <div class="decoration-circle circle-2"></div>
        <div class="decoration-circle circle-3"></div>
      </div>
      <h1 class="app-title">
        <span class="title-icon">💬</span>
        智能助手
      </h1>
      <p class="app-subtitle">你的专属AI对话伙伴</p>
    </div>

    <div class="app-layout">
      <!-- 左侧历史对话面板 -->
      <aside class="sidebar">
        <ConversationHistory />
      </aside>

      <!-- 右侧聊天窗口 -->
      <main class="main-content">
        <ChatWindow />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import ChatWindow from "./components/ChatWindow.vue";
import ConversationHistory from "./components/ConversationHistory.vue";
import { useRoleStore } from "./store/roles";
import { useModelStore } from "./store/models";

// 初始化角色 store
const roleStore = useRoleStore();
const modelStore = useModelStore();

onMounted(() => {
  roleStore.init();
  modelStore.init();
});
</script>

<style>
:root {
  /* ChatGPT 风格配色 */
  --primary-color: #10a37f;
  --primary-hover: #0e8f70;
  --accent-color: #19c28f;

  --bg-page: #f7f7f8;
  --bg-surface: #ffffff;
  --bg-muted: #f0f0f1;
  --bg-card: #ffffff;
  --bg-white: #ffffff;
  --bg-light: #f5f5f7;

  --text-primary: #0f172a;
  --text-secondary: #4b5563;
  --text-muted: #6b7280;

  --border-light: #e5e7eb;
  --border-medium: #d1d5db;

  /* 间距系统 */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
  --spacing-2xl: 3rem;

  /* 阴影与圆角 */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.04);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.08);
  --shadow-lg: 0 10px 30px rgba(15, 23, 42, 0.08);
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 14px;
  --radius-xl: 18px;

  /* 动画 */
  --transition-fast: 0.16s cubic-bezier(0.4, 0, 0.2, 1);
  --transition-normal: 0.28s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 全局重置和基础样式 */
* {
  box-sizing: border-box;
}

body {
  font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI",
    "Roboto", "Helvetica Neue", Arial, sans-serif;
  color: var(--text-primary);
  background: var(--bg-page);
  margin: 0;
  padding: 0;
  min-height: 100vh;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#app {
  max-width: 1200px;
  margin: 0 auto;
  padding: 16px 24px 24px;
  min-height: 100vh;
  position: relative;
}

/* 背景装饰取消，保持 ChatGPT 扁平风格 */
body::before {
  content: none;
}

/* 应用头部样式 */
.app-header {
  text-align: center;
  margin-bottom: var(--spacing-lg);
  position: relative;
  padding: 18px 20px;
  background: #ffffff;
  border: 1px solid #ececf1;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.04);
}

.header-decoration,
.decoration-circle {
  display: none;
}

.app-title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-md);
  margin: 0 0 4px 0;
  font-size: clamp(1.5rem, 2.5vw, 1.9rem);
  font-weight: 700;
  color: #111827;
  letter-spacing: -0.01em;
}

.title-icon {
  font-size: 1.2em;
}

.app-subtitle {
  margin: 0;
  font-size: 1rem;
  color: var(--text-muted);
  font-weight: 400;
}

/* 布局样式 */
.app-layout {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: var(--spacing-lg);
  min-height: calc(100vh - 260px);
}

.sidebar {
  background: var(--bg-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-light);
  overflow: hidden;
}

.main-content {
  position: relative;
}

/* 响应式布局 */
@media (max-width: 992px) {
  #app {
    padding: 12px 14px 18px;
  }

  .app-layout {
    grid-template-columns: 1fr;
    gap: var(--spacing-lg);
  }

  .sidebar {
    order: 2;
    max-height: 300px;
  }

  .main-content {
    order: 1;
  }
}

@media (max-width: 768px) {
  #app {
    padding: var(--spacing-sm);
  }

  .app-header {
    margin-bottom: var(--spacing-lg);
    padding: var(--spacing-lg) 0;
  }

  .app-title {
    font-size: 1.8rem;
  }

  .app-subtitle {
    font-size: 1rem;
  }

  .app-layout {
    gap: var(--spacing-md);
    min-height: calc(100vh - 150px);
  }
}

/* 滚动条全局样式 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: var(--primary-gradient);
  border-radius: 4px;
  transition: var(--transition-fast);
}

::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%);
}

/* 全局动画类 */
.fade-enter-active,
.fade-leave-active {
  transition: var(--transition-normal);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

.slide-enter-active,
.slide-leave-active {
  transition: var(--transition-normal);
}

.slide-enter-from {
  transform: translateX(-100%);
}

.slide-leave-to {
  transform: translateX(100%);
}

/* 加载动画 */
@keyframes shimmer {
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
}

.skeleton {
  animation: shimmer 1.5s ease-in-out infinite;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.4) 50%,
    rgba(255, 255, 255, 0) 100%
  );
  background-size: 200px 100%;
}

/* 选中文本样式 */
::selection {
  background: rgba(102, 126, 234, 0.2);
  color: var(--text-primary);
}

::-moz-selection {
  background: rgba(102, 126, 234, 0.2);
  color: var(--text-primary);
}

/* 焦点样式 */
button:focus-visible,
input:focus-visible,
textarea:focus-visible {
  outline: 2px solid var(--primary-color);
  outline-offset: 2px;
}
</style>
