<template>
  <el-dropdown @command="handleLanguageChange" trigger="click">
    <el-button link class="language-switcher">
      <span>{{ currentLanguageLabel }}</span>
      <el-icon><ArrowDown /></el-icon>
    </el-button>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item
          v-for="lang in languages"
          :key="lang.value"
          :command="lang.value"
          :class="{ 'is-active': lang.value === currentLocale }"
        >
          {{ lang.label }}
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ArrowDown } from '@element-plus/icons-vue'
import { useI18n } from '@/composables/useI18n'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import en from 'element-plus/dist/locale/en.mjs'
import { ElMessage } from 'element-plus'

const { locale, t } = useI18n()

const languages = [
  { value: 'zh', label: '中文' },
  { value: 'en', label: 'English' },
]

const currentLocale = computed(() => locale.value)

const currentLanguageLabel = computed(() => {
  const lang = languages.find(l => l.value === currentLocale.value)
  return lang?.label || '中文'
})

function handleLanguageChange(lang: string) {
  locale.value = lang
  // 保存到 localStorage
  localStorage.setItem('locale', lang)

  // 更新 Element Plus 的 locale
  const elementPlusLocale = lang === 'zh' ? zhCn : en
  // 注意：Element Plus 的 locale 需要在全局更新，这里只是切换了 i18n 的 locale
  // Element Plus 的 locale 在 main.ts 中设置，如果需要动态切换需要更复杂的实现

  ElMessage.success(lang === 'zh' ? '语言已切换为中文' : 'Language switched to English')
}
</script>

<style scoped>
.language-switcher {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  color: #303133;
  font-size: 14px;
}

.language-switcher:hover {
  color: #409eff;
}

:deep(.el-dropdown-menu__item.is-active) {
  color: #409eff;
  font-weight: 500;
}
</style>
