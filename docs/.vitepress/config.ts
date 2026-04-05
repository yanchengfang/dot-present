import { defineConfig } from 'vitepress'
import vueJsx from '@vitejs/plugin-vue-jsx'

// 仅本文件会被加载；多语言见 https://vitepress.dev/guide/i18n
export default defineConfig({
  vite: {
    plugins: [vueJsx()],
  },
  locales: {
    root: {
      label: '简体中文',
      lang: 'zh-CN',
      title: 'Dot Present',
      description: 'Vue 3 组件库',
      themeConfig: {
        nav: [
          { text: '指南', link: '/guide/' },
          { text: '组件', link: '/components/' },
        ],
        sidebar: [
          {
            text: '使用指南',
            link: '/guide/index.md',
            items: [
              { text: '更新日志', link: '/guide/update-logs' },
              { text: 'VitePress 使用指南', link: '/guide/vitepress' },
              { text: 'API 示例', link: '/guide/api-examples' },
              { text: 'Markdown 示例', link: '/guide/markdown-examples' },
            ]
          },
          {
            text: '组件总览',
            link: '/components/index.md',
            items: [
              {
                text: '通用',
                items: [
                  { text: 'Button 按钮', link: '/components/common/button' },
                  { text: 'Card 卡片', link: '/components/common/card' },
                ],
              },
              {
                text: '导航',
                items: [{ text: 'Tabs 标签页', link: '/components/navigation/tabs' }],
              },
              {
                text: '表单',
                items: [{ text: 'Form 表单', link: '/components/form/form' }],
              },
              {
                text: '数据展示',
                items: [
                  { text: 'LazyLoad 图片懒加载', link: '/components/data-display/lazy-load' },
                ],
              },
              {
                text: '进阶组件',
                items: [
                  { text: 'VirtualList 虚拟列表 (React)', link: '/components/advanced/virtual-list' },
                  { text: 'VirtualList V2 (Vue / JSX)', link: '/components/advanced/virtual-list-v2' },
                ],
              },
            ],
          }
        ],
        socialLinks: [
          { icon: 'github', link: 'https://github.com/vuejs/vitepress' }
        ],
        docFooter: {
          prev: '上一页',
          next: '下一页'
        },
        outline: {
          label: '本页目录'
        }
      }
    },
    en: {
      label: 'English',
      lang: 'en',
      link: '/en/',
      title: 'Dot Present',
      description: 'A Vue 3 component library',
      themeConfig: {
        nav: [
          { text: 'Guide', link: '/en/api-examples' },
          { text: 'Components', link: '/en/markdown-examples' }
        ],
        sidebar: [
          {
            text: 'Guide',
            items: [
              { text: 'Runtime API Examples', link: '/en/api-examples' }
            ]
          },
          {
            text: 'Components',
            items: [
              { text: 'Markdown Examples', link: '/en/markdown-examples' }
            ]
          }
        ],
        socialLinks: [
          { icon: 'github', link: 'https://github.com/vuejs/vitepress' }
        ],
        docFooter: {
          prev: 'Previous',
          next: 'Next'
        },
        outline: {
          label: 'On this page'
        }
      }
    },
  }
})
