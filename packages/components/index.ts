import Button from "./button";
import Card from "./card";

import type { App, Plugin } from "vue";

const components = [Button, Card];

const install = (app: App) => {
  components.forEach((component) => {
    app.use(component);
  });
};

const dot: Plugin = {
  install,
};

export default dot;