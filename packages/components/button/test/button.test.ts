// 该文件用于书写测试用例

import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import Button from "../src/button.vue";

describe("测试 Button 组件", () => {
  // 一个一个的测试用例
  // 3A 原则 arrange、action、assert
  it("1.渲染按钮的时候有默认type", () => {
    // 准备工作
    const wrapper = mount(Button);
    // 断言
    expect(wrapper.classes()).toContain("dot-button");
    expect(wrapper.classes()).toContain("dot-button-default");
  });

  it("2.渲染plain属性的按钮", () => {
    const wrapper = mount(Button, {
      props: {
        plain: true
      }
    })
    expect(wrapper.classes()).toContain("is-plain");
  })

  it("3.渲染disabled类型按钮", () => {
    const wrapper = mount(Button, { props: { disabled: true } });
    expect(wrapper.classes()).toContain("is-disabled");
    expect(wrapper.attributes()).toHaveProperty("disabled");
  });

  it("4.渲染icon类型的按钮", () => {
    const wrapper = mount(Button, { props: { icon: "home" } });
    expect(wrapper.find("i").classes()).toContain("dot-icon-home");
  });

  it("5.测试slot插槽是否正常工作", () => {
    const wrapper = mount(Button, {
      slots: {
        default: "点击我",
      },
    });
    expect(wrapper.text()).toContain("点击我");
  });

  // 测试事件是否工作正常
  it("6.测试按钮事件", async ()=>{
    const wrapper = mount(Button);
    await wrapper.trigger("click");
    expect(wrapper.emitted()).toHaveProperty("click");
  });
})