<template>
  <div class="model-selector">
    <label class="selector-label">模型通道</label>
    <div class="selector-row">
      <select v-model="selectedId" class="selector-control">
        <option
          v-for="item in models"
          :key="item.id"
          :value="item.id"
          :title="item.description || item.name"
        >
          {{ item.name }}
        </option>
      </select>
      <button class="add-button" @click="openDialog">新增模型</button>
      <button
        class="add-button"
        :disabled="!currentModel || currentModel.isDefault"
        @click="editCurrent"
      >
        编辑当前
      </button>
    </div>

    <div v-if="showDialog" class="dialog-backdrop" @click.self="closeDialog">
      <div class="dialog">
        <h3 class="dialog-title">新增自定义模型</h3>
        <div class="dialog-body">
          <div class="preset-row">
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

    <div v-if="currentModel" class="model-info">
      <div class="info-row">
        <span class="info-label">提供商</span>
        <code class="info-value">{{ currentModel.provider }}</code>
      </div>
      <div class="info-row">
        <span class="info-label">模型 ID</span>
        <code class="info-value">{{ currentModel.model }}</code>
      </div>
      <div class="info-row">
        <span class="info-label">Base URL</span>
        <code class="info-value">{{ currentModel.baseUrl }}</code>
      </div>
      <div class="info-row">
        <span class="info-label">API Key</span>
        <code class="info-value">{{ maskKey(currentModel.apiKey) }}</code>
      </div>
      <div class="info-row" v-if="currentModel.description">
        <span class="info-label">备注</span>
        <code class="info-value">{{ currentModel.description }}</code>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from "vue";
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
};

const closeDialog = () => {
  showDialog.value = false;
};

const fillOhmygpt = () => {
  form.name = "OhMyGPT gpt-4o";
  form.baseUrl = "https://api.ohmygpt.com/v1";
  form.model = "gpt-4o";
  form.endpoint = "/chat/completions";
};

const editCurrent = () => {
  if (!currentModel.value || currentModel.value.isDefault) return;
  const m = currentModel.value;
  editingId.value = m.id;
  form.name = m.name;
  form.baseUrl = m.baseUrl;
  form.model = m.model;
  form.apiKey = m.apiKey || "";
  form.endpoint = m.endpoint || "/v1/chat/completions";
  form.description = m.description || "";
  showDialog.value = true;
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
  flex-direction: column;
  gap: 6px;
}

.selector-label {
  font-size: 12px;
  color: #6e6e80;
}

.selector-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.selector-control {
  height: 32px;
  padding: 0 10px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  background: #fff;
  color: #374151;
  min-width: 180px;
}

.add-button {
  height: 32px;
  padding: 0 12px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  background: #f3f4f6;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s ease;
}

.add-button:hover {
  background: #e5e7eb;
}

.model-info {
  margin-top: 6px;
  padding: 8px 10px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  background: #f9fafb;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #374151;
}

.info-label {
  width: 64px;
  color: #6b7280;
}

.info-value {
  background: #fff;
  padding: 4px 8px;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
  color: #111827;
}

.dialog-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.dialog {
  width: 420px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
  padding: 20px;
}

.dialog-title {
  margin: 0 0 12px;
  font-size: 16px;
  color: #111827;
}

.dialog-body {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 13px;
  color: #374151;
}

.field input {
  height: 34px;
  padding: 0 10px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  background: #fff;
  color: #111827;
}

.preset-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.preset-label {
  font-size: 12px;
  color: #6b7280;
}

.preset-btn {
  height: 28px;
  padding: 0 10px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  background: #eef2ff;
  color: #4338ca;
  cursor: pointer;
  transition: all 0.2s ease;
}

.preset-btn:hover {
  background: #e0e7ff;
}

.dialog-actions {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.dialog-actions button {
  height: 34px;
  padding: 0 14px;
  border-radius: 8px;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.2s ease;
}

.dialog-actions .ghost {
  background: #f3f4f6;
  color: #374151;
  border-color: #e5e7eb;
}

.dialog-actions .primary {
  background: #4f46e5;
  color: #fff;
}

.dialog-actions .ghost:hover {
  background: #e5e7eb;
}

.dialog-actions .primary:hover {
  background: #4338ca;
}
</style>
