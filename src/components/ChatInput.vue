<template>
  <div class="chat-input-container">
    <div class="composer">
      <div v-if="isProcessing" class="ocr-status">
        <div class="loading-spinner"></div>
        <span>{{ processingLabel }}</span>
        <strong v-if="isOcrProcessing">{{ ocrProgress }}%</strong>
      </div>

      <div class="input-wrapper">
        <button
          @click="triggerFileInput"
          class="upload-button"
          :disabled="isProcessing"
          title="上传图片 OCR 或文本文件"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <circle cx="8.5" cy="8.5" r="1.5"></circle>
            <polyline points="21 15 16 10 5 21"></polyline>
          </svg>
        </button>

        <textarea
          ref="textareaRef"
          v-model="inputText"
          placeholder="询问任何问题，或上传文件后提问"
          @keydown.enter.prevent="handleEnter"
          @input="autoResize"
          @paste="handlePaste"
          class="message-textarea"
          rows="1"
          :disabled="isProcessing"
        ></textarea>

        <button
          @click="sendMessage"
          class="send-button"
          :disabled="!inputText.trim() || isProcessing"
          :class="{ 'send-ready': inputText.trim() }"
          title="发送"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.2"
          >
            <path d="M12 19V5"></path>
            <path d="M5 12l7-7 7 7"></path>
          </svg>
        </button>
      </div>

      <input
        ref="fileInputRef"
        type="file"
        :accept="fileAccept"
        @change="handleFileUpload"
        class="file-input"
      />
    </div>

    <div class="input-hint">Enter 发送，Shift + Enter 换行；支持图片 OCR 和文本文件上下文</div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import type { UploadedDocument } from "../types/document";
import { recognizeImage, validateImageFile } from "../utils/ocr";
import {
  ACCEPTED_DOCUMENT_TYPES,
  readDocumentFile,
} from "../utils/documents";

const inputText = ref("");
const textareaRef = ref<HTMLTextAreaElement | null>(null);
const fileInputRef = ref<HTMLInputElement | null>(null);
const isOcrProcessing = ref(false);
const isDocumentProcessing = ref(false);
const ocrProgress = ref(0);
const fileAccept = `image/png,image/jpeg,image/jpg,image/webp,${ACCEPTED_DOCUMENT_TYPES}`;
const isProcessing = computed(
  () => isOcrProcessing.value || isDocumentProcessing.value
);
const processingLabel = computed(() =>
  isOcrProcessing.value ? "正在识别图片文字" : "正在解析文件"
);

const emit = defineEmits<{
  (event: "sendMessage", text: string): void;
  (event: "attachDocument", document: UploadedDocument): void;
}>();

const sendMessage = () => {
  const text = inputText.value.trim();
  if (!text) {
    return;
  }

  emit("sendMessage", text);
  inputText.value = "";

  if (textareaRef.value) {
    textareaRef.value.style.height = "auto";
  }
};

const handleEnter = (event: KeyboardEvent) => {
  if (event.shiftKey) {
    return;
  }

  sendMessage();
};

const autoResize = () => {
  const textarea = textareaRef.value;
  if (!textarea) {
    return;
  }

  textarea.style.height = "auto";
  textarea.style.height = `${Math.min(textarea.scrollHeight, 180)}px`;
};

const triggerFileInput = () => {
  fileInputRef.value?.click();
};

const handlePaste = async (event: ClipboardEvent) => {
  const items = Array.from(event.clipboardData?.items ?? []);
  const imageItem = items.find((item) => item.type.startsWith("image/"));

  if (!imageItem) {
    return;
  }

  event.preventDefault();
  const file = imageItem.getAsFile();
  if (file) {
    await processImageFile(file);
  }
};

const appendRecognizedText = (recognizedText: string) => {
  const formattedText = `【图片识别内容】\n${recognizedText}`;
  inputText.value = inputText.value.trim()
    ? `${inputText.value}\n\n${formattedText}`
    : formattedText;
  autoResize();
  textareaRef.value?.focus();
};

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    return error.message;
  }

  return "图片识别失败，请重试";
};

const processImageFile = async (file: File) => {
  const validation = validateImageFile(file);
  if (!validation.valid) {
    alert(validation.error);
    return;
  }

  try {
    isOcrProcessing.value = true;
    ocrProgress.value = 0;

    const recognizedText = await recognizeImage(file, (progress) => {
      ocrProgress.value = Math.round(progress);
    });

    if (recognizedText) {
      appendRecognizedText(recognizedText);
    }
  } catch (error: unknown) {
    alert(getErrorMessage(error));
  } finally {
    isOcrProcessing.value = false;
    ocrProgress.value = 0;
  }
};

const processDocumentFile = async (file: File) => {
  try {
    isDocumentProcessing.value = true;
    const document = await readDocumentFile(file);
    emit("attachDocument", document);

    if (!inputText.value.trim()) {
      inputText.value = `请基于上传的文件「${document.name}」进行分析。`;
      autoResize();
    }
  } catch (error: unknown) {
    alert(getErrorMessage(error));
  } finally {
    isDocumentProcessing.value = false;
  }
};

const handleFileUpload = async (event: Event) => {
  const target = event.target;
  if (!(target instanceof HTMLInputElement)) {
    return;
  }

  const file = target.files?.[0];
  if (!file) {
    return;
  }

  if (file.type.startsWith("image/")) {
    await processImageFile(file);
  } else {
    await processDocumentFile(file);
  }

  target.value = "";
};
</script>

<style scoped>
.chat-input-container {
  flex-shrink: 0;
  padding: 14px 20px 18px;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0),
    #ffffff 28%,
    #ffffff 100%
  );
}

.composer {
  width: min(820px, 100%);
  margin: 0 auto;
}

.input-wrapper {
  display: flex;
  align-items: flex-end;
  gap: 6px;
  min-height: 54px;
  padding: 7px;
  background: #ffffff;
  border: 1px solid var(--border-medium);
  border-radius: 28px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}

.input-wrapper:focus-within {
  border-color: #bdbdbd;
  box-shadow: 0 10px 34px rgba(0, 0, 0, 0.1);
}

.message-textarea {
  flex: 1;
  min-height: 38px;
  max-height: 180px;
  padding: 9px 6px;
  border: none;
  resize: none;
  overflow-y: auto;
  background: transparent;
  color: var(--text-primary);
  font-size: 15px;
  line-height: 1.45;
}

.message-textarea::placeholder {
  color: var(--text-muted);
}

.message-textarea:focus {
  outline: none;
}

.upload-button,
.send-button {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 38px;
  height: 38px;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: background var(--transition-fast), color var(--transition-fast),
    transform var(--transition-fast);
}

.upload-button {
  background: transparent;
  color: var(--text-muted);
}

.upload-button:hover:not(:disabled) {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.send-button {
  background: var(--bg-muted);
  color: var(--text-muted);
}

.send-button.send-ready {
  background: #111111;
  color: #ffffff;
}

.send-button:hover:not(:disabled) {
  transform: translateY(-1px);
}

.send-button:disabled,
.upload-button:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

.file-input {
  display: none;
}

.ocr-status {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 8px 14px;
  padding: 7px 10px;
  border: 1px solid var(--border-light);
  border-radius: 999px;
  background: #ffffff;
  color: var(--text-secondary);
  box-shadow: var(--shadow-sm);
  font-size: 13px;
}

.ocr-status strong {
  color: var(--text-primary);
  font-variant-numeric: tabular-nums;
}

.loading-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid var(--border-light);
  border-top-color: var(--primary-color);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.input-hint {
  margin-top: 8px;
  text-align: center;
  font-size: 12px;
  color: var(--text-muted);
}

.message-textarea::-webkit-scrollbar {
  width: 6px;
}

.message-textarea::-webkit-scrollbar-thumb {
  background: #d9d9d9;
  border-radius: 999px;
}

@media (max-width: 768px) {
  .chat-input-container {
    padding: 12px 12px 14px;
  }

  .input-wrapper {
    border-radius: 22px;
  }

  .message-textarea {
    font-size: 16px;
  }

  .input-hint {
    display: none;
  }
}
</style>
