<template>
  <div class="dialog-overlay" @click.self="$emit('close')">
    <div class="dialog">
      <div class="dialog-header">
        <h3>添加自定义角色</h3>
        <button class="close-button" @click="$emit('close')">×</button>
      </div>

      <form class="dialog-content" @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="roleName">角色名称 *</label>
          <input
            id="roleName"
            v-model="formData.name"
            type="text"
            placeholder="请输入角色名称"
            maxlength="50"
            required
          />
          <div class="field-hint">{{ formData.name.length }}/50</div>
        </div>

        <div class="form-group">
          <label for="roleDescription">角色描述</label>
          <input
            id="roleDescription"
            v-model="formData.description"
            type="text"
            placeholder="请输入角色描述（可选）"
            maxlength="100"
          />
          <div class="field-hint">{{ formData.description.length }}/100</div>
        </div>

        <div class="form-group">
          <label for="systemPrompt">系统提示词 *</label>
          <textarea
            id="systemPrompt"
            v-model="formData.systemPrompt"
            placeholder="请输入系统提示词，这将决定AI的行为和回答风格..."
            rows="8"
            maxlength="2000"
            required
          ></textarea>
          <div class="field-hint">{{ formData.systemPrompt.length }}/2000</div>
        </div>

        <div class="dialog-actions">
          <button type="button" class="cancel-button" @click="$emit('close')">
            取消
          </button>
          <button type="submit" class="confirm-button" :disabled="!isFormValid">
            添加角色
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";

// 事件定义
const emit = defineEmits<{
  close: [];
  confirm: [
    roleData: { name: string; description: string; systemPrompt: string }
  ];
}>();

// 表单数据
const formData = ref({
  name: "",
  description: "",
  systemPrompt: "",
});

// 表单验证
const isFormValid = computed(() => {
  return (
    formData.value.name.trim().length > 0 &&
    formData.value.systemPrompt.trim().length > 0
  );
});

// 提交处理
const handleSubmit = () => {
  if (!isFormValid.value) return;

  emit("confirm", {
    name: formData.value.name.trim(),
    description: formData.value.description.trim(),
    systemPrompt: formData.value.systemPrompt.trim(),
  });
};

// 键盘事件处理
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === "Escape") {
    emit("close");
  }
};

onMounted(() => {
  document.addEventListener("keydown", handleKeydown);
  // 自动聚焦到第一个输入框
  const nameInput = document.getElementById("roleName");
  if (nameInput) {
    nameInput.focus();
  }
});

// 组件卸载时清理事件监听
import { onUnmounted } from "vue";
onUnmounted(() => {
  document.removeEventListener("keydown", handleKeydown);
});
</script>

<style scoped>
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
}

.dialog {
  background: white;
  border-radius: 8px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #eee;
}

.dialog-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.close-button {
  background: none;
  border: none;
  font-size: 24px;
  color: #999;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.close-button:hover {
  background: #f5f5f5;
  color: #666;
}

.dialog-content {
  padding: 24px;
  max-height: calc(90vh - 120px);
  overflow-y: auto;
}

.form-group {
  margin-bottom: 20px;
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
  font-size: 14px;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  transition: border-color 0.2s ease;
  box-sizing: border-box;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #1976d2;
  box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.1);
}

.form-group textarea {
  resize: vertical;
  min-height: 120px;
  font-family: "Courier New", monospace;
  line-height: 1.5;
}

.field-hint {
  margin-top: 4px;
  font-size: 12px;
  color: #999;
  text-align: right;
}

.dialog-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.cancel-button,
.confirm-button {
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid;
}

.cancel-button {
  background: white;
  color: #666;
  border-color: #ddd;
}

.cancel-button:hover {
  background: #f5f5f5;
  border-color: #bbb;
}

.confirm-button {
  background: #1976d2;
  color: white;
  border-color: #1976d2;
}

.confirm-button:hover:not(:disabled) {
  background: #1565c0;
  border-color: #1565c0;
}

.confirm-button:disabled {
  background: #ccc;
  border-color: #ccc;
  cursor: not-allowed;
  opacity: 0.6;
}
</style>
