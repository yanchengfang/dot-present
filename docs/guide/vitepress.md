# VitePress 使用指南

面向组件库文档站的快速上手说明。更多细节以 [VitePress 官方文档](https://vitepress.dev/) 为准。

## 1. 简介

VitePress 由 Vite 驱动，将 Markdown 渲染为静态站点，适合组件库说明、API 文档与示例演示。默认主题已包含导航、侧边栏、搜索（可配置）、暗色模式等。

## 2. 安装与初始化

在仓库根目录或独立文档包（例如 `documents/vitepress-docs`）中执行：

```bash
pnpm add -D vitepress vue
```

初始化目录与配置（会提示创建 `docs` 等，可按需选择）：

```bash
pnpm vitepress init
```

手动最小结构示例：

```
docs/
  index.md              # 站点首页
  guide/
    getting-started.md
.vitepress/
  config.ts             # 或 config.mts（推荐 ESM）
```

在 `package.json` 增加脚本：

```json
{
  "scripts": {
    "docs:dev": "vitepress dev docs",
    "docs:build": "vitepress build docs",
    "docs:preview": "vitepress preview docs"
  }
}
```

本地预览：`pnpm docs:dev`。

## 3. 配置文件

配置文件放在 `docs/.vitepress/config.ts`（路径需与 `dev docs` 中的目录一致）。

常用项：

- `title` / `description`：站点标题与 SEO 描述。
- `themeConfig`：`nav`（顶栏）、`sidebar`（侧栏）、`socialLinks`、`footer` 等。
- `base`：部署在子路径时设为 `'/子路径/'`（注意首尾斜杠）。

侧栏可按目录拆分多文件，用 `themeConfig.sidebar` 的对象形式为不同路由配置不同菜单。

## 4. Markdown 与 Vue

- 普通 Markdown 语法均支持；可开启行内高亮、代码块 ` ```ts ` 等。
- 在 `.md` 中可直接写 Vue 组件标签（需已注册组件或全局注册）。
- 用 `<script setup>` 可在单页内写演示逻辑（适合简单 Demo）。

在文档中演示组件库时，常见做法：

1. 在 `.vitepress/theme/index.ts` 里 `import` 你的组件样式与组件并 `app.component` 注册，或提供插件式 `enhanceApp`。
2. 在 Markdown 里像用普通组件一样写组件标签（名称以你库为准）。

## 5. 与 Monorepo 联调

- 文档包依赖工作区内的 `@dot-present/components` 等：`"dependencies": { "@dot-present/components": "workspace:*" }`。
- 开发时组件改动会通过 workspace 软链反映到文档站，便于边写组件边写文档。

## 6. 构建与部署

- 构建：`pnpm docs:build`，默认输出到 `docs/.vitepress/dist`（具体以终端提示为准）。
- 将 `dist` 部署到任意静态托管（GitHub Pages、Netlify、Vercel、内网 Nginx 等）；若使用子路径，务必配置好 `base`。

## 7. 可选能力（按需查阅官方文档）

- **全文搜索**：默认主题可配置本地搜索或 Algolia。
- **多语言**：`locales` 配置多语言路由与侧栏。
- **自定义主题**：扩展 `Layout`、覆盖默认组件。
- **环境变量**：通过 Vite 的 `define` 或 `.env`（注意仅构建期注入）。

## 8. 常见问题

- **端口占用**：`vitepress dev docs --port 5174`。
- **路径 404**：检查 `base` 与部署子目录是否一致。
- **组件样式未生效**：确认在主题入口引入了组件库的全局 CSS/SCSS。

---

版本迭代较快，遇到 API 变更请以安装版本对应的官方文档为准。
