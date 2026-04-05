import { withInstall } from "../utils/with-install";
import LazyLoad from "./src/lazy-load.vue";

export const DotLazyLoad = withInstall(LazyLoad);
export default DotLazyLoad;

export type { LoadState } from "./src/lazy-load";
