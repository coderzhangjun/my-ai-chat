<template>
  <button class="fullscreen-btn" @click="toggleFullScreen" :title="isFullScreen ? '退出全屏' : '全屏'">
    <svg v-if="isFullScreen" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"></path>
    </svg>
    <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
    </svg>
  </button>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

// 定义组件属性
const props = defineProps({
  // 要全屏显示的元素ID，如果不提供则全屏整个文档
  targetElementId: {
    type: String,
    default: ''
  }
});

// 全屏状态
const isFullScreen = ref(false);

// 获取目标元素
const getTargetElement = (): Element => {
  if (props.targetElementId) {
    const element = document.getElementById(props.targetElementId);
    if (element) return element;
  }
  return document.documentElement;
};

// 检查当前是否处于全屏状态
const checkFullScreen = () => {
  isFullScreen.value = !!(
    document.fullscreenElement ||
    (document as any).webkitFullscreenElement ||
    (document as any).mozFullScreenElement ||
    (document as any).msFullscreenElement
  );
};

// 切换全屏状态
const toggleFullScreen = async () => {
  if (!isFullScreen.value) {
    try {
      const element = getTargetElement();
      if (element.requestFullscreen) {
        await element.requestFullscreen();
      } else if ((element as any).webkitRequestFullScreen) {
        await (element as any).webkitRequestFullScreen();
      } else if ((element as any).mozRequestFullScreen) {
        await (element as any).mozRequestFullScreen();
      } else if ((element as any).msRequestFullscreen) {
        await (element as any).msRequestFullscreen();
      }
    } catch (error) {
      console.error('全屏请求失败:', error);
    }
  } else {
    try {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        await (document as any).webkitExitFullscreen();
      } else if ((document as any).mozCancelFullScreen) {
        await (document as any).mozCancelFullScreen();
      } else if ((document as any).msExitFullscreen) {
        await (document as any).msExitFullscreen();
      }
    } catch (error) {
      console.error('退出全屏失败:', error);
    }
  }
};

// 监听全屏状态变化
onMounted(() => {
  document.addEventListener('fullscreenchange', checkFullScreen);
  document.addEventListener('webkitfullscreenchange', checkFullScreen);
  document.addEventListener('mozfullscreenchange', checkFullScreen);
  document.addEventListener('MSFullscreenChange', checkFullScreen);
});

onUnmounted(() => {
  document.removeEventListener('fullscreenchange', checkFullScreen);
  document.removeEventListener('webkitfullscreenchange', checkFullScreen);
  document.removeEventListener('mozfullscreenchange', checkFullScreen);
  document.removeEventListener('MSFullscreenChange', checkFullScreen);
});
</script>

<style scoped>
.fullscreen-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  cursor: pointer;
  color: var(--text-color, #666);
  border-radius: var(--radius-sm, 4px);
  transition: all 0.2s;
}

.fullscreen-btn:hover {
  background-color: var(--bg-hover, rgba(0, 0, 0, 0.05));
  color: var(--primary-color, #1890ff);
}
</style>