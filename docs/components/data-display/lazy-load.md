# LazyLoad 图片懒加载

在图片进入视口（或满足 `IntersectionObserver` 条件）后再加载真实地址，加载过程展示占位或加载动画，失败时可兜底展示错误图或文案。

::: tip 容器高度
组件内部图片区域依赖父级高度，请为外层容器设置明确高度（或固定纵横比布局），否则占位区域可能无法正确撑开。
:::

## 基础用法

滚动页面使下方示例进入视口后，将由占位过渡为真实图片。

<div class="dp-demo">
  <div style="height: 220px; max-width: 480px;">
    <DotLazyLoad
      src="https://picsum.photos/seed/dot-lazy-wide/1200/800"
      alt="懒加载示例大图"
    />
  </div>
</div>

```vue
<script setup lang="ts">
import LazyLoad from '@dot-present/components/lazy-load'
</script>

<template>
  <div style="height: 220px">
    <LazyLoad
      src="https://picsum.photos/seed/dot-lazy-wide/1200/800"
      alt="懒加载示例大图"
    />
  </div>
</template>
```

## 占位与失败兜底

- `placeholder`：加载中显示的占位图地址。
- `error`：加载失败时显示的兜底图地址；若不传则展示「加载失败」文案。

<div class="dp-demo">
  <div style="height: 180px; max-width: 480px;">
    <DotLazyLoad
      src="https://picsum.photos/seed/dot-lazy-ph/1000/700"
      placeholder="https://picsum.photos/seed/dot-lazy-ph-small/40/40"
      alt="带占位图"
    />
  </div>
</div>

## 原生懒加载

`native` 为 `true` 且浏览器支持 `img.loading` 时，可走浏览器原生懒加载策略（与 `IntersectionObserver` 逻辑二选一，以组件实现为准）。

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
| src | 真实图片地址（必填） | `string` | — |
| placeholder | 加载中占位图 | `string` | `''` |
| error | 失败兜底图 | `string` | `''` |
| alt | 图片 `alt` | `string` | `''` |
| native | 是否优先使用浏览器原生懒加载 | `boolean` | `false` |
| root-margin | `IntersectionObserver` 的 `rootMargin` | `string` | `'0px 0px 50px 0px'` |
| threshold | 交叉比例阈值 `0`–`1` | `number` | `0` |
| duration | 淡入过渡时长（毫秒） | `number` | `300` |
| img-style | 合并到图片上的样式对象 | `object` | `{}` |
| container-class | 根节点额外类名 | `string` | `''` |

### 事件

| 事件名 | 说明 | 参数 |
| --- | --- | --- |
| enter | 进入视口并开始加载流程 | — |
| load | 图片加载成功 | `(src: string)` |
| error | 图片加载失败 | `(src: string)` |

### 插槽

| 插槽名 | 说明 |
| --- | --- |
| placeholder | 自定义加载中内容 |
| error | 自定义失败内容 |

### 暴露方法

| 方法 | 说明 |
| --- | --- |
| load | 手动触发加载 |
| retry | 重试加载 |
| getState | 当前状态 |
