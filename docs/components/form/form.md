# Form 表单

基于字段配置驱动渲染的表单组件，内置输入框、文本域、下拉、单选、复选等类型与校验规则，支持横向、纵向与行内布局。

<script setup lang="ts">
import { reactive } from 'vue'

const demoHorizontal = reactive({
  username: '',
  email: '',
})

const fieldsHorizontal = [
  {
    key: 'username',
    label: '用户名',
    type: 'input' as const,
    rules: [{ required: true, message: '请输入用户名' }],
  },
  {
    key: 'email',
    label: '邮箱',
    type: 'input' as const,
    rules: [
      { required: true, message: '请输入邮箱' },
      { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: '邮箱格式不正确' },
    ],
  },
]

const demoVertical = reactive({
  region: '',
  remark: '',
})

const fieldsVertical = [
  {
    key: 'region',
    label: '地区',
    type: 'select' as const,
    options: [
      { label: '华东', value: 'east' },
      { label: '华北', value: 'north' },
      { label: '华南', value: 'south' },
    ],
    rules: [{ required: true, message: '请选择地区' }],
  },
  {
    key: 'remark',
    label: '备注',
    type: 'textarea' as const,
    rules: [{ max: 120, message: '备注不超过 120 字' }],
  },
]

const onSubmitLog = (data: Record<string, unknown>) => {
  console.log('submit', data)
}
</script>

## 横向布局（默认）

`layout="horizontal"` 时标签与控件同一行，适合中等宽度表单。

<div class="dp-demo">
  <DotForm
    :model="demoHorizontal"
    :fields="fieldsHorizontal"
    layout="horizontal"
    label-width="88px"
    submit-text="提交"
    @submit="onSubmitLog"
  />
</div>

```vue
<script setup lang="ts">
import { reactive } from 'vue'
import Form from '@dot-present/components/form'

const model = reactive({ username: '', email: '' })
const fields = [
  { key: 'username', label: '用户名', type: 'input', rules: [{ required: true }] },
  { key: 'email', label: '邮箱', type: 'input', rules: [{ required: true }] },
]

const onSubmit = (data: Record<string, unknown>) => {
  console.log(data)
}
</script>

<template>
  <Form
    :model="model"
    :fields="fields"
    layout="horizontal"
    label-width="88px"
    @submit="onSubmit"
  />
</template>
```

## 纵向布局

`layout="vertical"` 时标签在上、控件在下，适合窄屏或字段较多场景。

<div class="dp-demo">
  <DotForm
    :model="demoVertical"
    :fields="fieldsVertical"
    layout="vertical"
    label-width="72px"
    :show-reset="true"
    @submit="onSubmitLog"
  />
</div>

## 字段类型与校验

支持的 `field.type` 包括：`input`、`textarea`、`select`、`radio`、`checkbox`。`rules` 中可使用 `required`、`min`、`max`、`pattern`、`validator` 等，行为与组件内实现一致。

## 全局注册（可选）

```ts
import dot from '@dot-present/components'
import '@dot-present/theme-chalk/dist/index.css'

app.use(dot)
```

## API

### Props

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| model | 表单数据模型（与 `fields[].key` 对应） | `Record<string, any>` | `{}` |
| fields | 字段配置列表 | `FormField[]` | `[]` |
| label-width | 标签宽度（如横向布局时） | `string` | `'100px'` |
| layout | 布局方式 | `'horizontal' \| 'vertical' \| 'inline'` | `'horizontal'` |
| show-reset | 是否显示重置按钮 | `boolean` | `true` |
| submit-text | 提交按钮文案 | `string` | `'提交'` |
| reset-text | 重置按钮文案 | `string` | `'重置'` |

### FormField

| 字段 | 说明 |
| --- | --- |
| key | 字段键，对应 `model` 中的属性名 |
| label | 标签文案 |
| type | `input` \| `textarea` \| `select` \| `radio` \| `checkbox` |
| placeholder | 占位提示 |
| options | `select` / `radio` / `checkbox` 的选项 |
| rules | 校验规则数组 |
| defaultValue | 初始默认值 |

### FormRule

| 属性 | 说明 |
| --- | --- |
| required | 是否必填 |
| message | 错误提示文案 |
| min / max | 字符串长度下限 / 上限 |
| pattern | 正则校验 |
| validator | 自定义校验，返回 `true` 或错误文案字符串 |

### 事件

| 事件名 | 说明 | 参数 |
| --- | --- | --- |
| submit | 校验通过后提交 | `(formData: Record<string, any>)` |
| reset | 点击重置 | — |
| change | 内部数据变化 | `(formData: Record<string, any>)` |

### 暴露方法（`ref`）

| 方法 | 说明 |
| --- | --- |
| validate | 校验整个表单 |
| reset | 重置为初始值并清空错误 |
| getValues | 获取当前表单值副本 |
| setValues | 合并写入表单值 |
