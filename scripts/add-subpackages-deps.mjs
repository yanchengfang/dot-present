import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// 子包的文件夹绝对路径 D:\桌面\前端工程化\dot-present\packages
const mainPkgJsonPath = path.resolve(import.meta.dirname, '../package.json');
const packagesDir = path.resolve(import.meta.dirname, '../packages');

// 遍历是所有子包，并判断是不是文件夹 [ 'components', 'theme-chalk', 'utils' ]
const subpackages = fs.readdirSync(packagesDir).filter(p => {
  return fs.statSync(path.join(packagesDir, p)).isDirectory();
});

subpackages.forEach(pkg => {
  try {
    const output = execSync('npx depcheck --json', {
      cwd: path.join(packagesDir, pkg),
      encoding: 'utf-8'
    });
    const result = JSON.parse(output);
    let keysArray = Object.keys(result.missing).filter(key => !key.includes('@dot-present'));
    if (result.missing && keysArray.length > 0) {
      console.log(`${pkg} 缺失依赖:`, keysArray);
      // 可以将结果保存到临时文件，或直接进行下一步处理
      addDepsToPackageJson(pkg, keysArray);
    } else {
      console.log(`${pkg} ✅没有缺失依赖`);
    }
  } catch (error) {
    // depcheck 在找到缺失依赖时也会返回非零退出码，但输出仍然在 stdout 中
    if (error.stdout) {
      const result = JSON.parse(error.stdout);
      if (result.missing) {
        let keysArray = Object.keys(result.missing).filter(key => !key.includes('@dot-present'));
        if (keysArray.length === 0) {
          console.log(`${pkg} ✅没有缺失依赖`);
        } else {
          console.log(`${pkg} ❌缺失依赖:`, keysArray);
          addDepsToPackageJson(pkg, keysArray);
        }
      }
    } else {
      console.error(`${pkg} 执行失败:`, error.message);
    }
  }
})

function addDepsToPackageJson(pkg, deps) {
  const pkgPath = path.join(packagesDir, pkg, 'package.json');
  const pkgJson = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));

  // depcheck 返回的 versions 是源码中引入的版本范围，但通常是 ['*']，建议手动确认版本
  // 这里先标记为 "*" 或从根目录的 package.json 或 lock 文件获取实际版本
  const mainPkgJson = JSON.parse(fs.readFileSync(mainPkgJsonPath, 'utf-8'));
  const depMap = { ...mainPkgJson.dependencies, ...mainPkgJson.devDependencies };
  
  deps.forEach((dep) => {
    pkgJson.dependencies = pkgJson.dependencies || {};
    pkgJson.dependencies[dep] = depMap[dep] || '*';
  });
    
  fs.writeFileSync(pkgPath, JSON.stringify(pkgJson, null, 2));
}