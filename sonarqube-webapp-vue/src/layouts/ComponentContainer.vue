<template>
  <div class="component-container">
    <div class="component-content">
      <!-- ComponentNav 通过 Teleport 渲染到 portal，只在项目页面且有组件数据时显示 -->
      <Teleport
        to="#component-nav-portal"
        v-if="component && !isFile(component.qualifier) && componentKey"
      >
        <ComponentNav
          :component="component"
          :is-in-progress="isInProgress"
          :is-pending="isPending"
        />
      </Teleport>

      <!-- 加载状态 -->
      <div v-if="loading" class="loading-container">
        <el-loading :loading="true" text="加载中..." />
      </div>

      <!-- 404 处理 -->
      <div v-else-if="!component" class="not-found-container">
        <el-empty description="组件未找到" />
      </div>

      <!-- 主要内容 -->
      <div v-else>
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ComponentNav from '@/components/nav/ComponentNav.vue'
import { getComponentNavigation } from '@/libs/commons/api/navigation'
import { getComponentData } from '@/libs/commons/api/components'
import { getTasksForComponent } from '@/libs/commons/api/ce'
import { provideComponentContext } from '@/composables/useComponentContext'
import { useAppStore } from '@/stores/app'
import type { Component, Task, ComponentContextShape } from '@/libs/commons/types/components'
import { TaskStatuses, TaskTypes } from '@/libs/commons/types/components'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()

const component = ref<Component>()
const projectComponent = ref<Component>()
const currentTask = ref<Task>()
const tasksInProgress = ref<Task[]>()
const loading = ref(true)
const isPending = ref(false)
const watchStatusTimer = ref<number>()

const componentKey = computed(() => {
  // 支持 id 和 projectKey 两种参数名
  return (route.params.id || route.params.projectKey) as string
})
const branch = computed(() => route.query.branch as string | undefined)
const pullRequest = computed(() => route.query.pullRequest as string | undefined)

// 合并标签的组件
const componentWithTags = computed(() => {
  if (!component.value) return undefined
  return {
    ...component.value,
    tags: projectComponent.value?.tags ?? component.value.tags ?? [],
  }
})

// 是否正在处理中
const isInProgress = computed(() => {
  return tasksInProgress.value ? tasksInProgress.value.length > 0 : false
})

// 检查是否是文件
function isFile(qualifier: string): boolean {
  return qualifier === 'FIL' || qualifier === 'UTS'
}

// 获取组件数据
async function fetchComponent(branchName?: string) {
  if (!componentKey.value) return

  // 如果组件键改变，显示加载状态
  if (component.value?.key !== componentKey.value) {
    loading.value = true
  }

  const targetBranch = appStore.availableFeatures.includes('BRANCH_SUPPORT')
    ? (branchName ?? branch.value)
    : undefined

  try {
    const [nav, componentData, projectData] = await Promise.all([
      getComponentNavigation({
        component: componentKey.value,
        branch: targetBranch,
        pullRequest: pullRequest.value,
      }),
      getComponentData({
        component: componentKey.value,
        branch: targetBranch,
        pullRequest: pullRequest.value,
      }),
      getComponentData({
        component: componentKey.value,
      }),
    ])

    // 合并导航和组件数据
    const componentWithQualifier = {
      ...nav,
      ...componentData.component,
      qualifier:
        componentData.component.breadcrumbs[componentData.component.breadcrumbs.length - 1]
          ?.qualifier || componentData.component.qualifier,
    }

    const projectComponentWithQualifier = {
      ...nav,
      ...projectData.component,
      qualifier:
        projectData.component.breadcrumbs[projectData.component.breadcrumbs.length - 1]
          ?.qualifier || projectData.component.qualifier,
    }

    component.value = componentWithQualifier as Component
    projectComponent.value = projectComponentWithQualifier as Component
  } catch (error: any) {
    console.error('Failed to fetch component:', error)
    if (error?.status === 403) {
      // 权限不足，重定向到登录页
      router.push('/sessions/new')
    }
  } finally {
    loading.value = false
  }
}

// 获取任务状态
async function fetchStatus(componentKey: string) {
  try {
    const { current, queue } = await getTasksForComponent(componentKey)

    // 过滤相关任务
    const reportRelatedTasks = queue.filter(task => {
      const isReportRelated = [
        TaskTypes.Report,
        TaskTypes.AppRefresh,
        TaskTypes.ViewRefresh,
      ].includes(task.type as TaskTypes)

      if (!isReportRelated) return false

      // 检查是否匹配当前分支/PR
      if (pullRequest.value) {
        return task.pullRequest === pullRequest.value
      }
      if (branch.value) {
        return task.branch === branch.value
      }
      return !task.branch && !task.pullRequest
    })

    const pendingTasks = reportRelatedTasks.filter(task => task.status === TaskStatuses.Pending)
    const inProgressTasks = reportRelatedTasks.filter(
      task => task.status === TaskStatuses.InProgress
    )

    isPending.value = pendingTasks.length > 0
    currentTask.value = current as Task | undefined
    tasksInProgress.value = inProgressTasks

    // 如果有任务在进行中，设置轮询
    if (inProgressTasks.length > 0 || pendingTasks.length > 0) {
      scheduleStatusCheck(componentKey)
    }
  } catch (error) {
    console.error('Failed to fetch status:', error)
  }
}

// 调度状态检查
function scheduleStatusCheck(componentKey: string) {
  if (watchStatusTimer.value) {
    clearTimeout(watchStatusTimer.value)
  }

  watchStatusTimer.value = window.setTimeout(() => {
    fetchStatus(componentKey)
  }, 3000)
}

// 处理组件变更
function handleComponentChange(changes: Partial<Component>) {
  if (!component.value) return

  if (changes.tags && projectComponent.value) {
    projectComponent.value = {
      ...projectComponent.value,
      tags: changes.tags,
    }
  }

  component.value = { ...component.value, ...changes }
}

// 提供 ComponentContext（响应式）
const componentContext = computed<ComponentContextShape>(() => ({
  component: componentWithTags.value,
  currentTask: currentTask.value,
  isInProgress: isInProgress.value,
  isPending: isPending.value,
  onComponentChange: handleComponentChange,
  fetchComponent,
}))

provideComponentContext(componentContext.value)

// 监听组件键变化
watch(
  componentKey,
  () => {
    if (componentKey.value) {
      fetchComponent()
    }
  },
  { immediate: true }
)

// 监听组件变化，获取状态
watch(
  () => component.value?.key,
  newKey => {
    if (newKey) {
      fetchStatus(newKey)
    }
  }
)

// 更新 context
watch([componentWithTags, currentTask, isInProgress, isPending], () => {
  provideComponentContext(componentContext.value)
})

// 清理定时器
onUnmounted(() => {
  if (watchStatusTimer.value) {
    clearTimeout(watchStatusTimer.value)
  }
})

// Portal 锚点应该在 GlobalContainer 中，这里不需要创建
</script>

<style scoped>
.component-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.component-content {
  flex: 1;
  overflow: auto;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.not-found-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}
</style>
