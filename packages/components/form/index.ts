import { withInstall } from "../utils/with-install";
import Form from "./src/form.vue";

export const DotForm = withInstall(Form);
export default DotForm;

export type { FormField, FormRule } from "./src/form";
