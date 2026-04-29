<template>
  <div id="app">
    <div class="app-layout">
      <aside class="sidebar">
        <div class="sidebar-brand">
          <div class="brand-mark">AI</div>
          <div>
            <h1 class="app-title">智能助手</h1>
            <p class="app-subtitle">你的专属 AI 对话伙伴</p>
          </div>
        </div>
        <ConversationHistory />
      </aside>

      <main class="main-content">
        <div class="mobile-brand">
          <div class="brand-mark">AI</div>
          <div>
            <h1 class="app-title">智能助手</h1>
            <p class="app-subtitle">你的专属 AI 对话伙伴</p>
          </div>
        </div>
        <ChatWindow />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import ChatWindow from "./components/ChatWindow.vue";
import ConversationHistory from "./components/ConversationHistory.vue";
import { useRoleStore } from "./store/roles";
import { useModelStore } from "./store/models";

const roleStore = useRoleStore();
const modelStore = useModelStore();

onMounted(() => {
  roleStore.init();
  modelStore.init();
});
</script>

<style>
:root {
  --primary-color: #10a37f;
  --primary-hover: #0e8f70;
  --bg-page: #ffffff;
  --bg-sidebar: #f9f9f9;
  --bg-surface: #ffffff;
  --bg-muted: #f4f4f4;
  --bg-hover: #ececec;
  --text-primary: #0d0d0d;
  --text-secondary: #5d5d5d;
  --text-muted: #8e8e8e;
  --border-light: #e5e5e5;
  --border-medium: #d9d9d9;
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.04);
  --shadow-md: 0 8px 24px rgba(0, 0, 0, 0.08);
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 16px;
  --transition-fast: 0.16s ease;
  --sidebar-width: 288px;
}

* {
  box-sizing: border-box;
}

html,
body,
#app {
  min-height: 100vh;
}

body {
  font-family: ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI",
    "Roboto", "Helvetica Neue", Arial, sans-serif;
  color: var(--text-primary);
  background: var(--bg-page);
  margin: 0;
  padding: 0;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

button,
input,
textarea,
select {
  font: inherit;
}

button {
  color: inherit;
}

#app {
  width: 100%;
}

.app-layout {
  display: grid;
  grid-template-columns: var(--sidebar-width) minmax(0, 1fr);
  min-height: 100vh;
  background: var(--bg-page);
}

.sidebar {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  padding: 12px;
  background: var(--bg-sidebar);
  border-right: 1px solid var(--border-light);
  overflow: hidden;
}

.sidebar-brand,
.mobile-brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.sidebar-brand {
  padding: 8px 8px 14px;
  flex-shrink: 0;
}

.mobile-brand {
  display: none;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-light);
}

.brand-mark {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border-radius: 9px;
  background: #111111;
  color: #ffffff;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.app-title {
  margin: 0;
  font-size: 15px;
  font-weight: 650;
  letter-spacing: -0.01em;
  color: var(--text-primary);
}

.app-subtitle {
  margin: 2px 0 0;
  font-size: 12px;
  color: var(--text-muted);
}

.main-content {
  min-width: 0;
  min-height: 100vh;
  background: var(--bg-surface);
}

::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: #d9d9d9;
  border-radius: 999px;
}

::-webkit-scrollbar-thumb:hover {
  background: #bdbdbd;
}

::selection {
  background: rgba(16, 163, 127, 0.18);
  color: var(--text-primary);
}

button:focus-visible,
input:focus-visible,
textarea:focus-visible,
select:focus-visible {
  outline: 2px solid rgba(16, 163, 127, 0.45);
  outline-offset: 2px;
}

@media (max-width: 900px) {
  .app-layout {
    grid-template-columns: 1fr;
  }

  .sidebar {
    min-height: auto;
    max-height: 260px;
    border-right: none;
    border-bottom: 1px solid var(--border-light);
    order: 2;
  }

  .main-content {
    min-height: calc(100vh - 260px);
    order: 1;
  }

  .sidebar-brand {
    display: none;
  }

  .mobile-brand {
    display: flex;
  }
}

@media (max-width: 640px) {
  :root {
    --sidebar-width: 100%;
  }

  .sidebar {
    max-height: 220px;
    padding: 8px;
  }
}
</style>
