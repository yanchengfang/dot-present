# VirtualList 虚拟列表（React）

在大数据量列表场景下，仅渲染可视区域内的节点，通过占位总高度与 `translateY` 定位模拟完整滚动，从而降低 DOM 规模、提升滚动性能。本包 **`@dot-present/virtual-list`** 为 **React 18+** 组件，与主仓 **Vue 3 组件库**技术栈不同，故在文档中归入 **进阶组件**；适用于 React 技术栈或混合工程中的列表页。

::: tip Vue 技术栈
本仓库提供 **Vue 3 + JSX** 版本：**[VirtualList V2](/components/advanced/virtual-list-v2)**（`@dot-present/virtual-list-v2`），可与主文档组件栈一致使用。
:::

::: warning 技术栈
使用前请安装 **react**、**react-dom**（peer，建议 ≥18）。纯 Vue 项目请优先使用 [VirtualList V2](/components/advanced/virtual-list-v2)。
:::

## 安装

```bash
pnpm add @dot-present/virtual-list react react-dom
```

## 基础用法（固定行高）

传入 `itemHeight` 即启用**固定高度模式**，计算最简单、性能最好。请保证每条列表项实际高度与 `itemHeight` 一致。

```tsx
import { useRef } from 'react'
import { VirtualList, type VirtualListRef } from '@dot-present/virtual-list'

type Row = { id: number; title: string }

export function FixedDemo() {
  const data: Row[] = Array.from({ length: 10000 }, (_, i) => ({
    id: i,
    title: `第 ${i} 行`,
  }))
  const listRef = useRef<VirtualListRef>(null)

  return (
    <VirtualList<Row>
      ref={listRef}
      data={data}
      itemKey="id"
      itemHeight={48}
      containerHeight={400}
      renderItem={(item) => (
        <div style={{ height: 48, lineHeight: '48px', paddingLeft: 12, borderBottom: '1px solid #eee' }}>
          {item.title}
        </div>
      )}
    />
  )
}
```

## 动态行高

不传 `itemHeight` 时为**动态高度模式**：依赖 `estimatedItemHeight` 做首屏估算，再通过 `ResizeObserver` 测量真实高度并修正累计偏移。适合卡片、可变文案等行高不定的列表。

```tsx
import { VirtualList } from '@dot-present/virtual-list'

type Row = { id: number; text: string }

export function DynamicDemo() {
  const data: Row[] = Array.from({ length: 5000 }, (_, i) => ({
    id: i,
    text: `条目 ${i}，内容长度可不同`,
  }))

  return (
    <VirtualList<Row>
      data={data}
      itemKey="id"
      estimatedItemHeight={56}
      containerHeight="360px"
      bufferSize={4}
      renderItem={(item) => (
        <div style={{ padding: 12, borderBottom: '1px solid #f0f0f0' }}>
          <strong>{item.id}</strong>
          <p style={{ margin: '8px 0 0', color: '#666' }}>{item.text}</p>
        </div>
      )}
    />
  )
}
```

## 触底加载

滚动接近底部时会触发 `onReachEnd`（实现上在离开底部区域后会重置状态，以便再次触底时仍可触发）。可与分页、无限加载逻辑配合。

```tsx
<VirtualList
  data={data}
  itemKey="id"
  itemHeight={40}
  containerHeight={400}
  onReachEnd={() => {
    // 拉取下一页并追加到 data
  }}
  renderItem={(item, index) => <div>{index}</div>}
/>
```

## 命令式滚动

通过 `ref` 调用实例方法，便于与路由、选中项、回到顶部等交互联动。

| 方法 | 说明 |
| --- | --- |
| `scrollTo(scrollTop: number)` | 滚动到指定纵向偏移（像素） |
| `scrollToIndex(index, align?)` | 滚动到指定下标；`align` 为 `start` \| `center` \| `end` |
| `getCurrentRange()` | 返回当前渲染的大致区间 `{ start, end }`（含缓冲带） |

```tsx
const ref = useRef<VirtualListRef>(null)

// 滚动到第 100 条并尽量居中
ref.current?.scrollToIndex(100, 'center')
```

## API

### Props

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| data | 列表数据 | `T[]` | — |
| itemKey | 唯一键：字段名或 `(item, index) => string` | `keyof T \| function` | — |
| renderItem | 渲染每一行 | `(item: T, index: number) => ReactNode` | — |
| itemHeight | 固定行高（像素）；传入则启用固定高度模式 | `number` | — |
| estimatedItemHeight | 动态模式下预估行高 | `number` | `50` |
| containerHeight | 滚动容器高度，如 `400`、`'400px'`、`'100%'` | `number \| string` | `'100%'` |
| bufferSize | 可视区上下额外渲染行数，减轻快速滚动白屏 | `number` | `3` |
| overscanCount | 与 `bufferSize` 同义，优先取其一 | `number` | — |
| onScroll | 原生滚动事件 | `React.UIEventHandler<HTMLDivElement>` | — |
| onReachEnd | 接近底部时触发 | `() => void` | — |

### Ref（VirtualListRef）

| 方法 | 说明 |
| --- | --- |
| scrollTo | 设置容器 `scrollTop` |
| scrollToIndex | 按索引滚动，可选对齐方式 |
| getCurrentRange | 当前可见区间（含缓冲） |

### 类型导出

```ts
import type { VirtualListRef } from '@dot-present/virtual-list'
```

## 实现要点（与使用相关）

- **容器高度**：`containerHeight` 为百分比时，父级需有明确高度，否则 `ResizeObserver` 可能得到 0，组件会用 `estimatedItemHeight` 等做兜底估算。
- **固定高度模式**：请勿让行内容撑破 `itemHeight`，否则会出现重叠或裁切。
- **动态模式**：首次用估算高度占位，测量后修正偏移；大量行时仍应注意 `renderItem` 开销。

更完整的设计说明与原理可参考 Monorepo 内 `packages/virtual-list/README.md`。
