import { mergeConfig, defineConfig } from "vite";
// 引入 vite.config.js 中导出的配置
import viteConfig from "./vite.config";

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: "jsdom"
    },
  })
);
