// 引入需要的库
import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import Card from "../src/card.vue";

const imgSrc = "https://abc.com/abc.png";

describe("测试Card组件", () => {
  // 在测试组件的时候，一般会针对每一个 prop 设计一个测试用例

  // 测试卡片宽度
  it("测试卡片宽度", () => {
    // 3A 原则 arrange、action、assert
    const wrapper = mount(Card, {
      props: {
        width: 300,
        imgSrc,
      },
    });

    expect(wrapper.attributes("style")).toContain("width: 300px;");
  });

  // 测试图片资源
  it("测试图片资源", () => {
    const wrapper = mount(Card, {
      props: {
        imgSrc,
      },
    });

    expect(wrapper.find(".dot-card-img img").attributes("src")).toBe(imgSrc);
  });

  // 测试图片设置高度
  it("测试图片设置高度", () => {
    const wrapper = mount(Card, {
      props: {
        imgSrc,
        imgHeight: 200,
      },
    });

    expect(wrapper.find(".dot-card-img").attributes("style")).toContain(
      "height: 200px"
    );
  });

  // 测试卡片概要
  it("测试卡片概要", () => {
    const summary = "这是一个卡片的概要内容";
    const wrapper = mount(Card, {
      props: {
        summary,
        imgSrc,
      },
    });
    expect(wrapper.find(".dot-card-summary").text()).toBe(summary);
  });

  // 测试插槽
  it("测试summary插槽", () => {
    const summary = "这是一个卡片的概要内容";
    const wrapper = mount(Card, {
      props: {
        imgSrc,
      },
      slots: {
        default: summary,
      },
    });
    expect(wrapper.find(".dot-card-summary").text()).toBe(summary);
  });

  // 测试footer插槽
  it("测试footer插槽", () => {
    const footer = "这是 footer 内容";
    const wrapper = mount(Card, {
      props: {
        imgSrc,
      },
      slots: {
        footer: footer,
      },
    });
    expect(wrapper.find(".dot-card-footer").text()).toBe(footer);
  });
});
