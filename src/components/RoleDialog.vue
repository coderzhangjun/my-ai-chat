<template>
  <Teleport to="body">
    <div class="dialog-overlay" @mousedown.self="emit('close')">
      <section
        class="dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="role-dialog-title"
      >
        <div class="dialog-header">
          <h3 id="role-dialog-title">
            {{ isEditMode ? "编辑角色" : "添加自定义角色" }}
          </h3>
          <button
            type="button"
            class="close-button"
            aria-label="关闭角色弹窗"
            @click="emit('close')"
          >
            ×
          </button>
        </div>

        <form class="dialog-form" @submit.prevent="handleSubmit">
          <div ref="contentRef" class="dialog-content">
            <div class="form-group">
              <label for="roleName">角色名称 *</label>
              <input
                id="roleName"
                ref="nameInputRef"
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
              <div class="field-hint">
                {{ formData.systemPrompt.length }}/2000
              </div>
            </div>
          </div>

          <div class="dialog-actions">
            <button type="button" class="cancel-button" @click="emit('close')">
              取消
            </button>
            <button type="submit" class="confirm-button" :disabled="!isFormValid">
              {{ isEditMode ? "保存" : "添加角色" }}
            </button>
          </div>
        </form>
      </section>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import type { Role } from "../types/role";

// Props 定义
const props = defineProps<{
  editRole?: Role;
}>();

// 事件定义
const emit = defineEmits<{
  close: [];
  confirm: [
    roleData: {
      id?: string;
      name: string;
      description: string;
      systemPrompt: string;
    }
  ];
}>();

// 表单数据
const formData = ref({
  name: "",
  description: "",
  systemPrompt: "",
});
const contentRef = ref<HTMLDivElement | null>(null);
const nameInputRef = ref<HTMLInputElement | null>(null);

const MODAL_OPEN_CLASS = "modal-open";

// 是否为编辑模式
const isEditMode = computed(() => !!props.editRole);

// 监听 editRole 变化，用于编辑模式下的数据初始化
watch(
  () => props.editRole,
  (role) => {
    if (role) {
      formData.value = {
        name: role.name,
        description: role.description,
        systemPrompt: role.systemPrompt,
      };
    }
  },
  { immediate: true }
);

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

  const roleData = {
    name: formData.value.name.trim(),
    description: formData.value.description.trim(),
    systemPrompt: formData.value.systemPrompt.trim(),
  };

  // 如果是编辑模式，附加角色 ID
  if (props.editRole) {
    emit("confirm", {
      id: props.editRole.id,
      ...roleData,
    });
  } else {
    emit("confirm", roleData);
  }
};

// 键盘事件处理
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === "Escape") {
    emit("close");
  }
};

onMounted(() => {
  document.body.classList.add(MODAL_OPEN_CLASS);
  document.addEventListener("keydown", handleKeydown);

  nextTick(() => {
    if (contentRef.value) {
      contentRef.value.scrollTop = 0;
    }

    nameInputRef.value?.focus({ preventScroll: true });
  });
});

onUnmounted(() => {
  document.body.classList.remove(MODAL_OPEN_CLASS);
  document.removeEventListener("keydown", handleKeydown);
});
</script>

<style scoped>
.dialog-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 24px;
  overflow-y: auto;
}

.dialog {
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 18px;
  width: 100%;
  max-width: 500px;
  margin: auto 0;
  max-height: min(720px, calc(100vh - 48px));
  overflow: hidden;
  box-shadow: var(--shadow-md);
  border: 1px solid var(--border-light);
}

.dialog-form {
  display: flex;
  flex: 1;
  min-height: 0;
  flex-direction: column;
}

.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px 10px;
}

.dialog-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 650;
  color: var(--text-primary);
}

.close-button {
  background: none;
  border: none;
  font-size: 24px;
  color: var(--text-muted);
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  transition: background var(--transition-fast), color var(--transition-fast);
}

.close-button:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.dialog-content {
  padding: 10px 20px 20px;
  min-height: 0;
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
  color: var(--text-secondary);
  font-size: 14px;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  font-size: 14px;
  font-family: inherit;
  color: var(--text-primary);
  transition: border-color var(--transition-fast);
  box-sizing: border-box;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: rgba(16, 163, 127, 0.7);
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
  color: var(--text-muted);
  text-align: right;
}

.dialog-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding: 16px 20px 20px;
  border-top: 1px solid var(--border-light);
  background: #ffffff;
  flex-shrink: 0;
}

.cancel-button,
.confirm-button {
  padding: 10px 20px;
  border-radius: var(--radius-md);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background var(--transition-fast), border-color var(--transition-fast);
  border: 1px solid;
}

.cancel-button {
  background: white;
  color: var(--text-primary);
  border-color: var(--border-light);
}

.cancel-button:hover {
  background: var(--bg-hover);
  border-color: var(--border-medium);
}

.confirm-button {
  background: #111111;
  color: white;
  border-color: #111111;
}

.confirm-button:hover:not(:disabled) {
  background: #2f2f2f;
  border-color: #2f2f2f;
}

.confirm-button:disabled {
  background: #ccc;
  border-color: #ccc;
  cursor: not-allowed;
  opacity: 0.6;
}

:global(body.modal-open) {
  overflow: hidden;
}

@media (max-width: 640px) {
  .dialog-overlay {
    padding: 12px;
  }

  .dialog {
    max-height: calc(100vh - 24px);
  }
}
</style>
