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
import { ref, onMounted, onUnmounted } from "vue";

interface VendorFullscreenDocument extends Document {
  webkitFullscreenElement?: Element | null;
  mozFullScreenElement?: Element | null;
  msFullscreenElement?: Element | null;
  webkitExitFullscreen?: () => Promise<void>;
  mozCancelFullScreen?: () => Promise<void>;
  msExitFullscreen?: () => Promise<void>;
}

interface VendorFullscreenElement extends Element {
  webkitRequestFullScreen?: () => Promise<void>;
  mozRequestFullScreen?: () => Promise<void>;
  msRequestFullscreen?: () => Promise<void>;
}

const props = defineProps({
  targetElementId: {
    type: String,
    default: "",
  },
});

const isFullScreen = ref(false);

const getTargetElement = (): Element => {
  if (props.targetElementId) {
    const element = document.getElementById(props.targetElementId);
    if (element) return element;
  }
  return document.documentElement;
};

const checkFullScreen = () => {
  const vendorDocument = document as VendorFullscreenDocument;
  isFullScreen.value = !!(
    document.fullscreenElement ||
    vendorDocument.webkitFullscreenElement ||
    vendorDocument.mozFullScreenElement ||
    vendorDocument.msFullscreenElement
  );
};

const toggleFullScreen = async () => {
  if (!isFullScreen.value) {
    try {
      const element = getTargetElement() as VendorFullscreenElement;
      if (element.requestFullscreen) {
        await element.requestFullscreen();
      } else if (element.webkitRequestFullScreen) {
        await element.webkitRequestFullScreen();
      } else if (element.mozRequestFullScreen) {
        await element.mozRequestFullScreen();
      } else if (element.msRequestFullscreen) {
        await element.msRequestFullscreen();
      }
    } catch (error) {
      console.error("全屏请求失败:", error);
    }
  } else {
    try {
      const vendorDocument = document as VendorFullscreenDocument;
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if (vendorDocument.webkitExitFullscreen) {
        await vendorDocument.webkitExitFullscreen();
      } else if (vendorDocument.mozCancelFullScreen) {
        await vendorDocument.mozCancelFullScreen();
      } else if (vendorDocument.msExitFullscreen) {
        await vendorDocument.msExitFullscreen();
      }
    } catch (error) {
      console.error("退出全屏失败:", error);
    }
  }
};

onMounted(() => {
  document.addEventListener("fullscreenchange", checkFullScreen);
  document.addEventListener("webkitfullscreenchange", checkFullScreen);
  document.addEventListener("mozfullscreenchange", checkFullScreen);
  document.addEventListener("MSFullscreenChange", checkFullScreen);
});

onUnmounted(() => {
  document.removeEventListener("fullscreenchange", checkFullScreen);
  document.removeEventListener("webkitfullscreenchange", checkFullScreen);
  document.removeEventListener("mozfullscreenchange", checkFullScreen);
  document.removeEventListener("MSFullscreenChange", checkFullScreen);
});
</script>

<style scoped>
.fullscreen-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border: 1px solid transparent;
  background: transparent;
  cursor: pointer;
  color: var(--text-secondary, #5d5d5d);
  border-radius: var(--radius-md, 10px);
  transition: background var(--transition-fast, 0.16s ease),
    color var(--transition-fast, 0.16s ease);
}

.fullscreen-btn:hover {
  background-color: var(--bg-hover, #ececec);
  color: var(--text-primary, #0d0d0d);
}
</style>