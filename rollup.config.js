import path from "node:path";
import typescript from "rollup-plugin-typescript2";
import copy from 'rollup-plugin-copy';
import vue from "rollup-plugin-vue";
import postcss from "rollup-plugin-postcss";
import del from "rollup-plugin-delete";
import terser from "@rollup/plugin-terser";
import dts from "rollup-plugin-dts";

const componentsTsPlugins = (emitDeclaration) => [
  vue({
    include: ["**/*.vue"],
  }),
  postcss({
    extract: false,
  }),
  typescript({
    tsconfig: "packages/components/tsconfig.json",
    ...(emitDeclaration
      ? {}
      : {
          tsconfigOverride: {
            compilerOptions: {
              declaration: false,
            },
          },
        }),
  }),
  terser(),
];

// 导出一个数组，该数组里面是一个一个的对象
// 每一个对象就是一个打包任务
export default [
  {
    // 全量入口：单文件 dist/index.esm.js
    input: "packages/components/index.ts",
    output: {
      file: "packages/components/dist/index.esm.js",
      format: "esm",
    },
    external: ["vue"],
    plugins: [
      del({ targets: "packages/components/dist" }),
      ...componentsTsPlugins(true),
    ],
  },
  {
    // 多入口分包：公共模块（如 withInstall）抽到 dist/chunks/
    input: {
      button: "packages/components/button/index.ts",
      card: "packages/components/card/index.ts",
      form: "packages/components/form/index.ts",
      "lazy-load": "packages/components/lazy-load/index.ts",
      tabs: "packages/components/tabs/index.ts",
    },
    output: {
      dir: "packages/components/dist",
      format: "esm",
      entryFileNames: "[name]/index.esm.js",
      chunkFileNames: "chunks/[name]-[hash].js",
    },
    external: ["vue"],
    plugins: componentsTsPlugins(false),
  },
  {
    // 打包样式：Rollup 只认 es/cjs 等 format，不能写 format: "css"。
    // 由 postcss extract 把编译后的 CSS 写到 dist/index.js 同目录下的 index.css；index.js 为占位/空模块。
    input: "packages/theme-chalk/src/index.scss",
    output: {
      file: "packages/theme-chalk/dist/index.js",
      format: "es",
    },
    plugins: [
      del({
        targets: "packages/theme-chalk/dist",
      }),
      postcss({
        extract: "index.css",
        minimize: true,
      }),
      copy({
        targets: [
          {
            // 将 src 下源文件按「相对 src 的路径」写入 dist，避免出现 dist/theme-chalk/... 多一层包名
            src: "packages/theme-chalk/src/**/*",
            dest: "packages/theme-chalk/dist",
            flatten: true,
            rename: (_name, _ext, fullPath) =>
              path.relative(
                path.resolve("packages/theme-chalk/src"),
                fullPath,
              ),
          },
        ],
        verbose: true,
      }),
    ],
  },
  {
    // 打包虚拟列表
    input: "packages/virtual-list/src/index.tsx", // 打包入口
    // 打包的输出（使用 file：dir 必须是目录，不能指向具体 .js 文件名）
    output: [
      {
        file: "packages/virtual-list/dist/index.esm.js",
        format: "esm",
        sourcemap: true,
      },
      {
        file: "packages/virtual-list/dist/index.cjs.js",
        format: "cjs",
        sourcemap: true,
        exports: "named",
      },
    ],
    // 外部依赖，这一部分依赖不需要进行打包
    external: ["react", "react-dom", "react/jsx-runtime"],
    // 指定要使用的插件，注意插件是有顺序
    plugins: [
      del({ targets: "packages/virtual-list/dist" }), // 先把上一次的打包内容删除掉
      // 与 components 一致使用 rollup-plugin-typescript2；@rollup/plugin-typescript 未先剥离 TS 语法时会导致 Rollup 直接解析 export type 报错
      typescript({
        tsconfig: "packages/virtual-list/tsconfig.json",
        declaration: false,
        tsconfigOverride: {
          compilerOptions: {
            outDir: "packages/virtual-list/dist",
            emitDeclarationOnly: false,
            declaration: false,
          },
        },
        check: false,
        exclude: [
          "**/*.test.ts",
          "node_modules/@vue/**",
          "node_modules/vue/**",
          "**/*.vue",
          "vue-shim.d.ts",
        ],
      }),
      postcss({
        extract: false,
      }),
      terser(),
    ],
  },
  {
    // 类型声明合并为单个 .d.ts
    input: "packages/virtual-list/src/index.tsx",
    output: {
      file: "packages/virtual-list/dist/index.d.ts",
      format: "es",
    },
    external: ["react", "react-dom", "react/jsx-runtime"],
    plugins: [dts()],
  },
];
