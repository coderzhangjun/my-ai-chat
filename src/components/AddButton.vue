<template>
  <button class="add-btn" @click="handleAdd" title="添加">
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
  </button>
</template>

<script setup lang="ts">
// 定义添加事件
const emit = defineEmits(['add']);

// 处理添加按钮点击
const handleAdd = () => {
  emit('add');
};
</script>

<style scoped>
.add-btn {
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

.add-btn:hover {
  background-color: var(--bg-hover, rgba(0, 0, 0, 0.05));
  color: var(--primary-color, #1890ff);
}
</style>