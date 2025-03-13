<template>
  <button class="new-window-btn" @click="openInNewWindow" title="在新窗口打开">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
      <line x1="9" y1="3" x2="9" y2="21"></line>
    </svg>
  </button>
</template>

<script setup lang="ts">
// 移除 useRoute 的导入，因为您的项目可能没有配置 vue-router
// import { useRoute } from "vue-router";

// 在新窗口中打开当前页面
const openInNewWindow = () => {
  // 直接使用当前 URL，而不依赖 vue-router
  const currentUrl = window.location.href;
  
  // 打开新窗口并设置窗口名称和特性
  window.open(
    currentUrl,
    `window_${Date.now()}`,
    "width=1200,height=800,left=200,top=100,menubar=no,toolbar=no,location=no,status=no"
  );
};
</script>

<style scoped>
.new-window-btn {
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

.new-window-btn:hover {
  background-color: var(--bg-hover, rgba(0, 0, 0, 0.05));
  color: var(--primary-color, #1890ff);
}
</style>
