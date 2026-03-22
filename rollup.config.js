import typescript from "rollup-plugin-typescript2";
import typescriptRollup from "@rollup/plugin-typescript";
import vue from "rollup-plugin-vue";
import postcss from "rollup-plugin-postcss";
import del from "rollup-plugin-delete";
import copy from "rollup-plugin-copy";
import terser from "@rollup/plugin-terser";

// 导出一个数组，该数组里面是一个一个的对象
// 每一个对象就是一个打包任务
export default [
  {
    // 打包组件的任务
    input: "packages/components/index.ts", // 打包入口
    // 打包的输出
    output: {
      dir: "packages/components/dist",
      format: "esm",
    },
    // 外部依赖，这一部分依赖不需要进行打包
    external: ["vue"],
    // 指定要使用的插件，注意插件是有顺序
    plugins: [
      del({ targets: "packages/components/dist" }), // 先把上一次的打包内容删除掉
      vue({
        include: ["**/*.vue"],
      }),
      postcss({
        extract: false,
      }),
      typescript({
        tsconfig: "tsconfig.app.json",
        exclude: ["packages/virtual-list/**"],
      }),
      terser(),
      copy({
        targets: [
          {
            src: "packages/components/package.json",
            dest: "packages/components/dist",
          },
        ],
      }),
    ],
  },
  {
    // 打包样式的任务
    input: "packages/theme-chalk/src/index.scss",
    output: {
      file: "packages/theme-chalk/dist/index.js",
      format: "esm",
    },
    plugins: [
      del({
        targets: "packages/theme-chalk/dist",
      }),
      postcss({
        extract: "index.css",
        minimize: true, // 压缩
      }),
      copy({
        targets: [
          {
            src: "packages/theme-chalk/package.json",
            dest: "packages/theme-chalk/dist",
          },
          {
            src: "packages/theme-chalk/src/fonts/*",
            dest: "packages/theme-chalk/dist/fonts",
          },
        ],
      }),
    ],
  },
  {
    // 打包虚拟列表
    input: "packages/virtual-list/src/index.tsx", // 打包入口
    // 打包的输出
    output: {
      dir: "packages/virtual-list/dist",
      format: "esm",
    },
    // 外部依赖，这一部分依赖不需要进行打包
    external: ["react", "react-dom", "react/jsx-runtime"],
    // 指定要使用的插件，注意插件是有顺序
    plugins: [
      del({ targets: "packages/virtual-list/dist" }), // 先把上一次的打包内容删除掉
      postcss({
        extract: false,
      }),
      typescriptRollup({
        tsconfig: "packages/virtual-list/tsconfig.app.json",
        include: ["packages/virtual-list/src/**/*.{ts,tsx}"],
        exclude: [
          "**/*.test.ts",
          "node_modules/@vue/**",
          "node_modules/vue/**",
          "**/*.vue",
          "vue-shim.d.ts",
        ],
        noEmitOnError: false,
        transformers: [],
      }),
      terser(),
      copy({
        targets: [
          {
            src: "packages/virtual-list/package.json",
            dest: "packages/virtual-list/dist",
          },
        ],
      }),
    ],
  },
];
