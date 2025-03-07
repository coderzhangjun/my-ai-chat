<template>
  <div class="chat-input">
    <!-- 双向绑定输入框内容，回车或点击按钮发送消息 -->
    <input
      v-model="inputText"
      @keyup.enter="onSend"
      type="text"
      placeholder="请输入消息..."
    />
    <button @click="onSend">发送</button>
  </div>
</template>

<script setup lang="ts">
import { ref, defineEmits } from "vue";

// 定义输入内容的响应式变量
const inputText = ref("");

// 定义组件向父组件传递消息的事件
const emit = defineEmits<{
  (e: "sendMessage", text: string): void;
}>();

/**
 * 发送消息：
 * 1. 检查输入不为空
 * 2. 触发 sendMessage 事件传递输入内容
 * 3. 清空输入框
 */
const onSend = () => {
  if (inputText.value.trim() === "") return;
  emit("sendMessage", inputText.value);
  inputText.value = "";
};
</script>

<style scoped>
.chat-input {
  display: flex;
  padding: 0.5rem;
  border-top: 1px solid #ccc;
}

.chat-input input {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.chat-input button {
  margin-left: 0.5rem;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  background-color: #0084ff;
  color: white;
  cursor: pointer;
}
</style>
