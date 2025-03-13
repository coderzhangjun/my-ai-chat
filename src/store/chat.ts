import { defineStore } from 'pinia';
import { ref, watch } from 'vue';
import type { Message } from '../types/message';
import { sendToDeepseekAPI } from '../api/deepseek';

export const useChatStore = defineStore('chat', () => {
  // 从 localStorage 加载消息，如果没有则使用空数组
  const messages = ref<Message[]>(
    JSON.parse(localStorage.getItem('chatMessages') || '[]')
  );

  // 监听消息变化，保存到 localStorage
  watch(
    messages,
    (newMessages) => {
      localStorage.setItem('chatMessages', JSON.stringify(newMessages));
    },
    { deep: true }
  );

  // 发送消息到 AI
  const sendMessageToAI = async (text: string) => {
    // 添加用户消息
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };
    messages.value.push(userMessage);

    // 添加 AI 消息占位
    const aiMessageId = (Date.now() + 1).toString();
    const aiMessage: Message = {
      id: aiMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
      loading: true,
    };
    messages.value.push(aiMessage);

    try {
      // 调用 API 获取 AI 响应
      let responseContent = '';
      
      await sendToDeepseekAPI(text, (chunk: string) => {
        try {
          // 尝试解析 JSON 响应
          const jsonData = JSON.parse(chunk);
          
          // 检查是否有有效的内容字段
          if (jsonData.choices && jsonData.choices.content) {
            responseContent += jsonData.choices.content;
          } else if (jsonData.data && jsonData.data.choices && jsonData.data.choices.content) {
            responseContent += jsonData.data.choices.content;
          } else if (jsonData.content) {
            responseContent += jsonData.content;
          } else {
            // 如果没有找到预期的内容字段，尝试其他可能的字段
            const possibleContentFields = ['content', 'text', 'message', 'response'];
            for (const field of possibleContentFields) {
              if (jsonData[field] && typeof jsonData[field] === 'string') {
                responseContent += jsonData[field];
                break;
              }
            }
          }
        } catch (e) {
          // 如果不是 JSON 格式，直接添加文本内容
          // 过滤掉可能的 JSON 字符串前缀
          const cleanedChunk = chunk.replace(/^data:\s*/, '').trim();
          if (cleanedChunk && cleanedChunk !== '[DONE]') {
            responseContent += cleanedChunk;
          }
        }
        
        // 更新 AI 消息内容
        const index = messages.value.findIndex(msg => msg.id === aiMessageId);
        if (index !== -1) {
          messages.value[index].content = responseContent;
        }
      });
      
      // 完成后移除 loading 状态
      const index = messages.value.findIndex(msg => msg.id === aiMessageId);
      if (index !== -1) {
        messages.value[index].loading = false;
      }
    } catch (error) {
      console.error('Error sending message to AI:', error);
      // 处理错误，更新 AI 消息为错误状态
      const index = messages.value.findIndex(msg => msg.id === aiMessageId);
      if (index !== -1) {
        messages.value[index].content = '抱歉，发生了错误，请稍后再试。';
        messages.value[index].loading = false;
        messages.value[index].error = true;
      }
    }
  };

  // 清空聊天记录
  const clearMessages = () => {
    messages.value = [];
  };

  // 添加刷新按钮功能
  const refreshChat = () => {
    // 清空当前聊天记录并从 localStorage 重新加载
    messages.value = JSON.parse(localStorage.getItem('chatMessages') || '[]');
  };

  return {
    messages,
    sendMessageToAI,
    clearMessages,
    refreshChat,
  };
});
