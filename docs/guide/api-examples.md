---
outline: deep
---

# 运行时 API 示例

本页演示 VitePress 提供的部分运行时 API。

主入口 `useData()` 可在当前页面访问站点、主题与页面数据，在 `.md` 与 `.vue` 中均可使用：

```md
<script setup>
import { useData } from 'vitepress'

const { theme, page, frontmatter } = useData()
</script>

## 结果

### 主题数据
<pre>{{ theme }}</pre>

### 页面数据
<pre>{{ page }}</pre>

### 页面 Frontmatter
<pre>{{ frontmatter }}</pre>
```

<script setup>
import { useData } from 'vitepress'

const { site, theme, page, frontmatter } = useData()
</script>

## 结果

### 主题数据
<pre>{{ theme }}</pre>

### 页面数据
<pre>{{ page }}</pre>

### 页面 Frontmatter
<pre>{{ frontmatter }}</pre>

## 更多

完整说明见：[运行时 API](https://vitepress.dev/reference/runtime-api#usedata)。
