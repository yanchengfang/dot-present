// 该文件的目的只有一个：生成类型声明文件的入口文件

const fs = require("fs");

const path = require("path");

/**

 * @param {string} distDirName dist 下的子目录名，如 components、virtual-list

 * @param {{ includeDefaultFromIndex?: boolean }} [options]

 *        includeDefaultFromIndex：入口 index 是否有 default 导出（components 有，virtual-list 仅有命名导出）

 */

function generateTypesEntry(distDirName, options = {}) {
  const { includeDefaultFromIndex = true } = options;

  const distDir = path.resolve(__dirname, "..", "dist", distDirName);

  const typesFile = path.resolve(distDir, "types.d.ts");

  if (!fs.existsSync(distDir)) {
    console.warn(`[generate-types] 跳过 ${distDirName}：目录不存在`);

    return;
  }

  const subdirs = fs

    .readdirSync(distDir, { withFileTypes: true })

    .filter((entry) => entry.isDirectory())

    .map((entry) => entry.name)

    .filter((name) => name !== ".vite");

  let typesContent = "";

  if (includeDefaultFromIndex) {
    typesContent += 'export { default } from "./index";\n';
  }

  typesContent += 'export * from "./index";\n';

  typesContent += "\n";

  typesContent += subdirs
    .map((name) => `export * from "./${name}";`)
    .join("\n");

  typesContent += "\n";

  fs.writeFileSync(typesFile, typesContent, "utf8");

  console.log(`类型声明入口已生成: ${typesFile}`);
}

generateTypesEntry("components", { includeDefaultFromIndex: true });

generateTypesEntry("virtual-list", { includeDefaultFromIndex: false });

console.log("类型声明文件的入口文件已经生成完毕...");
