import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { Role } from "../types/role";
import {
  DEFAULT_ROLES,
  PROJECT_CUSTOM_ROLE_SEEDS,
  PROJECT_ROLE_SEED_VERSION,
} from "../data/defaultRoles";

const STORAGE_KEY = "ai-chat-roles";
const CURRENT_ROLE_KEY = "ai-chat-current-role";
const ROLE_SEED_VERSION_KEY = "ai-chat-role-seed-version";

type CustomRoleInput = Omit<Role, "id" | "isDefault">;
type CustomRoleUpdates = Partial<CustomRoleInput>;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isRole = (value: unknown): value is Role => {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === "string" &&
    typeof value.name === "string" &&
    typeof value.description === "string" &&
    typeof value.systemPrompt === "string" &&
    typeof value.isDefault === "boolean"
  );
};

const normalizeCustomRoleInput = (roleData: CustomRoleInput): CustomRoleInput => ({
  name: roleData.name.trim(),
  description: roleData.description.trim(),
  systemPrompt: roleData.systemPrompt.trim(),
});

const uniqueRolesById = (roleList: Role[]) => {
  const roleMap = new Map<string, Role>();

  roleList.forEach((role) => {
    roleMap.set(role.id, role);
  });

  return Array.from(roleMap.values());
};

const mergeProjectRoles = (customRolesFromStorage: Role[], seedVersion: string | null) => {
  const shouldApplyProjectSeeds = seedVersion !== PROJECT_ROLE_SEED_VERSION;
  const projectSeeds = shouldApplyProjectSeeds ? PROJECT_CUSTOM_ROLE_SEEDS : [];

  return uniqueRolesById([
    ...DEFAULT_ROLES,
    ...projectSeeds,
    ...customRolesFromStorage,
  ]);
};

const createCustomRoleId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `custom-${crypto.randomUUID()}`;
  }

  return `custom-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

export const useRoleStore = defineStore("roles", () => {
  // 状态
  const roles = ref<Role[]>([]);
  const currentRoleId = ref<string>("");

  // 计算属性
  const currentRole = computed(
    () =>
      roles.value.find((role) => role.id === currentRoleId.value) ||
      roles.value[0]
  );

  const customRoles = computed(() =>
    roles.value.filter((role) => !role.isDefault)
  );

  const defaultRoles = computed(() =>
    roles.value.filter((role) => role.isDefault)
  );

  // 从本地存储加载数据
  const loadFromStorage = () => {
    try {
      const savedRoles = localStorage.getItem(STORAGE_KEY);
      const savedCurrentRoleId = localStorage.getItem(CURRENT_ROLE_KEY);
      const savedSeedVersion = localStorage.getItem(ROLE_SEED_VERSION_KEY);

      let customRolesFromStorage: Role[] = [];
      if (savedRoles) {
        const parsedRoles: unknown = JSON.parse(savedRoles);
        customRolesFromStorage = Array.isArray(parsedRoles)
          ? parsedRoles.filter(
              (role): role is Role => isRole(role) && !role.isDefault
            )
          : [];
      }

      roles.value = mergeProjectRoles(customRolesFromStorage, savedSeedVersion);

      // 设置当前角色
      if (
        savedCurrentRoleId &&
        roles.value.some((role) => role.id === savedCurrentRoleId)
      ) {
        currentRoleId.value = savedCurrentRoleId;
      } else {
        currentRoleId.value = roles.value[0]?.id || "";
      }

      saveToStorage();
    } catch (error) {
      console.error("加载角色配置失败:", error);
      roles.value = [...DEFAULT_ROLES, ...PROJECT_CUSTOM_ROLE_SEEDS];
      currentRoleId.value = roles.value[0]?.id || "";
      saveToStorage();
    }
  };

  // 保存到本地存储
  const saveToStorage = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(roles.value));
      localStorage.setItem(CURRENT_ROLE_KEY, currentRoleId.value);
      localStorage.setItem(ROLE_SEED_VERSION_KEY, PROJECT_ROLE_SEED_VERSION);
    } catch (error) {
      console.error("保存角色配置失败:", error);
    }
  };

  // 添加自定义角色
  const addCustomRole = (roleData: CustomRoleInput) => {
    const normalizedRoleData = normalizeCustomRoleInput(roleData);

    if (!normalizedRoleData.name || !normalizedRoleData.systemPrompt) {
      return null;
    }

    const newRole: Role = {
      ...normalizedRoleData,
      id: createCustomRoleId(),
      isDefault: false,
    };

    roles.value = [...roles.value, newRole];
    saveToStorage();
    return newRole;
  };

  // 删除自定义角色
  const deleteCustomRole = (roleId: string) => {
    const roleIndex = roles.value.findIndex((role) => role.id === roleId);
    if (roleIndex === -1) return false;

    const role = roles.value[roleIndex];
    if (role.isDefault) {
      console.warn("不能删除默认角色");
      return false;
    }

    roles.value = roles.value.filter((item) => item.id !== roleId);

    // 如果删除的是当前角色，切换到默认角色
    if (currentRoleId.value === roleId) {
      currentRoleId.value = roles.value[0]?.id || "";
    }

    saveToStorage();
    return true;
  };

  // 更新自定义角色
  const updateCustomRole = (
    roleId: string,
    updates: CustomRoleUpdates
  ) => {
    const roleIndex = roles.value.findIndex((role) => role.id === roleId);
    if (roleIndex === -1) return false;

    const role = roles.value[roleIndex];
    if (role.isDefault) {
      console.warn("不能编辑默认角色");
      return false;
    }

    const nextRole = {
      ...role,
      ...updates,
      name: updates.name?.trim() ?? role.name,
      description: updates.description?.trim() ?? role.description,
      systemPrompt: updates.systemPrompt?.trim() ?? role.systemPrompt,
    };

    if (!nextRole.name || !nextRole.systemPrompt) {
      return false;
    }

    roles.value[roleIndex] = nextRole;
    saveToStorage();
    return true;
  };

  // 切换当前角色
  const setCurrentRole = (roleId: string) => {
    if (roles.value.some((role) => role.id === roleId)) {
      currentRoleId.value = roleId;
      saveToStorage();
      return true;
    }
    return false;
  };

  // 获取角色
  const getRoleById = (roleId: string) => {
    return roles.value.find((role) => role.id === roleId);
  };

  // 初始化
  const init = () => {
    loadFromStorage();
  };

  return {
    // 状态
    roles,
    currentRoleId,

    // 计算属性
    currentRole,
    customRoles,
    defaultRoles,

    // 方法
    init,
    addCustomRole,
    deleteCustomRole,
    updateCustomRole,
    setCurrentRole,
    getRoleById,
  };
});
