<template>
  <div class="component-nav">
    <el-menu
      mode="horizontal"
      :default-active="activeMenu"
      class="component-nav-menu"
      @select="handleMenuSelect"
    >
      <el-menu-item index="overview">
        <el-icon><Document /></el-icon>
        <span>概览</span>
      </el-menu-item>
      <el-menu-item index="issues">
        <el-icon><Warning /></el-icon>
        <span>问题</span>
        <el-badge v-if="component.needIssueSync" :value="1" class="item" />
      </el-menu-item>
      <el-menu-item index="code">
        <el-icon><DocumentCopy /></el-icon>
        <span>代码</span>
      </el-menu-item>
      <el-menu-item index="activity">
        <el-icon><Clock /></el-icon>
        <span>活动</span>
      </el-menu-item>
      <el-menu-item v-if="component.configuration?.showSettings" index="admin">
        <el-icon><Setting /></el-icon>
        <span>设置</span>
      </el-menu-item>
    </el-menu>

    <!-- 任务进度指示 -->
    <div v-if="isInProgress || isPending" class="task-indicator">
      <el-icon class="is-loading"><Loading /></el-icon>
      <span>{{ isPending ? '等待中...' : '分析中...' }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Document, Warning, DocumentCopy, Clock, Setting, Loading } from '@element-plus/icons-vue'
import type { Component } from '@/libs/commons/types/components'

interface Props {
  component: Component
  isInProgress: boolean
  isPending: boolean
}

defineProps<Props>()
const route = useRoute()
const router = useRouter()

const activeMenu = computed(() => {
  const path = route.path
  // 精确匹配项目路由
  if (path.match(/^\/project\/[^/]+$/)) return 'overview'
  if (path.match(/^\/project\/[^/]+\/issues/)) return 'issues'
  if (path.match(/^\/project\/[^/]+\/code/)) return 'code'
  if (path.match(/^\/project\/[^/]+\/activity/)) return 'activity'
  if (path.match(/^\/project\/[^/]+\/admin/)) return 'admin'
  return ''
})

function handleMenuSelect(key: string) {
  // 统一使用 id 参数（路由定义中使用的是 :id）
  const projectId = route.params.id as string
  if (!projectId) return

  const routes: Record<string, string> = {
    overview: `/project/${projectId}`,
    issues: `/project/${projectId}/issues`,
    code: `/project/${projectId}/code`,
    activity: `/project/${projectId}/activity`,
    admin: `/project/${projectId}/admin`,
  }

  const targetRoute = routes[key]
  if (targetRoute) {
    router.push(targetRoute)
  }
}
</script>

<style scoped>
.component-nav {
  display: flex;
  align-items: center;
  background-color: #fff;
  border-bottom: 1px solid #e4e7ed;
  padding: 0 20px;
  min-height: 48px;
  width: 100%;
}

.component-nav-menu {
  flex: 1;
  border-bottom: none;
}

.component-nav-menu :deep(.el-menu-item) {
  white-space: nowrap;
  overflow: visible;
}

.component-nav-menu :deep(.el-menu-item span) {
  display: inline-block;
  white-space: nowrap;
}

.task-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 16px;
  color: #409eff;
  font-size: 14px;
}

.task-indicator .el-icon {
  animation: rotating 2s linear infinite;
}

@keyframes rotating {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
