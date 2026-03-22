import typescript from "rollup-plugin-typescript2";
import vue from "rollup-plugin-vue";
import postcss from "rollup-plugin-postcss";
import del from "rollup-plugin-delete";
import copy from "rollup-plugin-copy";
import terser from "@rollup/plugin-terser";
import dts from "rollup-plugin-dts";

// 导出一个数组，该数组里面是一个一个的对象
// 每一个对象就是一个打包任务
export default [
  {
    // 打包组件的任务
    input: "packages/components/index.ts", // 打包入口
    // 打包的输出
    output: {
      file: "packages/components/dist/index.esm.js",
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
        // 使用包内 tsconfig，避免继承根 tsconfig.app.json 时
        // 把 virtual-list 一并纳入、rootDir 落到 packages/
        // 导致 .d.ts 进 dist/components/**
        tsconfig: "packages/components/tsconfig.build.json",
      }),
      terser(),
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
        tsconfig: "packages/virtual-list/tsconfig.app.json",
        declaration: false,
        // tsconfig 里若 emitDeclarationOnly: true，TS 不产出 JS，rpt2 无法给 Rollup 喂 JS，会退回解析裸 .tsx 并在 interface 处报错
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
