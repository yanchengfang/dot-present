# VirtualList V2（Vue 3 + JSX）

`@dot-present/virtual-list-v2` 使用 **Vue 3** 组合式 API 与 **JSX** 实现虚拟列表，与主文档中的 Vue 组件栈一致，可在 Vite / VitePress 中直接使用。行为与 React 版 [`@dot-present/virtual-list`](/components/advanced/virtual-list) 对齐：支持固定行高、动态行高（`ResizeObserver` 测量）、触底回调与命令式滚动。

::: tip 与 React 版的关系
- **React**：见 [VirtualList（React）](/components/advanced/virtual-list)。  
- **Vue**：本页；源码位于 `packages/virtual-list-v2`，由 Vite 单独构建。
:::

## 安装

```bash
pnpm add @dot-present/virtual-list-v2 vue
```

<script setup lang="ts">
import { h } from 'vue'

type Row = { id: number; title: string }

const fixedRows: Row[] = Array.from({ length: 9000 }, (_, i) => ({
  id: i,
  title: `第 ${i} 行`,
}))

function renderFixed(item: unknown, index: number) {
  const r = item as Row
  return h(
    'div',
    {
      style: {
        height: '44px',
        lineHeight: '44px',
        paddingLeft: '12px',
        borderBottom: '1px solid var(--vp-c-divider)',
        fontSize: '14px',
      },
    },
    `${index} · ${r.title}`,
  )
}

const dynamicRows = Array.from({ length: 3000 }, (_, i) => ({
  id: i,
  text: `条目 ${i}，文案长度可不同，用于演示动态高度。`,
}))

function renderDynamic(item: unknown) {
  const r = item as { id: number; text: string }
  return h('div', { style: { padding: '12px', borderBottom: '1px solid var(--vp-c-divider)' } }, [
    h('strong', String(r.id)),
    h('p', { style: { margin: '8px 0 0', color: 'var(--vp-c-text-2)', fontSize: '13px' } }, r.text),
  ])
}
</script>

## 固定行高（交互示例）

传入 `item-height`（像素）即启用固定高度模式；`render-item` 使用 `h()` 返回每一行 vnode。

<div class="dp-demo">
  <DotVirtualList
    :data="fixedRows"
    item-key="id"
    :item-height="44"
    :container-height="380"
    :render-item="renderFixed"
  />
</div>

```vue
<script setup lang="ts">
import { h } from 'vue'
import { VirtualList } from '@dot-present/virtual-list-v2'

type Row = { id: number; title: string }
const data: Row[] = [] // 你的数据

function renderRow(item: unknown, index: number) {
  const r = item as Row
  return h('div', { style: { height: '44px', lineHeight: '44px' } }, `${index} ${r.title}`)
}
</script>

<template>
  <VirtualList
    :data="data"
    item-key="id"
    :item-height="44"
    :container-height="400"
    :render-item="renderRow"
  />
</template>
```

## 动态行高（交互示例）

不传 `item-height` 时走动态模式，依赖 `estimated-item-height` 做初值，再由子节点测量修正偏移。

<div class="dp-demo">
  <DotVirtualList
    :data="dynamicRows"
    item-key="id"
    :estimated-item-height="64"
    :container-height="320"
    :render-item="renderDynamic"
  />
</div>

## 命令式 API（ref）

与 React 版相同，通过 `ref` 调用 `scrollTo`、`scrollToIndex`、`getCurrentRange`：

```vue
<script setup lang="ts">
import { ref, h } from 'vue'
import { VirtualList, type VirtualListExpose } from '@dot-present/virtual-list-v2'

const listRef = ref<VirtualListExpose | null>(null)

function jump() {
  listRef.value?.scrollToIndex(200, 'center')
}
</script>

<template>
  <VirtualList ref="listRef" :data="data" item-key="id" :item-height="40" :render-item="fn" />
</template>
```

## API

### Props

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| data | 列表数据 | `unknown[]` | — |
| item-key | 唯一键：字段名或函数 | `string \| function` | — |
| render-item | 渲染每一行 | `(item, index) => VNodeChild` | — |
| item-height | 固定行高（像素），传入则固定模式 | `number` | — |
| estimated-item-height | 动态模式下的预估行高 | `number` | `50` |
| container-height | 容器高度，如 `400`、`'400px'`、`'100%'` | `number \| string` | `'100%'` |
| buffer-size | 上下缓冲行数 | `number` | `3` |
| overscan-count | 同缓冲，优先于 buffer-size | `number` | — |
| on-scroll | 滚动事件 | `(e: Event) => void` | — |
| on-reach-end | 接近底部时触发 | `() => void` | — |

### 暴露方法（`VirtualListExpose`）

| 方法 | 说明 |
| --- | --- |
| scrollTo | 设置纵向滚动位置（像素） |
| scrollToIndex | 滚到指定索引，可选 `start` / `center` / `end` |
| getCurrentRange | 当前渲染区间（含缓冲） |

## 源码与构建

- 源码：`packages/virtual-list-v2/src`（`VirtualList.tsx` 为 JSX 组件）。  
- 构建：在仓库根目录执行 `pnpm -C packages/virtual-list-v2 build`（或根脚本 `pnpm build` 已串联）。
