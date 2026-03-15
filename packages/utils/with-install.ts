// 该文件会导出一个工具方法，该方法用于组件的安装
import type { App, Plugin } from "vue";

// 这里定义了一个新的 SFCWithInstall 的类型
// 这是一个泛型类型，代表的是一个即是类型 T 又是 Plugin 类型的类型
// 也就是说，这个类型的对象既有 T 类型的所有属性和方法，也有 Plugin 的所有属性和方法
export type SFCWithInstall<T> = T & Plugin;

export const withInstall = <T>(com: T) => {
  (com as SFCWithInstall<T>).install = function(app: App) {
    app.component((com as any).name, com as SFCWithInstall<T>);
  };
  return com as SFCWithInstall<T>;
};

// withInstall(MyComponent) ---> 这里其实就是对这个组件做一个增强效果，添加了一个 install 方法

// 之后在其他项目中：

// app.use(MyComponent) ---> 这里就会调用 MyComponent 组件的 install 方法
// 而 install 方法中，会调用 app.component 方法，将 MyComponent 组件注册为全局组件
// 所以，之后在其他地方，就可以直接使用 <MyComponent /> 标签了
