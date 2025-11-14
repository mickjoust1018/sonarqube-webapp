<template>
  <el-menu
    mode="horizontal"
    :default-active="activeMenu"
    class="global-nav-menu"
    @select="handleMenuSelect"
  >
    <el-menu-item index="projects">
      <el-icon><Document /></el-icon>
      <span>项目</span>
    </el-menu-item>
    <el-menu-item v-if="governanceInstalled" index="portfolios">
      <el-icon><Folder /></el-icon>
      <span>组合</span>
    </el-menu-item>
    <el-menu-item index="issues">
      <el-icon><Warning /></el-icon>
      <span>问题</span>
    </el-menu-item>
    <el-menu-item index="coding_rules">
      <el-icon><DocumentCopy /></el-icon>
      <span>编码规则</span>
    </el-menu-item>
    <el-menu-item index="quality_profiles">
      <el-icon><Setting /></el-icon>
      <span>质量配置</span>
    </el-menu-item>
    <el-menu-item v-if="scaEnabled" index="licenses">
      <el-icon><Lock /></el-icon>
      <span>许可证</span>
    </el-menu-item>
    <el-menu-item index="quality_gates">
      <el-icon><Check /></el-icon>
      <span>质量门</span>
    </el-menu-item>
    <el-menu-item v-if="canAdmin" index="settings">
      <el-icon><Tools /></el-icon>
      <span>设置</span>
    </el-menu-item>
    <el-sub-menu index="more">
      <template #title>
        <span>更多</span>
      </template>
      <el-menu-item index="security_hotspots">
        <el-icon><Lock /></el-icon>
        <span>安全热点</span>
      </el-menu-item>
      <el-menu-item index="component_measures">
        <el-icon><DataAnalysis /></el-icon>
        <span>组件度量</span>
      </el-menu-item>
      <el-menu-item
        v-if="globalPages.length > 0"
        v-for="page in globalPages"
        :key="page.key"
        :index="`extension_${page.key}`"
      >
        <span>{{ page.name }}</span>
      </el-menu-item>
    </el-sub-menu>
  </el-menu>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  Document,
  Warning,
  DocumentCopy,
  Setting,
  Lock,
  Check,
  Tools,
  Folder,
  DataAnalysis,
} from '@element-plus/icons-vue'
import { useAppStore } from '@/stores/app'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()

const activeMenu = computed(() => {
  const path = route.path
  // 精确匹配路由，避免误匹配
  if (path === '/projects' || (path.startsWith('/projects') && !path.startsWith('/project/')))
    return 'projects'
  if (path.startsWith('/portfolios')) return 'portfolios'
  if (path.startsWith('/issues') && !path.startsWith('/project/')) return 'issues'
  if (path.startsWith('/coding_rules')) return 'coding_rules'
  if (path.startsWith('/quality_profiles') || path.startsWith('/profiles'))
    return 'quality_profiles'
  if (path.startsWith('/licenses')) return 'licenses'
  if (path.startsWith('/quality_gates')) return 'quality_gates'
  if (path.startsWith('/admin/settings')) return 'settings'
  if (path.startsWith('/security_hotspots') && !path.startsWith('/project/'))
    return 'security_hotspots'
  if (path.startsWith('/component_measures')) return 'component_measures'
  // 注意：tasks 不在导航菜单中，所以不需要匹配
  return ''
})

const governanceInstalled = computed(() => {
  return appStore.appState?.qualifiers?.includes('VW') || false
})

const scaEnabled = computed(() => {
  return appStore.availableFeatures.includes('SCA')
})

const canAdmin = computed(() => {
  return appStore.appState?.canAdmin || false
})

const globalPages = computed(() => {
  return appStore.appState?.globalPages || []
})

function handleMenuSelect(key: string) {
  if (key.startsWith('extension_')) {
    const pageKey = key.replace('extension_', '')
    const page = globalPages.value.find(p => p.key === pageKey)
    if (page) {
      router.push(`/extension/${page.key}`)
    }
    return
  }

  const routes: Record<string, string> = {
    projects: '/projects',
    portfolios: '/portfolios',
    issues: '/issues',
    coding_rules: '/coding_rules',
    quality_profiles: '/quality_profiles',
    licenses: '/licenses',
    quality_gates: '/quality_gates',
    settings: '/admin/settings',
    security_hotspots: '/security_hotspots',
    component_measures: '/component_measures',
  }

  const targetRoute = routes[key]
  if (targetRoute) {
    router.push(targetRoute)
  }
}
</script>

<style scoped>
.global-nav-menu {
  flex: 1;
  border-bottom: none;
}
</style>
