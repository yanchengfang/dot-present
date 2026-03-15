<script setup lang="ts">
import { cardProps } from "./card";

defineOptions({
  name: "DotCard"
});
defineProps(cardProps);

</script>

<template>
  <div class="dot-card" :style="width ? {width: width + 'px'} : {}">
    <div class="dot-card-img" :style="imgHeight ? {height: imgHeight + 'px'} : {}">
      <img :src="imgSrc" alt="">
    </div>
    <div v-if="summary" class="dot-card-summary">{{ summary }}</div>
    <div v-else class="dot-card-summary"><slot></slot></div>
    
    <div class="dot-card-footer">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<style scoped>
.card {
  padding: 20px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>