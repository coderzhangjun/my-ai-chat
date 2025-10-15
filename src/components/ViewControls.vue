<template>
  <div class="view-controls">
    <RoleSelector />
    <AddButton v-if="showAddButton" @add="handleAdd" />
    <FullScreenButton :targetElementId="targetElementId" />
    <NewWindowButton />
  </div>
</template>

<script setup lang="ts">
import AddButton from "./AddButton.vue";
import FullScreenButton from "./FullScreenButton.vue";
import NewWindowButton from "./NewWindowButton.vue";
import RoleSelector from "./RoleSelector.vue";

// 定义组件属性
defineProps({
  showAddButton: {
    type: Boolean,
    default: true,
  },
  targetElementId: {
    type: String,
    default: "",
  },
});

// 定义事件
const emit = defineEmits(["add"]);

// 处理添加事件
const handleAdd = () => {
  emit("add");
};
</script>

<style scoped>
.view-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
