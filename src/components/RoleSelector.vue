<template>
  <div class="role-selector">
    <!-- 角色选择下拉框 -->
    <div class="role-dropdown">
      <button
        class="role-button"
        @click="isDropdownOpen = !isDropdownOpen"
        :title="currentRole?.description"
      >
        <span class="role-name">{{ currentRole?.name || "选择角色" }}</span>
        <svg
          class="chevron"
          :class="{ rotate: isDropdownOpen }"
          width="16"
          height="16"
          viewBox="0 0 16 16"
        >
          <path
            d="M4 6l4 4 4-4"
            stroke="currentColor"
            stroke-width="2"
            fill="none"
          />
        </svg>
      </button>

      <!-- 下拉菜单 -->
      <div v-if="isDropdownOpen" class="dropdown-menu">
        <div class="role-section">
          <div class="section-title">默认角色</div>
          <button
            v-for="role in defaultRoles"
            :key="role.id"
            class="role-item"
            :class="{ active: currentRoleId === role.id }"
            @click="selectRole(role.id)"
            :title="role.description"
          >
            <span class="role-name">{{ role.name }}</span>
          </button>
        </div>

        <div v-if="customRoles.length > 0" class="role-section">
          <div class="section-title">自定义角色</div>
          <div
            v-for="role in customRoles"
            :key="role.id"
            class="role-item-wrapper"
          >
            <button
              class="role-item"
              :class="{ active: currentRoleId === role.id }"
              @click="selectRole(role.id)"
              :title="role.description"
            >
              <span class="role-name">{{ role.name }}</span>
            </button>
            <button
              class="edit-role"
              @click.stop="openEditRoleDialog(role)"
              title="编辑角色"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path
                  d="M11.333 2A2.122 2.122 0 0 1 14 4.667L5 13.667l-3.667.333.334-3.667L11.333 2z"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </button>
            <button
              class="delete-role"
              @click.stop="deleteRole(role.id)"
              title="删除角色"
            >
              ×
            </button>
          </div>
        </div>

        <div class="role-section">
          <button class="add-role-button" @click="openAddRoleDialog">
            <svg width="16" height="16" viewBox="0 0 16 16">
              <path d="M8 3v10M3 8h10" stroke="currentColor" stroke-width="2" />
            </svg>
            <span>添加自定义角色</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 点击外部关闭下拉框 -->
    <div
      v-if="isDropdownOpen"
      class="dropdown-overlay"
      @click="isDropdownOpen = false"
    ></div>

    <!-- 新增/编辑角色弹窗 -->
    <RoleDialog
      v-if="isDialogOpen"
      :edit-role="editingRole"
      @close="closeDialog"
      @confirm="handleSaveRole"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRoleStore } from "../store/roles";
import RoleDialog from "./RoleDialog.vue";
import type { Role } from "../types/role";

const roleStore = useRoleStore();

// 响应式状态
const isDropdownOpen = ref(false);
const isDialogOpen = ref(false);
const editingRole = ref<Role | undefined>(undefined);

// 计算属性
const currentRole = computed(() => roleStore.currentRole);
const currentRoleId = computed(() => roleStore.currentRoleId);
const defaultRoles = computed(() => roleStore.defaultRoles);
const customRoles = computed(() => roleStore.customRoles);

// 方法
const selectRole = (roleId: string) => {
  roleStore.setCurrentRole(roleId);
  isDropdownOpen.value = false;
};

const deleteRole = (roleId: string) => {
  if (confirm("确定要删除这个角色吗？")) {
    roleStore.deleteCustomRole(roleId);
  }
};

const openAddRoleDialog = () => {
  isDropdownOpen.value = false;
  editingRole.value = undefined;
  isDialogOpen.value = true;
};

const openEditRoleDialog = (role: Role) => {
  isDropdownOpen.value = false;
  editingRole.value = role;
  isDialogOpen.value = true;
};

const closeDialog = () => {
  isDialogOpen.value = false;
  editingRole.value = undefined;
};

const handleSaveRole = (roleData: {
  id?: string;
  name: string;
  description: string;
  systemPrompt: string;
}) => {
  if (roleData.id) {
    // 编辑模式
    roleStore.updateCustomRole(roleData.id, {
      name: roleData.name,
      description: roleData.description,
      systemPrompt: roleData.systemPrompt,
    });
  } else {
    // 新增模式
    roleStore.addCustomRole(roleData);
  }
  closeDialog();
};

// 键盘事件处理
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === "Escape" && isDropdownOpen.value) {
    isDropdownOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener("keydown", handleKeydown);
});

onUnmounted(() => {
  document.removeEventListener("keydown", handleKeydown);
});
</script>

<style scoped>
.role-selector {
  position: relative;
  display: inline-block;
  z-index: 100;
}

.role-dropdown {
  position: relative;
}

.role-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  color: #333;
  transition: all 0.2s ease;
  min-width: 140px;
  justify-content: space-between;
}

.role-button:hover {
  background: #e8e8e8;
  border-color: #bbb;
}

.role-name {
  flex: 1;
  text-align: left;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chevron {
  transition: transform 0.2s ease;
  flex-shrink: 0;
}

.chevron.rotate {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #ddd;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  max-height: 300px;
  overflow-y: auto;
  min-width: 200px;
}

.role-section {
  padding: 8px 0;
}

.role-section:not(:last-child) {
  border-bottom: 1px solid #eee;
}

.section-title {
  padding: 4px 12px;
  font-size: 12px;
  color: #666;
  font-weight: 500;
}

.role-item-wrapper {
  display: flex;
  align-items: center;
}

.role-item {
  flex: 1;
  display: block;
  width: 100%;
  padding: 8px 12px;
  text-align: left;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
  color: #333;
  transition: background-color 0.2s ease;
}

.role-item:hover {
  background: #f5f5f5;
}

.role-item.active {
  background: #e3f2fd;
  color: #1976d2;
}

.edit-role {
  padding: 4px 8px;
  margin: 4px 0;
  background: none;
  border: none;
  cursor: pointer;
  color: #999;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.edit-role:hover {
  background: #e3f2fd;
  color: #1976d2;
}

.delete-role {
  padding: 4px 8px;
  margin: 4px;
  background: none;
  border: none;
  cursor: pointer;
  color: #999;
  font-size: 18px;
  line-height: 1;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.delete-role:hover {
  background: #ffebee;
  color: #d32f2f;
}

.add-role-button {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 8px 12px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
  color: #1976d2;
  transition: background-color 0.2s ease;
}

.add-role-button:hover {
  background: #f5f5f5;
}

.dropdown-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
  background: transparent;
}
</style>
