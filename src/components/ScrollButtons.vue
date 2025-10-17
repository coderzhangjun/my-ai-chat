<template>
  <div>
    <!-- 回到顶部按钮 -->
    <Teleport to="body">
      <div
        v-show="showScrollToTop"
        class="scroll-button scroll-to-top"
        :style="{
          left: topButtonPosition.x + 'px',
          top: topButtonPosition.y + 'px',
        }"
        @mousedown="startDrag($event, 'top')"
        @touchstart="startDrag($event, 'top')"
        @click="scrollToTop"
        title="回到顶部"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <polyline points="18 15 12 9 6 15"></polyline>
        </svg>
      </div>
    </Teleport>

    <!-- 回到底部按钮 -->
    <Teleport to="body">
      <div
        v-show="showScrollToBottom"
        class="scroll-button scroll-to-bottom"
        :style="{
          left: bottomButtonPosition.x + 'px',
          top: bottomButtonPosition.y + 'px',
        }"
        @mousedown="startDrag($event, 'bottom')"
        @touchstart="startDrag($event, 'bottom')"
        @click="scrollToBottom"
        title="回到底部"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch, Ref } from "vue";

const props = defineProps<{
  targetElement: Ref<HTMLElement | null> | HTMLElement | null;
}>();

// 获取实际的 DOM 元素
const getElement = (): HTMLElement | null => {
  if (!props.targetElement) return null;
  // 如果是 Ref，获取其 value
  if ("value" in props.targetElement) {
    return props.targetElement.value;
  }
  // 否则直接返回
  return props.targetElement as HTMLElement;
};

// 滚动状态
const scrollTop = ref(0);
const scrollHeight = ref(0);
const clientHeight = ref(0);

// 按钮显示状态
const showScrollToTop = computed(() => scrollTop.value > 200);
const showScrollToBottom = computed(
  () => scrollTop.value < scrollHeight.value - clientHeight.value - 200
);

// 计算默认位置的函数
const getDefaultPosition = (button: "top" | "bottom") => {
  const savedX = localStorage.getItem(
    `scroll${button === "top" ? "Top" : "Bottom"}ButtonX`
  );
  const savedY = localStorage.getItem(
    `scroll${button === "top" ? "Top" : "Bottom"}ButtonY`
  );

  console.log(`🔍 [ScrollButtons] ${button} 按钮保存的位置:`, {
    savedX,
    savedY,
  });

  // 如果有保存的位置，使用保存的位置
  if (savedX && savedY && parseInt(savedX) > 0 && parseInt(savedY) > 0) {
    const x = parseInt(savedX);
    const y = parseInt(savedY);
    console.log(`✅ [ScrollButtons] ${button} 使用保存的位置:`, { x, y });
    return { x, y };
  }

  // 否则使用默认位置（右侧，距离边缘合适的位置）
  const defaultX = Math.max(window.innerWidth - 100, 50); // 距离右边缘 100px，最小 50px
  const defaultY =
    button === "top" ? 120 : Math.max(window.innerHeight - 200, 150);

  console.log(`🆕 [ScrollButtons] ${button} 使用默认位置:`, {
    x: defaultX,
    y: defaultY,
  });

  return { x: defaultX, y: defaultY };
};

// 按钮位置
const topButtonPosition = ref(getDefaultPosition("top"));
const bottomButtonPosition = ref(getDefaultPosition("bottom"));

// 拖动状态
const isDragging = ref(false);
const dragButton = ref<"top" | "bottom" | null>(null);
const dragOffset = ref({ x: 0, y: 0 });
const dragStartTime = ref(0);
const dragMoved = ref(false);
const lastClickTime = ref(0);

// 更新滚动信息
const updateScrollInfo = () => {
  const element = getElement();
  if (element) {
    scrollTop.value = element.scrollTop;
    scrollHeight.value = element.scrollHeight;
    clientHeight.value = element.clientHeight;

    console.log("📊 [ScrollButtons] 滚动信息更新:", {
      scrollTop: scrollTop.value,
      scrollHeight: scrollHeight.value,
      clientHeight: clientHeight.value,
      showScrollToTop: showScrollToTop.value,
      showScrollToBottom: showScrollToBottom.value,
      distanceToBottom:
        scrollHeight.value - clientHeight.value - scrollTop.value,
    });
  } else {
    console.warn("⚠️ [ScrollButtons] targetElement 为空");
  }
};

// 重置按钮位置
const resetPosition = (button: "top" | "bottom") => {
  console.log(`🔄 [ScrollButtons] 重置 ${button} 按钮位置`);

  // 清除保存的位置
  localStorage.removeItem(
    `scroll${button === "top" ? "Top" : "Bottom"}ButtonX`
  );
  localStorage.removeItem(
    `scroll${button === "top" ? "Top" : "Bottom"}ButtonY`
  );

  // 重新计算默认位置
  const newPosition = getDefaultPosition(button);

  if (button === "top") {
    topButtonPosition.value = newPosition;
  } else {
    bottomButtonPosition.value = newPosition;
  }

  console.log(`✅ [ScrollButtons] ${button} 按钮位置已重置到:`, newPosition);
};

// 滚动到顶部
const scrollToTop = () => {
  const now = Date.now();

  // 检测双击
  if (now - lastClickTime.value < 300) {
    console.log("👆 [ScrollButtons] 检测到双击，重置顶部按钮位置");
    resetPosition("top");
    lastClickTime.value = 0;
    return;
  }

  lastClickTime.value = now;

  // 如果刚拖动过，不触发滚动
  if (dragMoved.value) {
    dragMoved.value = false;
    return;
  }

  const element = getElement();
  if (element) {
    console.log("⬆️ [ScrollButtons] 滚动到顶部");
    element.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }
};

// 滚动到底部
const scrollToBottom = () => {
  const now = Date.now();

  // 检测双击
  if (now - lastClickTime.value < 300) {
    console.log("👆 [ScrollButtons] 检测到双击，重置底部按钮位置");
    resetPosition("bottom");
    lastClickTime.value = 0;
    return;
  }

  lastClickTime.value = now;

  // 如果刚拖动过，不触发滚动
  if (dragMoved.value) {
    dragMoved.value = false;
    return;
  }

  const element = getElement();
  if (element) {
    console.log("⬇️ [ScrollButtons] 滚动到底部");
    element.scrollTo({
      top: element.scrollHeight,
      behavior: "smooth",
    });
  }
};

// 开始拖动
const startDrag = (
  event: MouseEvent | TouchEvent,
  button: "top" | "bottom"
) => {
  isDragging.value = true;
  dragButton.value = button;
  dragStartTime.value = Date.now();
  dragMoved.value = false;

  const clientX =
    event instanceof MouseEvent ? event.clientX : event.touches[0].clientX;
  const clientY =
    event instanceof MouseEvent ? event.clientY : event.touches[0].clientY;

  const position =
    button === "top" ? topButtonPosition.value : bottomButtonPosition.value;

  dragOffset.value = {
    x: clientX - position.x,
    y: clientY - position.y,
  };

  event.preventDefault();
};

// 拖动中
const onDrag = (event: MouseEvent | TouchEvent) => {
  if (!isDragging.value || !dragButton.value) return;

  const clientX =
    event instanceof MouseEvent ? event.clientX : event.touches[0].clientX;
  const clientY =
    event instanceof MouseEvent ? event.clientY : event.touches[0].clientY;

  const newX = clientX - dragOffset.value.x;
  const newY = clientY - dragOffset.value.y;

  // 边界检查
  const maxX = window.innerWidth - 50;
  const maxY = window.innerHeight - 50;

  const boundedX = Math.max(10, Math.min(newX, maxX));
  const boundedY = Math.max(10, Math.min(newY, maxY));

  // 判断是否真的移动了
  const position =
    dragButton.value === "top"
      ? topButtonPosition.value
      : bottomButtonPosition.value;
  if (
    Math.abs(boundedX - position.x) > 5 ||
    Math.abs(boundedY - position.y) > 5
  ) {
    dragMoved.value = true;
  }

  if (dragButton.value === "top") {
    topButtonPosition.value = { x: boundedX, y: boundedY };
  } else {
    bottomButtonPosition.value = { x: boundedX, y: boundedY };
  }

  event.preventDefault();
};

// 结束拖动
const stopDrag = () => {
  if (!isDragging.value) return;

  // 保存位置到 localStorage
  if (dragButton.value === "top") {
    localStorage.setItem(
      "scrollTopButtonX",
      topButtonPosition.value.x.toString()
    );
    localStorage.setItem(
      "scrollTopButtonY",
      topButtonPosition.value.y.toString()
    );
  } else if (dragButton.value === "bottom") {
    localStorage.setItem(
      "scrollBottomButtonX",
      bottomButtonPosition.value.x.toString()
    );
    localStorage.setItem(
      "scrollBottomButtonY",
      bottomButtonPosition.value.y.toString()
    );
  }

  isDragging.value = false;
  dragButton.value = null;
};

// 监听窗口大小变化，调整按钮位置
const handleResize = () => {
  const maxX = window.innerWidth - 50;
  const maxY = window.innerHeight - 50;

  topButtonPosition.value.x = Math.min(topButtonPosition.value.x, maxX);
  topButtonPosition.value.y = Math.min(topButtonPosition.value.y, maxY);

  bottomButtonPosition.value.x = Math.min(bottomButtonPosition.value.x, maxX);
  bottomButtonPosition.value.y = Math.min(bottomButtonPosition.value.y, maxY);
};

// 设置滚动监听器
const setupScrollListener = () => {
  const element = getElement();
  console.log("🔧 [ScrollButtons] 设置滚动监听器");
  console.log("🎯 [ScrollButtons] element:", element);

  if (element) {
    console.log("✅ [ScrollButtons] 目标元素存在，添加滚动监听");
    element.addEventListener("scroll", updateScrollInfo);
    updateScrollInfo();
  } else {
    console.error("❌ [ScrollButtons] 目标元素不存在！");
  }
};

// 移除滚动监听器
const removeScrollListener = () => {
  const element = getElement();
  if (element) {
    element.removeEventListener("scroll", updateScrollInfo);
  }
};

onMounted(() => {
  console.log("🔧 [ScrollButtons] 组件已挂载");
  console.log("🎯 [ScrollButtons] props.targetElement:", props.targetElement);
  console.log(
    "🔍 [ScrollButtons] props.targetElement 类型:",
    typeof props.targetElement
  );
  console.log(
    "🔍 [ScrollButtons] 是否是 Ref?",
    props.targetElement && "value" in props.targetElement
  );
  if (props.targetElement && "value" in props.targetElement) {
    console.log(
      "🔍 [ScrollButtons] Ref.value:",
      (props.targetElement as Ref<HTMLElement | null>).value
    );
  }
  console.log("📍 [ScrollButtons] 按钮初始位置:", {
    top: topButtonPosition.value,
    bottom: bottomButtonPosition.value,
  });
  console.log("📐 [ScrollButtons] 窗口尺寸:", {
    width: window.innerWidth,
    height: window.innerHeight,
  });

  // 尝试初始设置（可能为 null）
  setupScrollListener();

  // 全局拖动监听
  document.addEventListener("mousemove", onDrag);
  document.addEventListener("mouseup", stopDrag);
  document.addEventListener("touchmove", onDrag, { passive: false });
  document.addEventListener("touchend", stopDrag);

  // 窗口大小监听
  window.addEventListener("resize", handleResize);

  // 监听 targetElement 的变化
  // 注意：必须监听整个 props.targetElement，而不仅仅是它的 value
  watch(
    () => props.targetElement,
    (newTarget, oldTarget) => {
      console.log("🔄 [ScrollButtons] targetElement prop 变化:", {
        oldTarget,
        newTarget,
      });
      // 移除旧的监听器
      removeScrollListener();
      // 设置新的监听器
      if (newTarget) {
        setupScrollListener();
      }
    },
    { immediate: false }
  );

  // 同时监听 targetElement.value 的变化（如果是 Ref）
  if (props.targetElement && "value" in props.targetElement) {
    console.log("👀 [ScrollButtons] 设置 Ref.value 监听器");
    watch(
      () => (props.targetElement as Ref<HTMLElement | null>).value,
      (newValue, oldValue) => {
        console.log("🔄 [ScrollButtons] Ref.value 变化:", {
          oldValue,
          newValue,
        });
        if (oldValue) {
          removeScrollListener();
        }
        if (newValue) {
          setupScrollListener();
        }
      },
      { immediate: true } // 立即执行一次
    );
  }
});

onUnmounted(() => {
  console.log("🔚 [ScrollButtons] 组件卸载");
  removeScrollListener();

  document.removeEventListener("mousemove", onDrag);
  document.removeEventListener("mouseup", stopDrag);
  document.removeEventListener("touchmove", onDrag);
  document.removeEventListener("touchend", stopDrag);

  window.removeEventListener("resize", handleResize);
});
</script>

<style scoped>
.scroll-button {
  position: fixed;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: move;
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.5);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 99999; /* 确保在最顶层 */
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  border: 2px solid rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(4px);
}

.scroll-button:hover {
  transform: scale(1.15);
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.7);
  border-color: rgba(255, 255, 255, 0.5);
}

.scroll-button:active {
  transform: scale(0.9);
}

.scroll-to-bottom {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  box-shadow: 0 6px 16px rgba(79, 172, 254, 0.5);
}

.scroll-to-bottom:hover {
  box-shadow: 0 8px 24px rgba(79, 172, 254, 0.7);
}

/* 移动端优化 */
@media (max-width: 768px) {
  .scroll-button {
    width: 40px;
    height: 40px;
  }
}

/* 防止按钮在拖动时被选中 */
.scroll-button * {
  pointer-events: none;
}
</style>
