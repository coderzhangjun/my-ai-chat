export type ModelProvider = "deepseek" | "custom";

export interface ModelConfig {
  id: string;
  name: string;
  provider: ModelProvider;
  model: string;
  baseUrl: string;
  apiKey?: string;
  endpoint?: string;
  isDefault: boolean;
  description?: string;
}
