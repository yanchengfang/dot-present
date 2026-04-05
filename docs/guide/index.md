# 使用指南

Dot Present 是一套基于 **Vue 3** 与 **TypeScript** 的组件库，采用 pnpm workspace 与 Rollup 构建，样式由 **@dot-present/theme-chalk** 提供。本页说明如何安装、引入样式以及在项目中使用组件。

## 环境要求

- **Node.js**：建议 18 及以上（与工具链一致即可）。
- **包管理**：推荐使用 **pnpm**（仓库已指定 `packageManager`）。
- **框架**：**Vue 3.3+**（组件以 Vue 3 Composition API 编写）。

## 在应用中使用

### 安装依赖

在业务项目中安装（包名以实际发布为准；以下为本地 workspace 开发时常用写法示例）：

```bash
pnpm add @dot-present/components @dot-present/theme-chalk vue
```

若组件库已发布到 npm，请将依赖版本固定为与文档或发行说明一致。

### 全量注册

一次性注册全部组件，并引入全局样式（适合演示站或希望少写导入语句的项目）：

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

之后在任意 `.vue` 中可直接使用带 `Dot` 前缀的组件名（例如 `DotButton`、`DotCard`），具体名称以各组件 `defineOptions({ name })` 为准，并参考 [组件总览](/components/)。

### 按需引入

仅使用部分组件时，可从子路径默认导入再 `app.use`，有利于打包体积与依赖边界清晰：

```ts
import { createApp } from 'vue'
import App from './App.vue'
import Button from '@dot-present/components/button'
import Card from '@dot-present/components/card'
import '@dot-present/theme-chalk/dist/index.css'

const app = createApp(App)
app.use(Button)
app.use(Card)
app.mount('#app')
```

::: tip 类型与路径
子路径导出以 `packages/components/package.json` 的 `exports` 为准；若使用 TypeScript，请确保 `moduleResolution` 能解析到对应 `types` 声明。
:::

### 样式说明

- 全局样式入口为 **`@dot-present/theme-chalk/dist/index.css`**，包含图标字体与组件样式（如按钮、卡片等）。
- 若只做按需组件试验，也建议至少引入一次上述 CSS，否则类名（如 `dot-button`）无对应规则，界面会缺少预期外观。

## 本地开发与构建（参与本仓库）

克隆仓库并安装依赖：

```bash
pnpm install
```

常用脚本（见根目录 `package.json`）：

| 脚本 | 说明 |
| --- | --- |
| `pnpm build` | Rollup 构建组件库、主题样式等 |
| `pnpm test` | 运行 `packages/components` 下的单元测试 |
| `pnpm docs:dev` | 本地启动 VitePress 文档站 |
| `pnpm docs:build` | 构建静态文档站点 |

组件源码位于 `packages/components`，主题样式位于 `packages/theme-chalk`。

## 文档站与站内示例

本站由 VitePress 驱动，在主题中注册了文档示例用到的组件并引入主题 CSS，因此 Markdown 里可以直接写 `<DotButton>` 等标签。你在业务项目中仍需按上文方式自行 `app.use` 或按需引入。

更多编辑器与路由相关说明见 [VitePress 使用指南](/guide/vitepress)。

## 下一步

- 查阅 [更新日志](/guide/update-logs) 了解版本变更。
- 进入 [组件总览](/components/) 浏览各组件 API 与示例。
- 需要 Markdown 语法与演示时，可参考 [Markdown 示例](/guide/markdown-examples)。
