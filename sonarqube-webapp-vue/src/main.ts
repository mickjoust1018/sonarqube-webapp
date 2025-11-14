import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import en from 'element-plus/dist/locale/en.mjs'
import { VueQueryPlugin } from '@tanstack/vue-query'
import i18n from './i18n'
import router from './router'
import App from './App.vue'
import './styles/main.css'

const app = createApp(App)

// 从 localStorage 读取保存的语言设置
const savedLocale = localStorage.getItem('locale') || 'zh'
if (savedLocale && i18n.global.locale.value !== savedLocale) {
  i18n.global.locale.value = savedLocale as 'zh' | 'en'
}

// 注册所有 Element Plus 图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(createPinia())
app.use(router)
app.use(i18n)
app.use(ElementPlus, {
  locale: savedLocale === 'zh' ? zhCn : en,
})
app.use(VueQueryPlugin)

app.mount('#app')
