<template>
  <div class="model-selector">
    <select
      v-model="selectedId"
      class="selector-control"
      :title="currentModelTitle"
      aria-label="选择模型通道"
    >
      <option
        v-for="item in models"
        :key="item.id"
        :value="item.id"
        :title="item.description || item.name"
      >
        {{ item.name }}
      </option>
    </select>

    <button class="tool-button" @click="openDialog" title="新增模型">
      <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
        <path d="M8 3v10M3 8h10" stroke="currentColor" stroke-width="2" />
      </svg>
    </button>
    <button
      class="tool-button"
      :disabled="!currentModel"
      @click="editCurrent"
      title="编辑当前模型"
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path
          d="M11.333 2A2.122 2.122 0 0 1 14 4.667L5 13.667l-3.667.333.334-3.667L11.333 2z"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </button>

    <Teleport to="body">
      <div v-show="showDialog" class="dialog-backdrop" @click.self="closeDialog">
        <div class="dialog" @click.stop>
          <div class="dialog-header">
            <h3 class="dialog-title">{{ editingId ? "编辑模型" : "新增自定义模型" }}</h3>
            <button class="close-button" @click="closeDialog" title="关闭">×</button>
          </div>

          <div class="dialog-body">
            <div v-if="!editingId" class="preset-row">
              <span class="preset-label">快速填充</span>
              <button class="preset-btn" @click="fillOhmygpt">
                OhMyGPT · gpt-4o
              </button>
            </div>
            <label class="field">
              <span>名称</span>
              <input v-model.trim="form.name" placeholder="例如：Qwen-Max" />
            </label>
            <label class="field">
              <span>Base URL</span>
              <input
                v-model.trim="form.baseUrl"
                placeholder="例如：https://api.openai.com"
              />
            </label>
            <label class="field">
              <span>模型 ID</span>
              <input v-model.trim="form.model" placeholder="例如：gpt-4o" />
            </label>
            <label class="field">
              <span>Endpoint（可选）</span>
              <input
                v-model.trim="form.endpoint"
                placeholder="/v1/chat/completions"
              />
            </label>
            <label class="field">
              <span>API Key</span>
              <input
                v-model.trim="form.apiKey"
                placeholder="sk-..."
                type="password"
              />
            </label>
            <label class="field">
              <span>备注</span>
              <input v-model.trim="form.description" placeholder="可选" />
            </label>
          </div>

          <div class="dialog-actions">
            <button class="ghost" @click="closeDialog">取消</button>
            <button class="primary" @click="saveModel">保存</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, onUnmounted, reactive, ref } from "vue";
import { storeToRefs } from "pinia";
import { useModelStore } from "../store/models";

const modelStore = useModelStore();
const { models, currentModelId, currentModel } = storeToRefs(modelStore);

const selectedId = computed<string>({
  get: () => currentModelId.value,
  set: (val: string) => modelStore.setCurrentModel(val),
});

const showDialog = ref(false);
const editingId = ref<string | null>(null);
const form = reactive({
  name: "",
  baseUrl: "",
  model: "",
  apiKey: "",
  endpoint: "/v1/chat/completions",
  description: "",
});

const MODAL_OPEN_CLASS = "modal-open";

const currentModelTitle = computed(() => {
  const model = currentModel.value;
  if (!model) {
    return "选择模型通道";
  }

  return `${model.name} · ${model.model} · ${model.baseUrl} · ${maskKey(
    model.apiKey,
  )}`;
});

onUnmounted(() => {
  document.body.classList.remove(MODAL_OPEN_CLASS);
});

const resetForm = () => {
  form.name = "";
  form.baseUrl = "";
  form.model = "";
  form.apiKey = "";
  form.endpoint = "/v1/chat/completions";
  form.description = "";
};

const openDialog = () => {
  editingId.value = null;
  resetForm();
  showDialog.value = true;
  document.body.classList.add(MODAL_OPEN_CLASS);
};

const closeDialog = () => {
  showDialog.value = false;
  document.body.classList.remove(MODAL_OPEN_CLASS);
};

const fillOhmygpt = () => {
  form.name = "OhMyGPT gpt-4o";
  form.baseUrl = "https://api.ohmygpt.com/v1";
  form.model = "gpt-4o";
  form.endpoint = "/chat/completions";
};

const editCurrent = () => {
  if (!currentModel.value) return;

  const model = currentModel.value;
  editingId.value = model.id;
  form.name = model.name;
  form.baseUrl = model.baseUrl;
  form.model = model.model;
  form.apiKey = model.apiKey || "";
  form.endpoint = model.endpoint || "/v1/chat/completions";
  form.description = model.description || "";
  showDialog.value = true;
  document.body.classList.add(MODAL_OPEN_CLASS);
};

const maskKey = (key?: string) => {
  if (!key) return "未填写";
  if (key.length <= 8) return `${key.slice(0, 2)}****${key.slice(-2)}`;
  return `${key.slice(0, 4)}****${key.slice(-4)}`;
};

const saveModel = () => {
  if (!form.name || !form.baseUrl || !form.model || !form.apiKey) {
    alert("请填写名称、Base URL、模型 ID 和 API Key");
    return;
  }

  if (editingId.value) {
    const ok = modelStore.updateCustomModel(editingId.value, { ...form });
    if (ok) {
      modelStore.setCurrentModel(editingId.value);
    }
  } else {
    const created = modelStore.addCustomModel({ ...form });
    modelStore.setCurrentModel(created.id);
  }

  closeDialog();
};
</script>

<style scoped>
.model-selector {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

.selector-control {
  height: 34px;
  max-width: 190px;
  min-width: 140px;
  padding: 0 32px 0 12px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-light);
  background: var(--bg-muted);
  color: var(--text-primary);
  font-size: 13px;
  cursor: pointer;
  transition: background var(--transition-fast), border-color var(--transition-fast);
}

.selector-control:hover {
  background: var(--bg-hover);
  border-color: var(--border-medium);
}

.tool-button {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  transition: background var(--transition-fast), color var(--transition-fast);
}

.tool-button:hover:not(:disabled) {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.tool-button:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

.dialog-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(0, 0, 0, 0.35);
}

.dialog {
  width: min(460px, 100%);
  max-height: min(720px, calc(100vh - 48px));
  overflow: hidden;
  background: #ffffff;
  border-radius: 18px;
  box-shadow: var(--shadow-md);
  border: 1px solid var(--border-light);
}

.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px 10px;
}

.dialog-title {
  margin: 0;
  font-size: 16px;
  font-weight: 650;
  color: var(--text-primary);
}

.close-button {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  font-size: 22px;
  line-height: 1;
}

.close-button:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.dialog-body {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: calc(100vh - 190px);
  overflow-y: auto;
  padding: 8px 20px 4px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 13px;
  color: var(--text-secondary);
}

.field input {
  height: 38px;
  padding: 0 12px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-light);
  background: #ffffff;
  color: var(--text-primary);
}

.field input:focus {
  border-color: rgba(16, 163, 127, 0.7);
  outline: none;
}

.preset-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.preset-label {
  font-size: 12px;
  color: var(--text-muted);
}

.preset-btn {
  height: 30px;
  padding: 0 10px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-light);
  background: var(--bg-muted);
  color: var(--text-primary);
  cursor: pointer;
}

.preset-btn:hover {
  background: var(--bg-hover);
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 20px 20px;
}

.dialog-actions button {
  height: 36px;
  padding: 0 14px;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: background var(--transition-fast);
}

.dialog-actions .ghost {
  background: #ffffff;
  color: var(--text-primary);
  border: 1px solid var(--border-light);
}

.dialog-actions .ghost:hover {
  background: var(--bg-hover);
}

.dialog-actions .primary {
  background: #111111;
  color: #ffffff;
  border: 1px solid #111111;
}

.dialog-actions .primary:hover {
  background: #2f2f2f;
}

@media (max-width: 768px) {
  .selector-control {
    max-width: 160px;
  }
}
</style>
