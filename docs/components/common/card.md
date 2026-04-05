# Card 卡片

将信息聚合在带封面图、正文与页脚区域的容器中，常用于列表项、商品卡、文章摘要等展示场景。

## 基础用法

设置必填属性 `img-src` 提供头图；通过 `summary` 展示摘要文案，或使用默认插槽自定义正文（二者互斥：有 `summary` 时不渲染默认插槽正文）。

<div class="dp-demo">
  <div class="dp-demo-row" style="align-items: stretch;">
    <DotCard
      :width="280"
      :img-height="160"
      img-src="https://picsum.photos/seed/dot-card-1/560/320"
      summary="这是一段卡片摘要，适合一句话说明主题。"
    />
  </div>
</div>

```vue
<script setup lang="ts">
import Card from '@dot-present/components/card'
</script>

<template>
  <Card
    :width="280"
    :img-height="160"
    img-src="https://picsum.photos/seed/dot-card-1/560/320"
    summary="这是一段卡片摘要，适合一句话说明主题。"
  />
</template>
```

## 默认插槽与页脚

当不设置 `summary` 时，默认插槽作为正文区域；`footer` 插槽用于放置操作区（如按钮、元信息）。

<div class="dp-demo">
  <div class="dp-demo-row" style="align-items: stretch;">
    <DotCard
      :width="280"
      :img-height="160"
      img-src="https://picsum.photos/seed/dot-card-2/560/320"
    >
      <p style="margin: 0; line-height: 1.6; color: var(--vp-c-text-2); font-size: 14px;">
        使用默认插槽编写多行说明或自定义结构。
      </p>
      <template #footer>
        <span style="font-size: 12px; color: #909399;">页脚 · 自定义</span>
      </template>
    </DotCard>
  </div>
</div>

```vue
<template>
  <Card
    :width="280"
    :img-height="160"
    img-src="https://picsum.photos/seed/dot-card-2/560/320"
  >
    <p>自定义正文</p>
    <template #footer>
      <span>页脚</span>
    </template>
  </Card>
</template>
```

## 尺寸

通过数值型 `width`、`img-height`（单位均为像素）控制卡片与图片区域大小；为 `0` 时表示不设置对应内联样式，由外层布局决定宽度。

## 全局注册（可选）

```ts
import { createApp } from 'vue'
import App from './App.vue'
import dot from '@dot-present/components'
import '@dot-present/theme-chalk/dist/index.css'

createApp(App).use(dot).mount('#app')
```

## API

### Props

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| img-src | 头图地址（必填） | `string` | `''` |
| width | 卡片宽度（px），`0` 表示不限制 | `number` | `0` |
| img-height | 图片区域高度（px），`0` 表示不限制 | `number` | `0` |
| summary | 摘要文案；有值时不渲染默认插槽正文 | `string` | `''` |

### 插槽

| 插槽名 | 说明 |
| --- | --- |
| default | 正文（无 `summary` 时生效） |
| footer | 底部区域 |
