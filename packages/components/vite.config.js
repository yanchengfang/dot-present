// 从 node.js 内置的 url 模块中引入 fileURLToPath、URL
// 这两个函数用于做 URL 相关的处理
import { fileURLToPath, URL } from "node:url";

// 从 vite 里面引入 defineConfig，该方法用于定义 vite 配置
import { defineConfig } from "vite";

// 引入 @vitejs/plugin-vue 这个插件，让 vite 能够支持对 vue 的处理
import vue from "@vitejs/plugin-vue";

// https://vitejs.dev/config/
export default defineConfig({
  cacheDir: ".vite",
  // 要使用的插件
  plugins: [vue()],
  resolve: {
    // 定义了一个别名映射
    // @ ---> src
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
