#!/usr/bin/env bash
# 在 VPS 上克隆 monorepo 后，于仓库根目录执行：bash deploy/vitepress/vps-build-and-up.sh
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

if ! command -v pnpm >/dev/null 2>&1; then
  echo "未找到 pnpm，请先安装 Node 20+ 与 pnpm（例如 corepack enable && corepack prepare pnpm@10.26.2 --activate）"
  exit 1
fi

if ! command -v docker >/dev/null 2>&1; then
  echo "未找到 docker，请先安装 Docker 与 Docker Compose 插件"
  exit 1
fi

pnpm install --frozen-lockfile
pnpm build
pnpm docs:build

docker compose -f deploy/vitepress/docker-compose.yml up -d --build

echo "文档容器已启动。默认映射宿主机 4173 → 容器 80：可直接访问 http://<VPS-IP>:4173，或由现有 Nginx 反代（见 deploy/vitepress/nginx-upstream-example.conf）"
