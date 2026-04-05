import Button from "./button";
import Card from "./card";
import Form from "./form";
import LazyLoad from "./lazy-load";
import Tabs from "./tabs";

import type { App, Plugin } from "vue";

const components = [Button, Card, Form, LazyLoad, Tabs];

const install = (app: App) => {
  components.forEach((component) => {
    app.use(component);
  });
};

const dot: Plugin = {
  install,
};

export default dot;

// 按需导出
export { Button, Card, Form, LazyLoad, Tabs };

// 类型导出
export type { FormField, FormRule } from "./form/src/form";
export type { LoadState } from "./lazy-load/src/lazy-load";
export type { TabItem } from "./tabs/src/tabs";