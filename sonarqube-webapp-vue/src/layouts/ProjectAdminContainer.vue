<template>
  <main v-if="isProjectAdmin" class="project-admin-container">
    <router-view />
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useComponentContext } from '@/composables/useComponentContext'

const router = useRouter()

let componentContext: ReturnType<typeof useComponentContext> | null = null

try {
  componentContext = useComponentContext()
} catch (error) {
  // ComponentContext 可能不存在，稍后检查
}

const isProjectAdmin = computed(() => {
  if (!componentContext?.component) return false
  return componentContext.component.configuration?.showSettings === true
})

function checkPermissions() {
  // 使用 setTimeout 避免竞态条件
  // 参见 React 版本的注释：SONAR-19437
  setTimeout(() => {
    if (!isProjectAdmin.value) {
      // 权限不足，重定向到登录页
      const returnTo = encodeURIComponent(window.location.pathname + window.location.search)
      router.push(`/sessions/new?return_to=${returnTo}`)
    }
  }, 0)
}

onMounted(() => {
  checkPermissions()
})

watch(
  () => componentContext?.component,
  () => {
    checkPermissions()
  },
  { immediate: true }
)
</script>

<style scoped>
.project-admin-container {
  padding: 20px;
  min-height: 100%;
}
</style>
