// 角色相关类型定义
export interface Role {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  isDefault: boolean; // 是否为默认角色（不可编辑删除）
}
