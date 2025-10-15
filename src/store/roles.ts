import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { Role } from "../types/role";
import { DEFAULT_ROLES } from "../types/role";

const STORAGE_KEY = "ai-chat-roles";
const CURRENT_ROLE_KEY = "ai-chat-current-role";

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

      if (savedRoles) {
        const parsedRoles = JSON.parse(savedRoles);
        // 合并默认角色和自定义角色，确保默认角色始终存在
        const customRolesFromStorage = parsedRoles.filter(
          (role: Role) => !role.isDefault
        );
        roles.value = [...DEFAULT_ROLES, ...customRolesFromStorage];
      } else {
        roles.value = [...DEFAULT_ROLES];
      }

      // 设置当前角色
      if (
        savedCurrentRoleId &&
        roles.value.some((role) => role.id === savedCurrentRoleId)
      ) {
        currentRoleId.value = savedCurrentRoleId;
      } else {
        currentRoleId.value = roles.value[0]?.id || "";
      }
    } catch (error) {
      console.error("加载角色配置失败:", error);
      roles.value = [...DEFAULT_ROLES];
      currentRoleId.value = roles.value[0]?.id || "";
    }
  };

  // 保存到本地存储
  const saveToStorage = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(roles.value));
      localStorage.setItem(CURRENT_ROLE_KEY, currentRoleId.value);
    } catch (error) {
      console.error("保存角色配置失败:", error);
    }
  };

  // 添加自定义角色
  const addCustomRole = (roleData: Omit<Role, "id" | "isDefault">) => {
    const newRole: Role = {
      ...roleData,
      id: `custom-${Date.now()}`,
      isDefault: false,
    };

    roles.value.push(newRole);
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

    roles.value.splice(roleIndex, 1);

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
    updates: Partial<Omit<Role, "id" | "isDefault">>
  ) => {
    const roleIndex = roles.value.findIndex((role) => role.id === roleId);
    if (roleIndex === -1) return false;

    const role = roles.value[roleIndex];
    if (role.isDefault) {
      console.warn("不能编辑默认角色");
      return false;
    }

    roles.value[roleIndex] = { ...role, ...updates };
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
