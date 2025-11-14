<template>
  <div class="global-container" :class="{ 'secondary-background': isSecondaryBackground }">
    <A11ySkipLinks />
    <div class="global-header-wrapper">
      <div class="banner-container">
        <SystemAnnouncement />
        <NonProductionDatabaseWarning />
        <IndexationNotification />
        <UpdateNotification :is-global-banner="true" />
      </div>
      <GlobalHeader />
      <div id="component-nav-portal"></div>
    </div>
    <div class="main-content" id="main-content">
      <Workspace>
        <router-view />
      </Workspace>
    </div>
    <GlobalFooter />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import GlobalHeader from '@/components/layout/GlobalHeader.vue'
import GlobalFooter from '@/components/layout/GlobalFooter.vue'
import Workspace from '@/components/workspace/Workspace.vue'
import A11ySkipLinks from '@/components/a11y/A11ySkipLinks.vue'
import SystemAnnouncement from '@/components/notifications/SystemAnnouncement.vue'
import NonProductionDatabaseWarning from '@/components/notifications/NonProductionDatabaseWarning.vue'
import IndexationNotification from '@/components/notifications/IndexationNotification.vue'
import UpdateNotification from '@/components/notifications/UpdateNotification.vue'
import { provideIndexationContext } from '@/composables/useIndexationContext'
import { provideMetricsContext } from '@/composables/useMetricsContext'
import { ref } from 'vue'

const route = useRoute()

// 需要白色背景的页面列表
const PAGES_WITH_SECONDARY_BACKGROUND = [
  '/tutorials',
  '/projects/create',
  '/project/baseline',
  '/project/branches',
  '/project/key',
  '/project/deletion',
  '/project/links',
  '/project/import_export',
  '/project/quality_gate',
  '/project/quality_profiles',
  '/project/webhooks',
  '/admin/webhooks',
  '/project_roles',
  '/admin/permissions',
  '/admin/permission_templates',
  '/project/background_tasks',
  '/admin/background_tasks',
  '/admin/groups',
  '/admin/marketplace',
  '/admin/system',
  '/admin/users',
  '/admin/settings',
  '/admin/settings/encryption',
  '/admin/audit',
  '/admin/projects_management',
  '/account/projects',
]

const isSecondaryBackground = computed(() => {
  return PAGES_WITH_SECONDARY_BACKGROUND.includes(route.path)
})

// 提供 IndexationContext
const indexationStatus = ref<'completed' | 'in_progress' | 'none'>('none')
const indexationCompletedCount = ref(0)
const indexationTotalCount = ref(0)

provideIndexationContext({
  status: indexationStatus,
  completedCount: indexationCompletedCount,
  totalCount: indexationTotalCount,
})

// 提供 MetricsContext
const metrics = ref<any[]>([])

provideMetricsContext({
  metrics,
  getMetric: (key: string) => {
    return metrics.value.find(m => m.key === key)
  },
})
</script>

<style scoped>
.global-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  min-height: 100vh;
  background-color: #f5f5f5; /* 默认 primary 背景 */
}

.global-container.secondary-background {
  background-color: #fff; /* secondary 背景 */
}

.global-header-wrapper {
  position: sticky;
  top: 0;
  z-index: 1000;
  background-color: #fff;
}

.banner-container {
  /* 通知横幅容器 */
}

.banner-container > * {
  position: relative;
}

#component-nav-portal {
  /* Portal 锚点，ComponentNav 会渲染到这里 */
  width: 100%;
  background-color: #fff;
}

.main-content {
  flex: 1;
  overflow: auto;
  background-color: inherit;
}
</style>
