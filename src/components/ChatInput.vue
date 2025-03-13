<template>
  <div class="chat-input">
    <textarea
      ref="textareaRef"
      v-model="inputText"
      placeholder="输入消息..."
      @keydown.enter.prevent="handleEnter"
      @input="autoResize"
      class="message-textarea"
      rows="1"
    ></textarea>
    <button @click="sendMessage" class="send-button" :disabled="!inputText.trim()">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="22" y1="2" x2="11" y2="13"></line>
        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const inputText = ref('');
const textareaRef = ref<HTMLTextAreaElement | null>(null);

const emit = defineEmits(['sendMessage']);

const sendMessage = () => {
  const text = inputText.value.trim();
  if (text) {
    emit('sendMessage', text);
    inputText.value = '';
    // 重置文本框高度
    if (textareaRef.value) {
      textareaRef.value.style.height = 'auto';
    }
  }
};

const handleEnter = (e: KeyboardEvent) => {
  // Shift+Enter 允许换行
  if (e.shiftKey) return;
  
  // 普通 Enter 发送消息
  sendMessage();
};

// 自动调整文本框高度
const autoResize = () => {
  const textarea = textareaRef.value;
  if (textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  }
};
</script>

<style scoped>
.chat-input {
  display: flex;
  padding: var(--spacing-sm);
  background: var(--bg-white);
  border-top: 1px solid var(--border-color, #eee);
}

.message-textarea {
  flex: 1;
  padding: 12px;
  border: 1px solid var(--border-color, #eee);
  border-radius: var(--radius-md);
  font-family: inherit;
  font-size: 14px;
  resize: none;
  max-height: 150px;
  overflow-y: auto;
  line-height: 1.5;
}

.message-textarea:focus {
  outline: none;
  border-color: var(--primary-color, #1890ff);
}

.send-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  margin-left: var(--spacing-sm);
  border: none;
  border-radius: var(--radius-md);
  background-color: var(--primary-color, #1890ff);
  color: white;
  cursor: pointer;
  transition: all 0.2s;
}

.send-button:hover {
  background-color: var(--primary-hover, #40a9ff);
}

.send-button:disabled {
  background-color: var(--disabled-color, #d9d9d9);
  cursor: not-allowed;
}
</style>
