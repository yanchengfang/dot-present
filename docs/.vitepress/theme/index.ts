import DefaultTheme from 'vitepress/theme'
import Button from '@dot-present/components/button'
import Card from '@dot-present/components/card'
import Form from '@dot-present/components/form'
import LazyLoad from '@dot-present/components/lazy-load'
import Tabs from '@dot-present/components/tabs'
import { VirtualList } from '@dot-present/virtual-list-v2'
import '@dot-present/theme-chalk/dist/index.css'
import './components-demo.css'

export default {
  ...DefaultTheme,
  enhanceApp(ctx) {
    DefaultTheme.enhanceApp?.(ctx)
    // 注册组件库入口，便于在 Markdown 中直接使用 Dot 前缀组件
    ctx.app.use(Button)
    ctx.app.use(Card)
    ctx.app.use(Form)
    ctx.app.use(LazyLoad)
    ctx.app.use(Tabs)
    ctx.app.component('DotVirtualList', VirtualList)
  },
}
