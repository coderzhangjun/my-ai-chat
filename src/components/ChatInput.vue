<template>
  <div class="chat-input-container">
    <div class="chat-input">
      <div class="input-wrapper">
        <textarea
          ref="textareaRef"
          v-model="inputText"
          placeholder="输入你的消息... (Ctrl+V 粘贴图片，支持大图自动压缩)"
          @keydown.enter.prevent="handleEnter"
          @input="autoResize"
          @focus="handleFocus"
          @blur="handleBlur"
          @paste="handlePaste"
          class="message-textarea"
          rows="1"
          :disabled="isOcrProcessing"
        ></textarea>
        <div class="input-actions">
          <!-- 图片上传按钮 -->
          <button
            @click="triggerFileInput"
            class="upload-button"
            :disabled="isOcrProcessing"
            title="上传图片识别文字"
          >
            <div class="upload-icon">
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
            </div>
          </button>

          <!-- 发送按钮 -->
          <button
            @click="sendMessage"
            class="send-button"
            :disabled="!inputText.trim() || isOcrProcessing"
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

      <!-- 隐藏的文件输入 -->
      <input
        ref="fileInputRef"
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp"
        @change="handleImageUpload"
        style="display: none"
      />

      <!-- OCR 识别中的加载遮罩 -->
      <div v-if="isOcrProcessing" class="ocr-loading-overlay">
        <div class="ocr-loading-content">
          <div class="loading-spinner"></div>
          <div class="loading-text">正在识别图片中的文字...</div>
          <div class="loading-progress">{{ ocrProgress }}%</div>
          <div class="loading-hint">通常需要 3-5 秒，请稍候</div>
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
import { recognizeImage, validateImageFile } from "../utils/ocr";

const inputText = ref("");
const textareaRef = ref<HTMLTextAreaElement | null>(null);
const fileInputRef = ref<HTMLInputElement | null>(null);
const isFocused = ref(false);

// OCR 相关状态
const isOcrProcessing = ref(false);
const ocrProgress = ref(0);

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

// 触发文件选择
const triggerFileInput = () => {
  console.log("[ChatInput] 触发文件选择");
  fileInputRef.value?.click();
};

// 处理粘贴事件（支持粘贴图片）
const handlePaste = async (event: ClipboardEvent) => {
  const items = event.clipboardData?.items;
  if (!items) return;

  // 查找图片项
  for (let i = 0; i < items.length; i++) {
    const item = items[i];

    // 如果是图片
    if (item.type.indexOf("image") !== -1) {
      console.log("[ChatInput] 检测到粘贴图片:", item.type);

      // 阻止默认粘贴行为
      event.preventDefault();

      // 获取图片文件
      const file = item.getAsFile();
      if (file) {
        console.log(
          "[ChatInput] 粘贴的图片文件:",
          file.name || "clipboard-image.png",
          "大小:",
          file.size
        );

        // 调用 OCR 识别处理
        await processImageFile(file);
      }
      break;
    }
  }
};

// 处理图片文件的 OCR 识别（统一处理函数）
const processImageFile = async (file: File) => {
  console.log("[ChatInput] 开始处理图片:", file.name);

  // 验证文件
  const validation = validateImageFile(file);
  if (!validation.valid) {
    console.error("[ChatInput] 文件验证失败:", validation.error);
    alert(validation.error);
    return;
  }

  console.log("[ChatInput] 文件验证通过，开始OCR识别");

  try {
    // 开始识别
    isOcrProcessing.value = true;
    ocrProgress.value = 0;

    // 调用OCR识别
    const recognizedText = await recognizeImage(file, (progress) => {
      ocrProgress.value = Math.round(progress);
      console.log("[ChatInput] OCR进度更新:", progress.toFixed(2) + "%");
    });

    console.log("[ChatInput] OCR识别成功！文本长度:", recognizedText.length);

    // 将识别的文本放入输入框，添加说明前缀
    if (recognizedText) {
      // 构造带说明的文本
      const formattedText = `【图片识别内容】\n${recognizedText}`;

      // 如果输入框已有内容，追加在后面；否则直接设置
      if (inputText.value.trim()) {
        inputText.value += "\n\n" + formattedText;
      } else {
        inputText.value = formattedText;
      }
      console.log("[ChatInput] 识别文本已插入输入框（带说明前缀）");

      // 自动调整文本框高度
      autoResize();

      // 让输入框获得焦点，方便用户继续编辑
      textareaRef.value?.focus();
    }
  } catch (error: any) {
    console.error("[ChatInput] OCR处理失败:", error);
    alert(error.message || "图片识别失败，请重试");
  } finally {
    // 清理状态
    isOcrProcessing.value = false;
    ocrProgress.value = 0;
    console.log("[ChatInput] OCR处理完成，状态已重置");
  }
};

// 处理图片上传（通过上传按钮）
const handleImageUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (!file) {
    console.log("[ChatInput] 未选择文件");
    return;
  }

  console.log("[ChatInput] 选择了文件:", file.name);

  // 调用统一的处理函数
  await processImageFile(file);

  // 清空文件输入，允许重复上传同一文件
  target.value = "";
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
  display: flex;
  gap: 8px;
  padding: 4px;
}

/* 上传按钮样式 */
.upload-button {
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
  color: #718096;
  position: relative;
  overflow: hidden;
}

.upload-button:hover:not(:disabled) {
  background: #cbd5e0;
  color: #4a5568;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.upload-button:active:not(:disabled) {
  transform: translateY(0);
}

.upload-button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.upload-icon {
  position: relative;
  z-index: 1;
  transition: transform 0.2s ease;
}

.upload-button:hover:not(:disabled) .upload-icon {
  transform: scale(1.1);
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

/* OCR 加载遮罩层 */
.ocr-loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.ocr-loading-content {
  background: white;
  padding: 40px 50px;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #e2e8f0;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  font-size: 16px;
  font-weight: 600;
  color: #2d3748;
  text-align: center;
}

.loading-progress {
  font-size: 24px;
  font-weight: 700;
  color: #667eea;
  font-variant-numeric: tabular-nums;
  min-width: 60px;
  text-align: center;
}

.loading-hint {
  font-size: 13px;
  color: #718096;
  text-align: center;
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

  .send-button,
  .upload-button {
    width: 40px;
    height: 40px;
  }

  .hint-text {
    font-size: 11px;
  }

  .ocr-loading-content {
    padding: 30px 40px;
    margin: 20px;
    max-width: calc(100vw - 40px);
  }

  .loading-text {
    font-size: 15px;
  }

  .loading-progress {
    font-size: 20px;
  }

  .loading-hint {
    font-size: 12px;
  }
}
</style>
