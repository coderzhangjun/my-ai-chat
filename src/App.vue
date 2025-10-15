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

// 初始化角色 store
const roleStore = useRoleStore();

onMounted(() => {
  roleStore.init();
});
</script>

<style>
:root {
  /* 现代化颜色系统 */
  --primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --secondary-gradient: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  --success-gradient: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);

  --primary-color: #667eea;
  --primary-hover: #5a67d8;
  --secondary-color: #f093fb;

  --bg-primary: #fafbfc;
  --bg-secondary: #f7fafc;
  --bg-white: #ffffff;
  --bg-card: rgba(255, 255, 255, 0.9);

  --text-primary: #2d3748;
  --text-secondary: #4a5568;
  --text-muted: #718096;
  --text-light: #a0aec0;

  --border-light: rgba(226, 232, 240, 0.8);
  --border-medium: rgba(203, 213, 224, 0.6);

  /* 间距系统 */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
  --spacing-2xl: 3rem;

  /* 阴影系统 */
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.04);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.08);
  --shadow-lg: 0 8px 25px rgba(0, 0, 0, 0.12);
  --shadow-xl: 0 20px 60px rgba(0, 0, 0, 0.15);

  /* 圆角系统 */
  --radius-sm: 6px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 20px;
  --radius-2xl: 24px;

  /* 动画 */
  --transition-fast: 0.15s cubic-bezier(0.4, 0, 0.2, 1);
  --transition-normal: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  --transition-slow: 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 全局重置和基础样式 */
* {
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto",
    "Helvetica Neue", Arial, sans-serif;
  color: var(--text-primary);
  background: linear-gradient(
    135deg,
    rgba(102, 126, 234, 0.05) 0%,
    rgba(118, 75, 162, 0.05) 100%
  );
  margin: 0;
  padding: 0;
  min-height: 100vh;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#app {
  max-width: 1400px;
  margin: 0 auto;
  padding: var(--spacing-lg);
  min-height: 100vh;
  position: relative;
}

/* 背景装饰 */
body::before {
  content: "";
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(
      circle at 20% 80%,
      rgba(120, 119, 198, 0.1) 0%,
      transparent 50%
    ),
    radial-gradient(
      circle at 80% 20%,
      rgba(255, 119, 198, 0.1) 0%,
      transparent 50%
    ),
    radial-gradient(
      circle at 40% 40%,
      rgba(120, 200, 255, 0.05) 0%,
      transparent 50%
    );
  pointer-events: none;
  z-index: -1;
}

/* 应用头部样式 */
.app-header {
  text-align: center;
  margin-bottom: var(--spacing-2xl);
  position: relative;
  padding: var(--spacing-xl) 0;
}

.header-decoration {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 200px;
  height: 100px;
  pointer-events: none;
}

.decoration-circle {
  position: absolute;
  border-radius: 50%;
  opacity: 0.6;
  animation: float 6s ease-in-out infinite;
}

.circle-1 {
  width: 20px;
  height: 20px;
  background: var(--primary-gradient);
  top: 20px;
  left: 20px;
  animation-delay: 0s;
}

.circle-2 {
  width: 30px;
  height: 30px;
  background: var(--secondary-gradient);
  top: 10px;
  right: 30px;
  animation-delay: 2s;
}

.circle-3 {
  width: 15px;
  height: 15px;
  background: var(--success-gradient);
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  animation-delay: 4s;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(180deg);
  }
}

.app-title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-md);
  margin: 0 0 var(--spacing-sm) 0;
  font-size: clamp(2rem, 4vw, 2.5rem);
  font-weight: 700;
  background: var(--primary-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.02em;
}

.title-icon {
  font-size: 1.2em;
  filter: drop-shadow(0 4px 12px rgba(102, 126, 234, 0.3));
}

.app-subtitle {
  margin: 0;
  font-size: 1.1rem;
  color: var(--text-muted);
  font-weight: 400;
  opacity: 0.8;
}

/* 布局样式 */
.app-layout {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: var(--spacing-xl);
  min-height: calc(100vh - 200px);
}

.sidebar {
  background: var(--bg-card);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
  backdrop-filter: blur(20px);
  border: 1px solid var(--border-light);
  overflow: hidden;
  transition: var(--transition-normal);
}

.sidebar:hover {
  box-shadow: var(--shadow-xl);
  transform: translateY(-2px);
}

.main-content {
  position: relative;
}

/* 响应式布局 */
@media (max-width: 1200px) {
  .app-layout {
    grid-template-columns: 280px 1fr;
    gap: var(--spacing-lg);
  }
}

@media (max-width: 992px) {
  #app {
    padding: var(--spacing-md);
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
