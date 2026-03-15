// 该文件的目的只有一个：生成类型声明文件的入口文件

const fs = require("fs");
const path = require("path");

const componentsDir = path.resolve(__dirname, "..", "dist", "components");
const typesFile = path.resolve(componentsDir, "types.d.ts");

const components = fs
  .readdirSync(componentsDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .filter((name) => name !== ".vite");

let typesContent = "";
typesContent += 'export { default } from "./index";\n';
typesContent += 'export * from "./index";\n';
typesContent += "\n";
typesContent += components.map((name) => `export * from "./${name}";`).join("\n");
typesContent += "\n";

fs.writeFileSync(typesFile, typesContent, "utf8");

console.log("类型声明文件的入口文件已经生成完毕...");
