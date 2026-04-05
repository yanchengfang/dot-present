# Markdown 扩展示例

本页演示 VitePress 内置的部分 Markdown 扩展能力。

## 语法高亮

VitePress 使用 [Shiki](https://github.com/shikijs/shiki) 实现语法高亮，并支持行高亮等能力：

**输入**

````md
```js{4}
export default {
  data () {
    return {
      msg: 'Highlighted!'
    }
  }
}
```
````

**输出**

```js{4}
export default {
  data () {
    return {
      msg: 'Highlighted!'
    }
  }
}
```

## 自定义容器

**输入**

```md
::: info
这是一条信息。
:::

::: tip
这是一条提示。
:::

::: warning
这是一条警告。
:::

::: danger
这是一条危险提示。
:::

::: details
这是一个折叠块。
:::
```

**输出**

::: info
这是一条信息。
:::

::: tip
这是一条提示。
:::

::: warning
这是一条警告。
:::

::: danger
这是一条危险提示。
:::

::: details
这是一个折叠块。
:::

## 更多

完整列表见官方文档：[Markdown 扩展](https://vitepress.dev/guide/markdown)。
