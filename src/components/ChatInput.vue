<template>
  <div class="chat-input-container">
    <div class="chat-input">
      <div class="input-wrapper">
        <textarea
          ref="textareaRef"
          v-model="inputText"
          placeholder="输入你的消息..."
          @keydown.enter.prevent="handleEnter"
          @input="autoResize"
          @focus="handleFocus"
          @blur="handleBlur"
          class="message-textarea"
          rows="1"
        ></textarea>
        <div class="input-actions">
          <button
            @click="sendMessage"
            class="send-button"
            :disabled="!inputText.trim()"
            :class="{ 'send-ready': inputText.trim() }"
          >
            <div class="send-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </div>
          </button>
        </div>
      </div>
    </div>
    <div class="input-hint">
      <span class="hint-text">按 Enter 发送，Shift + Enter 换行</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

const inputText = ref("");
const textareaRef = ref<HTMLTextAreaElement | null>(null);
const isFocused = ref(false);

const emit = defineEmits(["sendMessage"]);

const sendMessage = () => {
  const text = inputText.value.trim();
  if (text) {
    emit("sendMessage", text);
    inputText.value = "";
    // 重置文本框高度
    if (textareaRef.value) {
      textareaRef.value.style.height = "auto";
    }
  }
};

const handleEnter = (e: KeyboardEvent) => {
  // Shift+Enter 允许换行
  if (e.shiftKey) return;

  // 普通 Enter 发送消息
  sendMessage();
};

const handleFocus = () => {
  isFocused.value = true;
};

const handleBlur = () => {
  isFocused.value = false;
};

// 自动调整文本框高度
const autoResize = () => {
  const textarea = textareaRef.value;
  if (textarea) {
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
  }
};
</script>

<style scoped>
.chat-input-container {
  padding: 20px 24px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}

.chat-input {
  position: relative;
}

.input-wrapper {
  display: flex;
  align-items: flex-end;
  gap: 12px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 16px;
  padding: 4px;
  border: 2px solid transparent;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.input-wrapper:focus-within {
  border-color: #667eea;
  box-shadow: 0 8px 30px rgba(102, 126, 234, 0.15);
  background: white;
}

.message-textarea {
  flex: 1;
  padding: 14px 18px;
  border: none;
  border-radius: 12px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui,
    sans-serif;
  font-size: 15px;
  line-height: 1.5;
  resize: none;
  max-height: 120px;
  overflow-y: auto;
  background: transparent;
  color: #2d3748;
  transition: all 0.2s ease;
}

.message-textarea::placeholder {
  color: #a0aec0;
  transition: color 0.2s ease;
}

.message-textarea:focus {
  outline: none;
}

.message-textarea:focus::placeholder {
  color: #cbd5e0;
}

.input-actions {
  padding: 4px;
}

.send-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: #e2e8f0;
  color: #a0aec0;
  position: relative;
  overflow: hidden;
}

.send-button::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #667eea, #764ba2);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.send-button.send-ready {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
  transform: translateY(-1px);
}

.send-button.send-ready::before {
  opacity: 1;
}

.send-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
}

.send-button:active:not(:disabled) {
  transform: translateY(0);
}

.send-button:disabled {
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.send-icon {
  position: relative;
  z-index: 1;
  transition: transform 0.2s ease;
}

.send-button.send-ready .send-icon {
  animation: bounceIn 0.3s ease;
}

.send-button:hover .send-icon {
  transform: scale(1.1);
}

@keyframes bounceIn {
  0% {
    opacity: 0;
    transform: scale(0.3);
  }
  50% {
    opacity: 1;
    transform: scale(1.05);
  }
  70% {
    transform: scale(0.9);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

.input-hint {
  display: flex;
  justify-content: center;
  margin-top: 12px;
}

.hint-text {
  font-size: 12px;
  color: #a0aec0;
  background: rgba(255, 255, 255, 0.6);
  padding: 6px 12px;
  border-radius: 20px;
  backdrop-filter: blur(10px);
  transition: all 0.2s ease;
}

.input-wrapper:focus-within + .input-hint .hint-text {
  color: #667eea;
  background: rgba(102, 126, 234, 0.1);
}

/* 滚动条样式 */
.message-textarea::-webkit-scrollbar {
  width: 6px;
}

.message-textarea::-webkit-scrollbar-track {
  background: transparent;
}

.message-textarea::-webkit-scrollbar-thumb {
  background: rgba(102, 126, 234, 0.3);
  border-radius: 3px;
}

.message-textarea::-webkit-scrollbar-thumb:hover {
  background: rgba(102, 126, 234, 0.5);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .chat-input-container {
    padding: 16px 20px;
  }

  .input-wrapper {
    border-radius: 14px;
    padding: 3px;
  }

  .message-textarea {
    padding: 12px 16px;
    font-size: 16px; /* 防止iOS缩放 */
  }

  .send-button {
    width: 40px;
    height: 40px;
  }

  .hint-text {
    font-size: 11px;
  }
}
</style>
