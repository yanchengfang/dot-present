import type { ExtractPropTypes } from "vue";
// ExtractPropTypes 是 vue3 所提供的一个工具类型用于从 vue 组件的 props 对象中提取 ts 类型

export const buttonProps = {
  type: {
    type: String,
    default: "default"
  },
  plain: {
    type: Boolean,
    default: false
  },
  round: {
    type: Boolean,
    default: false
  },
  circle: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  icon: {
    type: String,
    default: ""
  }
}

export type ButtonPropsType = ExtractPropTypes<typeof buttonProps>;
