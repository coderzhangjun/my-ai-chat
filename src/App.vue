<template>
  <!-- 应用的根容器 -->
  <div id="app">
    <!-- 引入聊天窗口组件 -->
    <h1>mxCoder</h1>
    <ChatWindow />
  </div>
</template>

<script setup lang="ts">
import ChatWindow from "./components/ChatWindow.vue";
</script>

<style>
/* 全局样式：设置应用最大宽度，居中显示 */
#app {
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem;
}
</style>
