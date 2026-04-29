<template>
  <div class="chat-window" id="chatWindow">
    <div class="chat-header">
      <div class="conversation-meta">
        <button class="new-chat-button" @click="handleNewChat" title="开始新对话">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
            ></path>
            <line x1="12" y1="9" x2="12" y2="15"></line>
            <line x1="9" y1="12" x2="15" y2="12"></line>
          </svg>
        </button>
        <div>
          <h2 class="chat-title">ChatGPT</h2>
          <p class="chat-subtitle">模型、角色与 OCR 已集成到工具栏</p>
        </div>
      </div>

      <div class="header-toolbar">
        <ModelSelector />
        <button
          class="clear-button"
          @click="handleClearChat"
          title="清除当前对话"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M3 6h18"></path>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
            <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        </button>
        <ViewControls :showAddButton="false" targetElementId="chatWindow" />
      </div>
    </div>

    <div class="messages" ref="messagesContainer">
      <div v-if="messages.length === 0" class="welcome-message">
        <div class="welcome-mark">AI</div>
        <h3>今天想聊些什么？</h3>
        <p>选择模型和角色后直接输入问题，也可以上传或粘贴图片进行 OCR 识别。</p>
      </div>

      <ChatMessage
        v-for="(msg, index) in messages"
        :key="msg.id"
        :message="msg"
        :class="{ 'message-appear': true }"
        :style="{ animationDelay: `${index * 0.04}s` }"
      />
    </div>

    <div v-if="uploadedDocuments.length > 0" class="document-tray">
      <div
        v-for="document in uploadedDocuments"
        :key="document.id"
        class="document-chip"
        :title="document.name"
      >
        <span class="document-name">{{ document.name }}</span>
        <span class="document-meta">
          {{ document.chunks.length }} 片段 · {{ formatFileSize(document.size) }}
        </span>
        <button
          class="document-remove"
          type="button"
          title="移除文件上下文"
          @click="handleRemoveDocument(document.id)"
        >
          ×
        </button>
      </div>
    </div>

    <ChatInput
      @sendMessage="handleSendMessage"
      @attachDocument="handleAttachDocument"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";
import type { UploadedDocument } from "../types/document";
import { useChatStore } from "../store/chat";
import { formatFileSize } from "../utils/documents";
import ChatInput from "./ChatInput.vue";
import ChatMessage from "./ChatMessage.vue";
import ModelSelector from "./ModelSelector.vue";
import ViewControls from "./ViewControls.vue";

const chatStore = useChatStore();
const messages = computed(() => chatStore.messages);
const uploadedDocuments = computed(() => chatStore.uploadedDocuments);
const messagesContainer = ref<HTMLDivElement | null>(null);

const handleSendMessage = async (text: string) => {
  await chatStore.sendMessageToAI(text);
};

const handleAttachDocument = (document: UploadedDocument) => {
  chatStore.attachDocument(document);
};

const handleRemoveDocument = (documentId: string) => {
  chatStore.removeDocument(documentId);
};

const handleNewChat = async () => {
  if (messages.value.length === 0) {
    return;
  }

  if (confirm("开始新对话？当前对话将自动保存到历史记录。")) {
    await chatStore.startNewConversation();
  }
};

const handleClearChat = async () => {
  if (confirm("确定要清除当前对话吗？此操作不可恢复。")) {
    await chatStore.clearMessages();
  }
};

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  });
};

watch(
  () => [
    messages.value.length,
    messages.value[messages.value.length - 1]?.content,
  ],
  scrollToBottom,
);
</script>

<style scoped>
.chat-window {
  display: flex;
  flex-direction: column;
  height: 100vh;
  min-height: 0;
  background: var(--bg-surface);
  overflow: visible;
}

.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  min-height: 64px;
  padding: 10px 20px;
  background: rgba(255, 255, 255, 0.96);
  border-bottom: 1px solid var(--border-light);
  position: sticky;
  top: 0;
  z-index: 20;
  backdrop-filter: blur(14px);
}

.conversation-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.chat-title {
  margin: 0;
  font-size: 18px;
  font-weight: 650;
  color: var(--text-primary);
}

.chat-subtitle {
  margin: 2px 0 0;
  font-size: 12px;
  color: var(--text-muted);
}

.header-toolbar {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  min-width: 0;
}

.new-chat-button,
.clear-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border: 1px solid transparent;
  background: transparent;
  cursor: pointer;
  color: var(--text-secondary);
  border-radius: var(--radius-md);
  transition: background var(--transition-fast), color var(--transition-fast);
}

.new-chat-button:hover,
.clear-button:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.new-chat-button:hover {
  color: var(--primary-color);
}

.messages {
  flex: 1;
  min-height: 0;
  padding: 0;
  overflow-y: auto;
  background: var(--bg-surface);
  scroll-behavior: smooth;
  display: flex;
  flex-direction: column;
  gap: 0;
}

.welcome-message {
  text-align: center;
  padding: 16vh 20px 80px;
  color: var(--text-secondary);
  max-width: 620px;
  margin: 0 auto;
}

.welcome-mark {
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  margin: 0 auto 22px;
  border-radius: 12px;
  background: #111111;
  color: #ffffff;
  font-size: 13px;
  font-weight: 700;
}

.welcome-message h3 {
  margin: 0 0 10px;
  font-size: clamp(26px, 4vw, 34px);
  font-weight: 650;
  letter-spacing: -0.03em;
  color: var(--text-primary);
}

.welcome-message p {
  margin: 0;
  font-size: 15px;
  line-height: 1.7;
  color: var(--text-muted);
}

.message-appear {
  animation: fadeIn 0.2s ease forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.messages::-webkit-scrollbar {
  width: 8px;
}

.messages::-webkit-scrollbar-track {
  background: transparent;
}

.messages::-webkit-scrollbar-thumb {
  background: #d9d9d9;
  border-radius: 999px;
}

.messages::-webkit-scrollbar-thumb:hover {
  background: #bdbdbd;
}

.document-tray {
  display: flex;
  gap: 8px;
  width: min(820px, calc(100% - 40px));
  margin: 0 auto;
  padding: 10px 0 0;
  overflow-x: auto;
}

.document-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  max-width: 280px;
  padding: 7px 9px 7px 11px;
  border: 1px solid var(--border-light);
  border-radius: 999px;
  background: #ffffff;
  box-shadow: var(--shadow-sm);
  color: var(--text-secondary);
  font-size: 12px;
  white-space: nowrap;
}

.document-name {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--text-primary);
  font-weight: 600;
}

.document-meta {
  flex-shrink: 0;
  color: var(--text-muted);
}

.document-remove {
  display: grid;
  place-items: center;
  width: 18px;
  height: 18px;
  border: none;
  border-radius: 50%;
  background: var(--bg-muted);
  color: var(--text-muted);
  cursor: pointer;
  line-height: 1;
}

.document-remove:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

@media (max-width: 768px) {
  .chat-window {
    height: calc(100vh - 58px);
  }

  .chat-header {
    align-items: flex-start;
    flex-direction: column;
    padding: 10px 14px;
    gap: 10px;
  }

  .chat-subtitle {
    display: none;
  }

  .header-toolbar {
    width: 100%;
    justify-content: flex-start;
    overflow-x: auto;
    padding-bottom: 2px;
  }

  .messages {
    padding: 0;
  }

  .document-tray {
    width: calc(100% - 24px);
  }

  .welcome-message {
    padding: 48px 16px;
  }
}
</style>
