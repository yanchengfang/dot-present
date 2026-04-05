import type { ExtractPropTypes, PropType } from "vue";

// Tab 配置项类型
export interface TabItem {
  key: string;
  label: string;
  disabled?: boolean;
  closable?: boolean;
}

export const tabsProps = {
  // 当前激活的 tab key
  modelValue: {
    type: String,
    default: "",
  },
  // tab 配置数组
  items: {
    type: Array as PropType<TabItem[]>,
    required: true,
  },
  // 类型样式
  type: {
    type: String as PropType<"line" | "card" | "border-card">,
    default: "line",
  },
  // 标签位置
  position: {
    type: String as PropType<"top" | "right" | "bottom" | "left">,
    default: "top",
  },
  // 是否可关闭
  closable: {
    type: Boolean,
    default: false,
  },
  // 是否可新增
  addable: {
    type: Boolean,
    default: false,
  },
  // 是否延迟渲染未激活面板
  lazy: {
    type: Boolean,
    default: false,
  },
  // 切换前的钩子
  beforeChange: {
    type: Function as PropType<(key: string, oldKey: string) => boolean | Promise<boolean>>,
    default: null,
  },
};

export type TabsPropsType = ExtractPropTypes<typeof tabsProps>;
