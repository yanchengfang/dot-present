import type { ExtractPropTypes, PropType } from "vue";

// 表单验证规则类型
export interface FormRule {
  required?: boolean;
  message?: string;
  min?: number;
  max?: number;
  pattern?: RegExp;
  validator?: (value: any) => boolean | string;
}

// 表单字段配置类型
export interface FormField {
  key: string;
  label: string;
  type: "input" | "select" | "textarea" | "checkbox" | "radio";
  placeholder?: string;
  options?: { label: string; value: any }[]; // 用于 select/radio/checkbox
  rules?: FormRule[];
  defaultValue?: any;
}

export const formProps = {
  // 表单数据模型
  model: {
    type: Object as PropType<Record<string, any>>,
    default: () => ({}),
  },
  // 字段配置数组
  fields: {
    type: Array as PropType<FormField[]>,
    default: () => [],
  },
  // 标签宽度
  labelWidth: {
    type: String,
    default: "100px",
  },
  // 表单布局
  layout: {
    type: String as PropType<"horizontal" | "vertical" | "inline">,
    default: "horizontal",
  },
  // 是否显示重置按钮
  showReset: {
    type: Boolean,
    default: true,
  },
  // 提交按钮文本
  submitText: {
    type: String,
    default: "提交",
  },
  // 重置按钮文本
  resetText: {
    type: String,
    default: "重置",
  },
};

export type FormPropsType = ExtractPropTypes<typeof formProps>;
