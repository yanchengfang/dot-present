import type { ExtractPropTypes } from "vue";

export const cardProps = {
  // 卡片的宽度
  width: {
    type: Number,
    default: 0,
  },
  // 卡片图片资源链接
  imgSrc: {
    type: String,
    default: "",
    required: true,
  },
  // 卡片图片高度
  imgHeight: {
    type: Number,
    default: 0,
  },
  // 卡片概要
  summary: {
    type: String,
    default: "",
  },
};

export type CardPropsType = ExtractPropTypes<typeof cardProps>;