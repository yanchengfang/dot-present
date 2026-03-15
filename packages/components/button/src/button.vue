<template>
  <button
    class="dot-button"
    :class="[
      `dot-button-${type}`,
      {
        'is-plain': plain,
        'is-round': round,
        'is-circle': circle,
        'is-disabled': disabled,
      },
    ]"
    :disabled="disabled"
    @click="handleClick"
  > 
    <i v-if="icon" :class="[`dot-icon-${icon}`]"></i>
    <span v-if="$slots.default">
      <slot></slot>
    </span>
  </button>
</template>

<script setup lang="ts">
import { buttonProps } from "./button";

defineOptions({
  name: "DotButton"
});
// 需要在 <script> 内部访问这些 prop 值（比如用于计算属性、watch 或其他逻辑）
// 将props才将props声明出来
defineProps(buttonProps);

const emit = defineEmits(["click"]);

const handleClick = (e: Event) => {
  emit("click", e);
}
</script>

<style scoped></style>