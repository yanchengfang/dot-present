# Button 按钮

用于触发操作或提交表单的基础控件，支持多种视觉类型、朴素样式、圆角、圆形、禁用与图标组合，风格与交互习惯接近常见中后台组件库。

## 基础用法

使用 `DotButton` 包裹文案即可；默认类型为 `default`，呈线框弱强调样式。

<div class="dp-demo">
  <div class="dp-demo-row">
    <DotButton>默认按钮</DotButton>
    <DotButton type="primary">主要按钮</DotButton>
  </div>
</div>

```vue
<script setup lang="ts">
import Button from '@dot-present/components/button'
</script>

<template>
  <Button>默认按钮</Button>
  <Button type="primary">主要按钮</Button>
</template>
```

## 按钮类型

通过 `type` 设置语义色：`default` | `primary` | `success` | `info` | `warning` | `danger`。

<div class="dp-demo">
  <div class="dp-demo-row">
    <DotButton>Default</DotButton>
    <DotButton type="primary">Primary</DotButton>
    <DotButton type="success">Success</DotButton>
    <DotButton type="info">Info</DotButton>
    <DotButton type="warning">Warning</DotButton>
    <DotButton type="danger">Danger</DotButton>
  </div>
</div>

```vue
<template>
  <DotButton>Default</DotButton>
  <DotButton type="primary">Primary</DotButton>
  <DotButton type="success">Success</DotButton>
  <DotButton type="info">Info</DotButton>
  <DotButton type="warning">Warning</DotButton>
  <DotButton type="danger">Danger</DotButton>
</template>
```

## 朴素按钮

设置 `plain` 为朴素（浅色底 + 彩色字），悬停时仍会强化填充色，适合次要操作。

<div class="dp-demo">
  <div class="dp-demo-row">
    <DotButton plain>Default</DotButton>
    <DotButton type="primary" plain>Primary</DotButton>
    <DotButton type="success" plain>Success</DotButton>
    <DotButton type="info" plain>Info</DotButton>
    <DotButton type="warning" plain>Warning</DotButton>
    <DotButton type="danger" plain>Danger</DotButton>
  </div>
</div>

```vue
<template>
  <DotButton plain>Default</DotButton>
  <DotButton type="primary" plain>Primary</DotButton>
  <!-- 其余 type 同理 -->
</template>
```

## 圆角按钮

`round` 使用大圆角胶囊形态，适合作为工具栏或筛选条上的主操作。

<div class="dp-demo">
  <div class="dp-demo-row">
    <DotButton round>圆角默认</DotButton>
    <DotButton type="primary" round>圆角主要</DotButton>
  </div>
</div>

```vue
<template>
  <DotButton round>圆角默认</DotButton>
  <DotButton type="primary" round>圆角主要</DotButton>
</template>
```

## 圆形按钮

`circle` 为等宽高的圆形按钮，通常与 `icon` 搭配作为图标按钮。

<div class="dp-demo">
  <div class="dp-demo-row">
    <DotButton type="primary" icon="search" circle />
    <DotButton type="success" icon="edit" circle />
    <DotButton type="warning" icon="star-on" circle />
  </div>
</div>

```vue
<template>
  <DotButton type="primary" icon="search" circle />
  <DotButton type="success" icon="edit" circle />
  <DotButton type="warning" icon="star-on" circle />
</template>
```

## 图标 + 文字

设置 `icon` 为图标类名后缀（会渲染为 `dot-icon-{icon}`），左侧图标与文字之间自动留出间距。

<div class="dp-demo">
  <div class="dp-demo-row">
    <DotButton type="primary" icon="search">搜索</DotButton>
    <DotButton type="success" icon="check">确认</DotButton>
    <DotButton type="danger" icon="delete">删除</DotButton>
  </div>
</div>

```vue
<template>
  <DotButton type="primary" icon="search">搜索</DotButton>
  <DotButton type="success" icon="check">确认</DotButton>
  <DotButton type="danger" icon="delete">删除</DotButton>
</template>
```

## 禁用状态

`disabled` 会禁用点击并展示禁用样式；不同类型均有对应置灰规则。

<div class="dp-demo">
  <div class="dp-demo-row">
    <DotButton disabled>禁用默认</DotButton>
    <DotButton type="primary" disabled>禁用主要</DotButton>
    <DotButton type="danger" disabled>禁用危险</DotButton>
  </div>
</div>

```vue
<template>
  <DotButton disabled>禁用默认</DotButton>
  <DotButton type="primary" disabled>禁用主要</DotButton>
  <DotButton type="danger" disabled>禁用危险</DotButton>
</template>
```

## 全局注册（可选）

在应用入口一次性注册后，任意组件内可直接写 `<DotButton>`，无需逐文件导入。

```ts
// main.ts
import { createApp } from 'vue'
import App from './App.vue'
import dot from '@dot-present/components'
import '@dot-present/theme-chalk/dist/index.css'

const app = createApp(App)
app.use(dot)
app.mount('#app')
```

## API

### Props

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| type | 按钮类型 | `'default' \| 'primary' \| 'success' \| 'info' \| 'warning' \| 'danger'` | `default` |
| plain | 是否为朴素按钮 | `boolean` | `false` |
| round | 是否圆角按钮 | `boolean` | `false` |
| circle | 是否圆形按钮 | `boolean` | `false` |
| disabled | 是否禁用 | `boolean` | `false` |
| icon | 图标名（不含 `dot-icon-` 前缀，由样式表提供对应字形类） | `string` | `''` |

### 事件

| 事件名 | 说明 | 参数 |
| --- | --- | --- |
| click | 点击时触发（禁用时不触发） | `(event: MouseEvent)` |

### 插槽

| 插槽名 | 说明 |
| --- | --- |
| default | 按钮文字内容 |
