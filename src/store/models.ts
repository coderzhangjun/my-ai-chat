import { defineStore } from "pinia";
import { computed, ref } from "vue";
import type { ModelConfig } from "../types/model";

const STORAGE_KEY = "ai-chat-models";
const CURRENT_MODEL_KEY = "ai-chat-current-model";

const DEFAULT_MODELS: ModelConfig[] = [
  {
    id: "deepseek-default",
    name: "DeepSeek 默认",
    provider: "deepseek",
    model: "deepseek-reasoner",
    baseUrl: "https://api.deepseek.com",
    endpoint: "/v1/chat/completions",
    isDefault: true,
    description: "保留默认 DeepSeek 通道，可自填密钥",
  },
];

export const useModelStore = defineStore("models", () => {
  const models = ref<ModelConfig[]>([...DEFAULT_MODELS]);
  const currentModelId = ref<string>(DEFAULT_MODELS[0].id);

  const currentModel = computed<ModelConfig | undefined>(() =>
    models.value.find((item) => item.id === currentModelId.value)
  );

  const loadFromStorage = () => {
    const savedModels = localStorage.getItem(STORAGE_KEY);
    const savedCurrentModelId = localStorage.getItem(CURRENT_MODEL_KEY);

    if (savedModels) {
      try {
        const parsed: ModelConfig[] = JSON.parse(savedModels);
        const custom = parsed.filter((item) => !item.isDefault);
        models.value = [...DEFAULT_MODELS, ...custom];
      } catch (error) {
        console.error("加载模型配置失败:", error);
        models.value = [...DEFAULT_MODELS];
      }
    } else {
      models.value = [...DEFAULT_MODELS];
    }

    if (
      savedCurrentModelId &&
      models.value.some((item) => item.id === savedCurrentModelId)
    ) {
      currentModelId.value = savedCurrentModelId;
    } else {
      currentModelId.value = models.value[0]?.id ?? DEFAULT_MODELS[0].id;
    }
  };

  const persist = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(models.value));
    localStorage.setItem(CURRENT_MODEL_KEY, currentModelId.value);
  };

  const addCustomModel = (model: {
    name: string;
    baseUrl: string;
    apiKey: string;
    model: string;
    endpoint?: string;
    description?: string;
  }) => {
    const newModel: ModelConfig = {
      id: `custom-${Date.now()}`,
      name: model.name,
      provider: "custom",
      model: model.model,
      baseUrl: model.baseUrl.replace(/\/+$/, ""),
      apiKey: model.apiKey,
      endpoint: model.endpoint?.trim() || "/v1/chat/completions",
      isDefault: false,
      description: model.description,
    };
    models.value.push(newModel);
    persist();
    return newModel;
  };

  const updateCustomModel = (id: string, patch: Partial<ModelConfig>) => {
    const index = models.value.findIndex((item) => item.id === id);
    if (index === -1) return false;
    if (models.value[index].isDefault) return false;

    models.value[index] = {
      ...models.value[index],
      ...patch,
      baseUrl:
        patch.baseUrl !== undefined
          ? patch.baseUrl.replace(/\/+$/, "")
          : models.value[index].baseUrl,
      endpoint:
        patch.endpoint !== undefined && patch.endpoint !== null
          ? patch.endpoint || "/v1/chat/completions"
          : models.value[index].endpoint,
    };
    persist();
    return true;
  };

  const deleteCustomModel = (id: string) => {
    const target = models.value.find((item) => item.id === id);
    if (!target || target.isDefault) return false;
    models.value = models.value.filter((item) => item.id !== id);
    if (currentModelId.value === id) {
      currentModelId.value = models.value[0]?.id ?? DEFAULT_MODELS[0].id;
    }
    persist();
    return true;
  };

  const setCurrentModel = (id: string) => {
    const exists = models.value.some((item) => item.id === id);
    if (!exists) return false;
    currentModelId.value = id;
    persist();
    return true;
  };

  const init = () => {
    loadFromStorage();
  };

  return {
    models,
    currentModelId,
    currentModel,
    init,
    addCustomModel,
    updateCustomModel,
    deleteCustomModel,
    setCurrentModel,
  };
});
