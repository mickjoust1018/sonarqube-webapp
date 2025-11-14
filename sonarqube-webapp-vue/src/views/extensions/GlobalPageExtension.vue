<template>
  <div class="global-page-extension">
    <div v-if="loading" class="loading-container">
      <el-loading :loading="true" text="加载中..." />
    </div>
    <div v-else-if="!extension" class="not-found-container">
      <el-empty description="扩展页面未找到" />
    </div>
    <div v-else ref="extensionContainer" class="extension-container"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { getExtensionStart } from '@/libs/commons/api/extensions'
import type { ExtensionStartMethod } from '@/libs/commons/types/extensions'
import { QueryClient } from '@tanstack/react-query'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()

const extensionContainer = ref<HTMLElement>()
const loading = ref(true)
const stopExtension = ref<Function | null>(null)
const queryClient = new QueryClient()

const pluginKey = computed(() => route.params.pluginKey as string)
const extensionKey = computed(() => route.params.extensionKey as string)
const fullKey = computed(() => `${pluginKey.value}/${extensionKey.value}`)

const extension = computed(() => {
  const globalPages = appStore.appState?.globalPages || []
  return globalPages.find((p) => p.key === fullKey.value)
})

// 特殊处理：如果访问 /extension/tasks，重定向到 /tasks
watch(
  [pluginKey, extensionKey],
  () => {
    if (extensionKey.value === 'tasks' && (!pluginKey.value || pluginKey.value === 'tasks')) {
      router.replace('/tasks')
      return
    }
    loadExtension()
  },
  { immediate: true }
)

async function loadExtension() {
  if (!extension.value) {
    loading.value = false
    return
  }

  loading.value = true
  try {
    const start = await getExtensionStart(fullKey.value)
    if (!start || !extensionContainer.value) {
      loading.value = false
      return
    }

    // 停止之前的扩展
    if (stopExtension.value) {
      stopExtension.value()
      stopExtension.value = null
    }

    // 启动扩展
    const result = start({
      appState: appStore.appState,
      availableFeatures: appStore.availableFeatures,
      baseUrl: window.baseUrl || '',
      currentUser: appStore.currentUser,
      el: extensionContainer.value,
      intl: {
        formatMessage: (descriptor: any, values?: any) => {
          // 简单的消息格式化，实际应该使用 i18n
          return descriptor.id || descriptor.defaultMessage || ''
        },
      } as any,
      l10nBundle: appStore.l10nBundle,
      location: {
        pathname: route.path,
        search: route.fullPath.split('?')[1] || '',
        query: route.query,
        hash: route.hash,
      },
      queryClient,
      router: {
        push: (to: string | { pathname: string; search?: string }) => {
          if (typeof to === 'string') {
            router.push(to)
          } else {
            router.push({ path: to.pathname, query: new URLSearchParams(to.search || '').toString() })
          }
        },
        replace: (to: string | { pathname: string; search?: string }) => {
          if (typeof to === 'string') {
            router.replace(to)
          } else {
            router.replace({ path: to.pathname, query: new URLSearchParams(to.search || '').toString() })
          }
        },
        setSearchParams: (fn: (params: URLSearchParams) => URLSearchParams) => {
          const params = new URLSearchParams(route.fullPath.split('?')[1] || '')
          const newParams = fn(params)
          router.replace({ query: Object.fromEntries(newParams) })
        },
      } as any,
      theme: {} as any,
      updateCurrentUserHomepage: () => {
        // 占位函数
      },
    })

    if (typeof result === 'function') {
      stopExtension.value = result
    }
  } catch (error) {
    console.error('Failed to load extension:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (extensionKey.value !== 'tasks' || (pluginKey.value && pluginKey.value !== 'tasks')) {
    loadExtension()
  }
})

onUnmounted(() => {
  if (stopExtension.value) {
    stopExtension.value()
    stopExtension.value = null
  }
})

// 监听路由变化
watch(
  () => route.fullPath,
  () => {
    if (extension.value) {
      loadExtension()
    }
  }
)
</script>

<style scoped>
.global-page-extension {
  min-height: 100%;
}

.loading-container,
.not-found-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
}

.extension-container {
  min-height: 100%;
}
</style>
