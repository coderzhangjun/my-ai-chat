<template>
  <div ref="selectorRef" class="role-selector">
    <button
      class="role-button"
      @click="toggleDropdown"
      :title="currentRole?.description"
      aria-haspopup="menu"
      :aria-expanded="isDropdownOpen"
    >
      <span class="role-name">{{ currentRole?.name || "选择角色" }}</span>
      <svg
        class="chevron"
        :class="{ rotate: isDropdownOpen }"
        width="16"
        height="16"
        viewBox="0 0 16 16"
        aria-hidden="true"
      >
        <path
          d="M4 6l4 4 4-4"
          stroke="currentColor"
          stroke-width="2"
          fill="none"
        />
      </svg>
    </button>

    <div v-if="isDropdownOpen" class="dropdown-menu" role="menu">
      <div class="role-section">
        <div class="section-title">默认角色</div>
        <button
          v-for="role in defaultRoles"
          :key="role.id"
          class="role-item"
          :class="{ active: currentRoleId === role.id }"
          @click="selectRole(role.id)"
          :title="role.description"
          role="menuitem"
        >
          <span class="role-name">{{ role.name }}</span>
        </button>
      </div>

      <div v-if="customRoles.length > 0" class="role-section">
        <div class="section-title">自定义角色</div>
        <div v-for="role in customRoles" :key="role.id" class="role-item-wrapper">
          <button
            class="role-item"
            :class="{ active: currentRoleId === role.id }"
            @click="selectRole(role.id)"
            :title="role.description"
            role="menuitem"
          >
            <span class="role-name">{{ role.name }}</span>
          </button>
          <button
            class="icon-action"
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
            class="icon-action danger"
            @click.stop="deleteRole(role.id)"
            title="删除角色"
          >
            ×
          </button>
        </div>
      </div>

      <div class="role-section">
        <button class="add-role-button" @click="openAddRoleDialog">
          <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
            <path d="M8 3v10M3 8h10" stroke="currentColor" stroke-width="2" />
          </svg>
          <span>添加自定义角色</span>
        </button>
      </div>
    </div>

    <RoleDialog
      v-if="isDialogOpen"
      :edit-role="editingRole"
      @close="closeDialog"
      @confirm="handleSaveRole"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import { useRoleStore } from "../store/roles";
import RoleDialog from "./RoleDialog.vue";
import type { Role } from "../types/role";

const roleStore = useRoleStore();

const selectorRef = ref<HTMLElement | null>(null);
const isDropdownOpen = ref(false);
const isDialogOpen = ref(false);
const editingRole = ref<Role | undefined>(undefined);

const currentRole = computed(() => roleStore.currentRole);
const currentRoleId = computed(() => roleStore.currentRoleId);
const defaultRoles = computed(() => roleStore.defaultRoles);
const customRoles = computed(() => roleStore.customRoles);

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value;
};

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
    const updated = roleStore.updateCustomRole(roleData.id, {
      name: roleData.name,
      description: roleData.description,
      systemPrompt: roleData.systemPrompt,
    });

    if (updated) {
      roleStore.setCurrentRole(roleData.id);
    }
  } else {
    const createdRole = roleStore.addCustomRole(roleData);

    if (createdRole) {
      roleStore.setCurrentRole(createdRole.id);
    }
  }

  closeDialog();
};

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === "Escape") {
    isDropdownOpen.value = false;
  }
};

const handleDocumentClick = (event: MouseEvent) => {
  const target = event.target;
  if (!(target instanceof Node)) {
    return;
  }

  if (!selectorRef.value?.contains(target)) {
    isDropdownOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener("keydown", handleKeydown);
  document.addEventListener("click", handleDocumentClick);
});

onUnmounted(() => {
  document.removeEventListener("keydown", handleKeydown);
  document.removeEventListener("click", handleDocumentClick);
});
</script>

<style scoped>
.role-selector {
  position: relative;
  display: inline-flex;
  z-index: 30;
}

.role-button {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-width: 132px;
  max-width: 180px;
  height: 34px;
  padding: 0 10px 0 12px;
  background: var(--bg-muted);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  cursor: pointer;
  font-size: 13px;
  color: var(--text-primary);
  transition: background var(--transition-fast), border-color var(--transition-fast);
}

.role-button:hover {
  background: var(--bg-hover);
  border-color: var(--border-medium);
}

.role-name {
  flex: 1;
  text-align: left;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chevron {
  flex-shrink: 0;
  color: var(--text-muted);
  transition: transform var(--transition-fast);
}

.chevron.rotate {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  z-index: 40;
  width: 240px;
  max-height: min(360px, calc(100vh - 96px));
  overflow-y: auto;
  padding: 6px;
  background: #ffffff;
  border: 1px solid var(--border-light);
  border-radius: 14px;
  box-shadow: var(--shadow-md);
}

.role-section {
  padding: 6px 0;
}

.role-section:not(:last-child) {
  border-bottom: 1px solid var(--border-light);
}

.section-title {
  padding: 4px 8px 6px;
  font-size: 12px;
  color: var(--text-muted);
  font-weight: 500;
}

.role-item-wrapper {
  display: flex;
  align-items: center;
  border-radius: var(--radius-md);
}

.role-item {
  flex: 1;
  display: block;
  min-width: 0;
  width: 100%;
  padding: 9px 8px;
  text-align: left;
  background: none;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  font-size: 13px;
  color: var(--text-primary);
  transition: background var(--transition-fast);
}

.role-item:hover,
.role-item.active {
  background: var(--bg-hover);
}

.role-item.active {
  color: var(--primary-color);
}

.icon-action {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  margin-right: 2px;
  background: none;
  border: none;
  border-radius: var(--radius-sm);
  color: var(--text-muted);
  cursor: pointer;
}

.icon-action:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.icon-action.danger:hover {
  color: #d93025;
}

.add-role-button {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 9px 8px;
  background: none;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  font-size: 13px;
  color: var(--primary-color);
  transition: background var(--transition-fast);
}

.add-role-button:hover {
  background: var(--bg-hover);
}

@media (max-width: 768px) {
  .dropdown-menu {
    left: 0;
    right: auto;
  }
}
</style>
