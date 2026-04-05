import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// Vitest 基于 Vite：此处同时承担「测试环境的 Vue 编译与路径别名」配置，不再单独维护 vite.config
export default defineConfig({
  cacheDir: ".vite",
  plugins: [vue()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "jsdom",
  },
});
