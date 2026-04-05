<template>
  <div
    class="dot-tabs"
    :class="[
      `dot-tabs--${type}`,
      `dot-tabs--${position}`,
    ]"
  >
    <!-- 标签导航区 -->
    <div class="dot-tabs__nav">
      <div class="dot-tabs__nav-wrap">
        <div
          v-for="item in items"
          :key="item.key"
          class="dot-tabs__item"
          :class="{
            'dot-tabs__item--active': activeKey === item.key,
            'dot-tabs__item--disabled': item.disabled,
          }"
          @click="handleTabClick(item)"
        >
          <span class="dot-tabs__label">{{ item.label }}</span>
          <!-- 关闭按钮 -->
          <span
            v-if="closable || item.closable"
            class="dot-tabs__close"
            @click.stop="handleTabClose(item)"
          >
            ×
          </span>
        </div>
        <!-- 新增按钮 -->
        <div
          v-if="addable"
          class="dot-tabs__add"
          @click="handleAdd"
        >
          +
        </div>
      </div>
      <!-- 底部指示条（仅 line 类型） -->
      <div
        v-if="type === 'line'"
        class="dot-tabs__bar"
        :style="barStyle"
      />
    </div>

    <!-- 内容面板区 -->
    <div class="dot-tabs__content">
      <div
        v-for="item in items"
        :key="item.key"
        v-show="activeKey === item.key"
        class="dot-tabs__pane"
        :class="{
          'dot-tabs__pane--active': activeKey === item.key,
        }"
      >
        <!-- 延迟渲染：首次激活后才真正渲染内容 -->
        <template v-if="!lazy || renderedKeys.has(item.key)">
          <slot
            :name="item.key"
            :item="item"
            :isActive="activeKey === item.key"
          >
            <!-- 默认插槽内容 -->
            <slot :item="item" :isActive="activeKey === item.key" />
          </slot>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from "vue";
import { tabsProps, type TabItem } from "./tabs";

defineOptions({
  name: "DotTabs",
});

const props = defineProps(tabsProps);
const emit = defineEmits([
  "update:modelValue",
  "change",
  "close",
  "add",
  "click",
]);

// 当前激活的 key
const activeKey = ref(props.modelValue || props.items?.[0]?.key || "");
// 已渲染过的 tab key 集合（用于延迟渲染）
const renderedKeys = ref(new Set<string>());
// 指示条样式
const barStyle = ref({ width: "0px", transform: "translateX(0px)" });

// 监听外部 modelValue 变化
watch(
  () => props.modelValue,
  (val) => {
    if (val && val !== activeKey.value) {
      switchTab(val);
    }
  }
);

// 监听激活 key 变化，更新渲染集合
watch(
  activeKey,
  (val) => {
    if (val) {
      renderedKeys.value.add(val);
    }
  },
  { immediate: true }
);

// 更新指示条位置
const updateBarStyle = async () => {
  if (props.type !== "line") return;

  await nextTick();
  const navEl = document.querySelector(".dot-tabs__nav-wrap");
  if (!navEl) return;

  const activeEl = navEl.querySelector(".dot-tabs__item--active") as HTMLElement;
  if (!activeEl) return;

  const navRect = navEl.getBoundingClientRect();
  const activeRect = activeEl.getBoundingClientRect();

  barStyle.value = {
    width: `${activeRect.width}px`,
    transform: `translateX(${activeRect.left - navRect.left}px)`,
  };
};

// 切换 tab
const switchTab = async (key: string) => {
  const oldKey = activeKey.value;
  if (key === oldKey) return;

  // 执行 beforeChange 钩子
  if (props.beforeChange) {
    try {
      const result = await props.beforeChange(key, oldKey);
      if (result === false) return;
    } catch {
      return;
    }
  }

  activeKey.value = key;
  emit("update:modelValue", key);
  emit("change", key, oldKey);

  // 更新指示条
  await updateBarStyle();
};

// Tab 点击处理
const handleTabClick = (item: TabItem) => {
  if (item.disabled) return;
  emit("click", item);
  switchTab(item.key);
};

// Tab 关闭处理
const handleTabClose = (item: TabItem) => {
  if (item.disabled) return;
  emit("close", item);
};

// 新增 tab
const handleAdd = () => {
  emit("add");
};

// 初始化时更新指示条
onMounted(() => {
  updateBarStyle();
});

// 监听 items 变化重新计算指示条
watch(() => props.items, updateBarStyle, { deep: true });

// 暴露方法
defineExpose({
  // 获取当前激活 key
  getActiveKey: () => activeKey.value,
  // 手动切换
  switchTo: switchTab,
  // 刷新指示条位置
  refreshBar: updateBarStyle,
  // 获取已渲染的 keys
  getRenderedKeys: () => Array.from(renderedKeys.value),
  // 强制渲染某个 tab（无视 lazy）
  forceRender: (key: string) => {
    renderedKeys.value.add(key);
  },
});
</script>

<style scoped>
.dot-tabs {
  width: 100%;
}

/* ===== 标签导航区 ===== */
.dot-tabs__nav {
  position: relative;
  margin-bottom: 16px;
}

.dot-tabs__nav-wrap {
  display: flex;
  align-items: center;
  gap: 4px;
}

.dot-tabs__item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  cursor: pointer;
  transition: all 0.3s;
  border: 1px solid transparent;
  user-select: none;
}

.dot-tabs__item:hover {
  color: #409eff;
}

.dot-tabs__item--disabled {
  color: #c0c4cc;
  cursor: not-allowed;
}

.dot-tabs__item--disabled:hover {
  color: #c0c4cc;
}

.dot-tabs__close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  font-size: 12px;
  transition: all 0.2s;
}

.dot-tabs__close:hover {
  background: #f56c6c;
  color: #fff;
}

.dot-tabs__add {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 1px dashed #dcdfe6;
  border-radius: 4px;
  cursor: pointer;
  font-size: 20px;
  color: #606266;
  transition: all 0.3s;
}

.dot-tabs__add:hover {
  border-color: #409eff;
  color: #409eff;
}

/* ===== line 类型 ===== */
.dot-tabs--line .dot-tabs__nav {
  border-bottom: 2px solid #e4e7ed;
}

.dot-tabs--line .dot-tabs__item--active {
  color: #409eff;
}

.dot-tabs__bar {
  position: absolute;
  bottom: 0;
  height: 2px;
  background: #409eff;
  transition: all 0.3s;
}

/* ===== card 类型 ===== */
.dot-tabs--card .dot-tabs__item {
  border: 1px solid #e4e7ed;
  border-bottom: none;
  border-radius: 4px 4px 0 0;
  background: #f5f7fa;
  margin-right: -1px;
}

.dot-tabs--card .dot-tabs__item--active {
  background: #fff;
  border-bottom: 1px solid #fff;
  color: #409eff;
  z-index: 1;
}

.dot-tabs--card .dot-tabs__content {
  border: 1px solid #e4e7ed;
  padding: 16px;
  margin-top: -17px;
  background: #fff;
}

/* ===== border-card 类型 ===== */
.dot-tabs--border-card {
  border: 1px solid #dcdfe6;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12);
}

.dot-tabs--border-card .dot-tabs__nav {
  background: #f5f7fa;
  border-bottom: 1px solid #e4e7ed;
  margin-bottom: 0;
  padding: 0 8px;
}

.dot-tabs--border-card .dot-tabs__item {
  border: 1px solid transparent;
  border-top: 2px solid transparent;
  margin-top: -1px;
}

.dot-tabs--border-card .dot-tabs__item--active {
  background: #fff;
  border-color: #e4e7ed;
  border-top-color: #409eff;
  border-bottom-color: #fff;
  color: #409eff;
}

.dot-tabs--border-card .dot-tabs__content {
  padding: 16px;
  background: #fff;
}

/* ===== 内容面板区 ===== */
.dot-tabs__content {
  overflow: hidden;
}

.dot-tabs__pane {
  animation: fade-in 0.3s;
}

@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ===== 位置适配（left/right） ===== */
.dot-tabs--left,
.dot-tabs--right {
  display: flex;
}

.dot-tabs--left .dot-tabs__nav,
.dot-tabs--right .dot-tabs__nav {
  margin-bottom: 0;
  width: 150px;
  flex-shrink: 0;
}

.dot-tabs--left .dot-tabs__nav-wrap,
.dot-tabs--right .dot-tabs__nav-wrap {
  flex-direction: column;
}

.dot-tabs--left .dot-tabs__content,
.dot-tabs--right .dot-tabs__content {
  flex: 1;
  padding: 0 16px;
}

.dot-tabs--left .dot-tabs__bar,
.dot-tabs--right .dot-tabs__bar {
  width: 2px;
  height: auto;
  right: 0;
  left: auto;
}

.dot-tabs--left {
  flex-direction: row;
}

.dot-tabs--right {
  flex-direction: row-reverse;
}

/* bottom 位置 */
.dot-tabs--bottom {
  display: flex;
  flex-direction: column-reverse;
}

.dot-tabs--bottom .dot-tabs__nav {
  margin-bottom: 0;
  margin-top: 16px;
}

.dot-tabs--bottom .dot-tabs__bar {
  top: 0;
  bottom: auto;
}
</style>
