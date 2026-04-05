# 构建上下文须为仓库根目录（CI 中先执行 pnpm build && pnpm docs:build）
# 镜像内仅包含 Nginx 与 VitePress 静态产物，无需 node、pnpm 与工作区
FROM nginx:1.27-alpine

COPY docs/.vitepress/dist/ /usr/share/nginx/html/

EXPOSE 80
