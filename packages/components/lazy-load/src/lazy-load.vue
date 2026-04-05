<template>
  <div
    ref="containerRef"
    class="dot-lazy-load"
    :class="[containerClass]"
    :style="containerStyle"
  >
    <!-- 加载中占位 -->
    <div
      v-if="state === 'loading'"
      class="dot-lazy-load__placeholder"
    >
      <slot name="placeholder">
        <img
          v-if="placeholder"
          :src="placeholder"
          :alt="alt"
          class="dot-lazy-load__img"
        />
        <div v-else class="dot-lazy-load__spinner">
          <span class="dot-lazy-load__dot"></span>
          <span class="dot-lazy-load__dot"></span>
          <span class="dot-lazy-load__dot"></span>
        </div>
      </slot>
    </div>

    <!-- 加载失败 -->
    <div
      v-else-if="state === 'error'"
      class="dot-lazy-load__error"
    >
      <slot name="error">
        <img
          v-if="error"
          :src="error"
          :alt="alt"
          class="dot-lazy-load__img"
        />
        <div v-else class="dot-lazy-load__error-text">
          加载失败
        </div>
      </slot>
    </div>

    <!-- 真实图片 -->
    <img
      v-show="state === 'loaded'"
      ref="imgRef"
      :src="currentSrc"
      :alt="alt"
      class="dot-lazy-load__img"
      :class="{ 'dot-lazy-load__img--fade': isFading }"
      :style="mergedImgStyle"
      @load="onImageLoad"
      @error="onImageError"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { lazyLoadProps, type LoadState } from "./lazy-load";

defineOptions({
  name: "DotLazyLoad",
});

const props = defineProps(lazyLoadProps);
const emit = defineEmits(["load", "error", "enter"]);

// DOM引用
const containerRef = ref<HTMLDivElement>();
const imgRef = ref<HTMLImageElement>();

// 状态管理
const state = ref<LoadState>("loading");
const currentSrc = ref("");
const isFading = ref(false);

// 是否已进入可视区
let hasEnteredViewport = false;
// IntersectionObserver 实例
let observer: IntersectionObserver | null = null;

// 容器样式
const containerStyle = computed(() => ({
  position: "relative" as const,
  width: "100%",
  height: "100%",
}));

// 合并图片样式
const mergedImgStyle = computed(() => ({
  width: "100%",
  height: "100%",
  objectFit: "cover" as const,
  opacity: isFading.value ? 0 : 1,
  transition: `opacity ${props.duration}ms ease-in-out`,
  ...props.imgStyle,
}));

// 预加载图片
const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => reject();
    img.src = src;
  });
};

// 加载真实图片
const loadRealImage = async () => {
  if (state.value === "loaded") return;

  const src = props.src;
  if (!src) return;

  try {
    await preloadImage(src);
    currentSrc.value = src;
    state.value = "loaded";
    isFading.value = true;

    // 触发淡入动画
    requestAnimationFrame(() => {
      setTimeout(() => {
        isFading.value = false;
      }, 50);
    });

    emit("load", src);
  } catch {
    state.value = "error";
    emit("error", src);
  }
};

// 图片加载回调（兜底）
const onImageLoad = () => {
  if (state.value !== "loaded") {
    state.value = "loaded";
    emit("load", props.src);
  }
};

// 图片错误回调
const onImageError = () => {
  if (state.value !== "error") {
    state.value = "error";
    emit("error", props.src);
  }
};

// 初始化 IntersectionObserver
const initObserver = () => {
  if (!containerRef.value) return;

  // 如果启用原生懒加载
  if (props.native && "loading" in HTMLImageElement.prototype) {
    currentSrc.value = props.src ?? "";
    // 使用浏览器原生懒加载
    if (imgRef.value) {
      imgRef.value.loading = "lazy";
    }
    return;
  }

  // 使用 IntersectionObserver
  const options: IntersectionObserverInit = {
    root: null,
    rootMargin: props.rootMargin,
    threshold: props.threshold,
  };

  observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && !hasEnteredViewport) {
        hasEnteredViewport = true;
        emit("enter");
        loadRealImage();
        // 进入后停止观察（一次性懒加载）
        observer?.disconnect();
      }
    });
  }, options);

  observer.observe(containerRef.value);
};

// 监听 src 变化
watch(
  () => props.src,
  (newSrc, oldSrc) => {
    if (newSrc !== oldSrc && hasEnteredViewport) {
      // 如果已经加载过，需要重新加载新图片
      state.value = "loading";
      currentSrc.value = "";
      loadRealImage();
    }
  }
);

onMounted(() => {
  initObserver();
});

onUnmounted(() => {
  observer?.disconnect();
  observer = null;
});

// 暴露方法
defineExpose({
  // 手动触发加载
  load: loadRealImage,
  // 获取当前状态
  getState: () => state.value,
  // 重试加载
  retry: () => {
    state.value = "loading";
    loadRealImage();
  },
});
</script>

<style scoped>
.dot-lazy-load {
  overflow: hidden;
}

.dot-lazy-load__placeholder,
.dot-lazy-load__error {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
}

.dot-lazy-load__spinner {
  display: flex;
  gap: 6px;
  align-items: center;
}

.dot-lazy-load__dot {
  width: 8px;
  height: 8px;
  background: #ccc;
  border-radius: 50%;
  animation: dot-bounce 1.4s ease-in-out infinite both;
}

.dot-lazy-load__dot:nth-child(1) {
  animation-delay: -0.32s;
}

.dot-lazy-load__dot:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes dot-bounce {
  0%,
  80%,
  100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

.dot-lazy-load__error-text {
  color: #999;
  font-size: 14px;
}

.dot-lazy-load__img {
  display: block;
}

.dot-lazy-load__img--fade {
  opacity: 0;
}
</style>
