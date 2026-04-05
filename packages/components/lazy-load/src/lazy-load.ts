import type { ExtractPropTypes } from "vue";

export const lazyLoadProps = {
  // 图片地址
  src: {
    type: String,
    required: true,
  },
  // 占位图地址
  placeholder: {
    type: String,
    default: "",
  },
  // 错误兜底图地址
  error: {
    type: String,
    default: "",
  },
  // 图片alt文本
  alt: {
    type: String,
    default: "",
  },
  // 是否使用浏览器原生懒加载
  native: {
    type: Boolean,
    default: false,
  },
  // 根边距（IntersectionObserver rootMargin）
  rootMargin: {
    type: String,
    default: "0px 0px 50px 0px", // 提前50px加载
  },
  // 阈值（0-1）
  threshold: {
    type: Number,
    default: 0,
  },
  // 淡入动画时长（ms）
  duration: {
    type: Number,
    default: 300,
  },
  // 图片样式
  imgStyle: {
    type: Object,
    default: () => ({}),
  },
  // 容器类名
  containerClass: {
    type: String,
    default: "",
  },
};

export type LazyLoadPropsType = ExtractPropTypes<typeof lazyLoadProps>;

// 图片加载状态
export type LoadState = "loading" | "loaded" | "error";
