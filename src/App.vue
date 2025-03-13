<template>
  <!-- 应用的根容器 -->
  <div id="app">
    <!-- 引入聊天窗口组件 -->
    <ChatWindow />
  </div>
</template>

<script setup lang="ts">
import ChatWindow from "./components/ChatWindow.vue";
</script>

<style>
:root {
  /* 颜色系统 */
  --primary-color: #0084ff;
  --primary-hover: #0073e6;
  --bg-light: #f9f9f9;
  --bg-white: #ffffff;
  --text-dark: #333333;
  --text-light: #ffffff;
  --border-color: #e0e0e0;
  --ai-message-bg: #e5e5ea;
  --user-message-bg: var(--primary-color);

  /* 间距系统 */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;

  /* 阴影 */
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.12);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);

  /* 圆角 */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 16px;
}

/* 全局样式：设置应用最大宽度，居中显示 */
body {
  font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    sans-serif;
  color: var(--text-dark);
  background-color: #f5f5f7;
  margin: 0;
  padding: 0;
}

#app {
  max-width: 800px;
  margin: 0 auto;
  padding: var(--spacing-md);
}

.app-title {
  color: var(--primary-color);
  text-align: center;
  margin-bottom: var(--spacing-lg);
  font-weight: 600;
}

/* 添加一些基础动画 */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
