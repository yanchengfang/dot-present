import { withInstall } from "../utils/with-install";
import Tabs from "./src/tabs.vue";

export const DotTabs = withInstall(Tabs);
export default DotTabs;

export type { TabItem } from "./src/tabs";
