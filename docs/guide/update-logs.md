# 更新日志

本页记录 **Dot Present** 仓库在文档与组件库层面的主要变更，便于对照升级与排错。版本号以根目录与各子包 `package.json` 为准；若尚未正式发布，以 **未发布 / 工作区** 条目描述当前主线进展。

---

## 未发布（工作区主线）

**文档**

- 完善 [指南首页 / 使用教程](/guide/)：环境要求、全量 / 按需引入、`theme-chalk` 样式、本地脚本说明。
- 组件文档：Button、Card、Form、Tabs、LazyLoad 等页面的示例与 API 说明（见 [组件总览](/components/)）。

**组件库（@dot-present/components）**

- 提供子路径导出（如 `button`、`card`、`form`、`lazy-load`、`tabs`），便于按需 `import`。
- 构建与类型：`rollup` 多入口分包与类型声明；修复 Tabs、LazyLoad 等与严格类型检查相关的构建问题。

**样式（@dot-present/theme-chalk）**

- 通过 `dist/index.css` 统一输出，供业务与文档站一次性引入。

---

## 1.0.5（@dot-present/components 参考版本）

- 组件集合与 `withInstall` 全量入口持续迭代；具体以当前 `packages/components` 导出为准。

---

## 1.0.0（根包 dot-present）

- 仓库与 monorepo 脚本定型：`build`、`test`、`docs:dev` / `docs:build` 等。
- 集成 Vue 3、VitePress、Rollup、Vitest 等开发与文档工具链。

---

## 更早版本

早期内部迭代未单独成文；若需追溯文件级历史，请使用 Git 提交记录。
