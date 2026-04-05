# Tabs 标签页

用于承载同一层级下的多块内容切换，支持下划线、卡片、边框卡片等样式，以及关闭、新增、懒渲染与切换前钩子。

<script setup lang="ts">
import { ref } from 'vue'

const lineActive = ref('u1')
const lineItems = [
  { key: 'u1', label: '用户管理' },
  { key: 'u2', label: '配置' },
  { key: 'u3', label: '禁用示例', disabled: true },
]

const cardActive = ref('c1')
const cardItems = [
  { key: 'c1', label: '选项一' },
  { key: 'c2', label: '选项二' },
]

const closeActive = ref('x1')
const closeItems = ref([
  { key: 'x1', label: '可关闭一', closable: true },
  { key: 'x2', label: '可关闭二', closable: true },
])

const onTabClose = (item: { key: string }) => {
  closeItems.value = closeItems.value.filter((i) => i.key !== item.key)
}
</script>

## 线型（默认）

`type="line"` 时底部带有指示条，适合常规页签导航。

<div class="dp-demo">
  <DotTabs v-model="lineActive" type="line" :items="lineItems">
    <template #u1>
      <p style="margin: 0;">用户管理面板内容。</p>
    </template>
    <template #u2>
      <p style="margin: 0;">配置面板内容。</p>
    </template>
    <template #u3>
      <p style="margin: 0;">当前 Tab 为禁用，仅作展示。</p>
    </template>
  </DotTabs>
</div>

```vue
<script setup lang="ts">
import { ref } from 'vue'
import Tabs from '@dot-present/components/tabs'

const active = ref('u1')
const items = [
  { key: 'u1', label: '用户管理' },
  { key: 'u2', label: '配置' },
]
</script>

<template>
  <Tabs v-model="active" type="line" :items="items">
    <template #u1>面板一</template>
    <template #u2>面板二</template>
  </Tabs>
</template>
```

## 卡片类型

`type="card"` 时标签呈现卡片页签样式，内容区带边框。

<div class="dp-demo">
  <DotTabs v-model="cardActive" type="card" :items="cardItems">
    <template #c1>
      <p style="margin: 0;">卡片风格下的第一页。</p>
    </template>
    <template #c2>
      <p style="margin: 0;">卡片风格下的第二页。</p>
    </template>
  </DotTabs>
</div>

## 可关闭

开启 `closable` 或为单项设置 `closable` 后显示关闭图标；需监听 `close` 自行更新 `items`。

<div class="dp-demo">
  <DotTabs
    v-model="closeActive"
    type="line"
    :items="closeItems"
    closable
    @close="onTabClose"
  >
    <template #x1><p style="margin: 0;">第一页</p></template>
    <template #x2><p style="margin: 0;">第二页</p></template>
  </DotTabs>
</div>

## 插槽与面板

- 具名插槽名为各 `item.key`，用于放置对应面板内容。
- 若未提供具名插槽，会回退到默认插槽（并传入 `item`、`isActive`）。

## 全局注册（可选）

```ts
import dot from '@dot-present/components'
import '@dot-present/theme-chalk/dist/index.css'

app.use(dot)
```

## API

### Props

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| model-value (v-model) | 当前激活的 `key` | `string` | `''` |
| items | Tab 配置列表（必填） | `TabItem[]` | — |
| type | 外观类型 | `'line' \| 'card' \| 'border-card'` | `'line'` |
| position | 标签位置 | `'top' \| 'right' \| 'bottom' \| 'left'` | `'top'` |
| closable | 是否显示关闭（可被单项 `closable` 覆盖） | `boolean` | `false` |
| addable | 是否显示新增按钮 | `boolean` | `false` |
| lazy | 是否延迟渲染未激活过的面板 | `boolean` | `false` |
| before-change | 切换前钩子，返回 `false` 可阻止切换 | `(key, oldKey) => boolean \| Promise<boolean>` | — |

### TabItem

| 字段 | 说明 |
| --- | --- |
| key | 唯一键，与具名插槽名一致 |
| label | 标签文案 |
| disabled | 是否禁用 |
| closable | 是否可关闭 |

### 事件

| 事件名 | 说明 | 参数 |
| --- | --- | --- |
| update:modelValue | 激活项变化 | `(key: string)` |
| change | 切换完成 | `(key: string, oldKey: string)` |
| click | 点击某一标签 | `(item: TabItem)` |
| close | 点击关闭 | `(item: TabItem)` |
| add | 点击新增 | — |

### 暴露方法

| 方法 | 说明 |
| --- | --- |
| switchTo | 切换到指定 `key` |
| refreshBar | 刷新线型指示条位置（`line`） |
| getActiveKey | 当前激活 `key` |
