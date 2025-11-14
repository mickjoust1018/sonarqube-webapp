<template>
  <div class="admin-container">
    <div class="admin-header-wrapper">
      <GlobalHeader />
      <div id="component-nav-portal"></div>
    </div>
    <div class="admin-content">
      <!-- SettingsNav 通过 Teleport 渲染到 portal -->
      <Teleport to="#component-nav-portal" v-if="adminPages.length > 0">
        <SettingsNav
          :extensions="adminPages"
          :pending-plugins="pendingPlugins"
          :system-status="systemStatus"
        />
      </Teleport>

      <!-- 加载状态 -->
      <div v-if="!adminPages.length" class="loading-container">
        <el-loading :loading="true" text="加载中..." />
      </div>

      <!-- 主要内容 -->
      <div v-else>
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import GlobalHeader from '@/components/layout/GlobalHeader.vue'
import SettingsNav from '@/components/nav/SettingsNav.vue'
import { getSettingsNavigation } from '@/libs/commons/api/navigation'
import { getPendingPlugins } from '@/libs/commons/api/plugins'
import { getSystemStatus, waitSystemUPStatus } from '@/libs/commons/api/system'
import { useAppStore } from '@/stores/app'
import type { Extension } from '@/libs/commons/api/navigation'

const router = useRouter()
const appStore = useAppStore()

const adminPages = ref<Extension[]>([])
const pendingPlugins = ref({
  installing: 0,
  removing: 0,
  updating: 0,
})
const systemStatus = ref<
  'UP' | 'DOWN' | 'RESTARTING' | 'DB_MIGRATION_NEEDED' | 'DB_MIGRATION_RUNNING'
>('UP')
let statusCheckTimer: number | undefined

// 检查权限
function checkPermissions() {
  if (!appStore.appState?.canAdmin) {
    const returnTo = encodeURIComponent(window.location.pathname + window.location.search)
    router.push(`/sessions/new?return_to=${returnTo}`)
  }
}

// 获取设置导航
async function fetchNavigationSettings() {
  try {
    const result = await getSettingsNavigation()
    adminPages.value = result.extensions
  } catch (error) {
    console.error('Failed to fetch navigation settings:', error)
  }
}

// 获取待处理插件
async function fetchPendingPlugins() {
  try {
    const result = await getPendingPlugins()
    pendingPlugins.value = {
      installing: result.installing || 0,
      removing: result.removing || 0,
      updating: result.updating || 0,
    }
  } catch (error) {
    console.error('Failed to fetch pending plugins:', error)
  }
}

// 获取系统状态
async function fetchSystemStatus() {
  try {
    const result = await getSystemStatus()
    systemStatus.value = result.status

    if (result.status === 'RESTARTING') {
      waitRestartingDone()
    }
  } catch (error) {
    console.error('Failed to fetch system status:', error)
  }
}

// 等待重启完成
async function waitRestartingDone() {
  try {
    const result = await waitSystemUPStatus()
    systemStatus.value = result.status
    if (result.status === 'UP') {
      window.location.reload()
    } else {
      // 继续等待
      statusCheckTimer = window.setTimeout(() => {
        waitRestartingDone()
      }, 3000)
    }
  } catch (error) {
    console.error('Failed to wait system UP:', error)
  }
}

onMounted(() => {
  checkPermissions()
  if (appStore.appState?.canAdmin) {
    fetchNavigationSettings()
    fetchPendingPlugins()
    fetchSystemStatus()
  }
})

onUnmounted(() => {
  if (statusCheckTimer) {
    clearTimeout(statusCheckTimer)
  }
})
</script>

<style scoped>
.admin-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.admin-header-wrapper {
  position: sticky;
  top: 0;
  z-index: 1000;
  background-color: #fff;
}

#component-nav-portal {
  /* Portal 锚点，SettingsNav 会渲染到这里 */
}

.admin-content {
  flex: 1;
  overflow: auto;
  padding: 20px;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}
</style>
