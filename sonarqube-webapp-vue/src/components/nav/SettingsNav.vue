<template>
  <div class="settings-nav">
    <el-menu
      mode="horizontal"
      :default-active="activeMenu"
      class="settings-nav-menu"
      @select="handleMenuSelect"
    >
      <el-menu-item v-for="item in menuItems" :key="item.key" :index="item.key">
        <el-icon v-if="item.icon"><component :is="item.icon" /></el-icon>
        <span>{{ item.label }}</span>
        <el-badge v-if="item.badge && item.badge > 0" :value="item.badge" class="item" />
      </el-menu-item>
    </el-menu>

    <!-- 系统状态指示 -->
    <div v-if="systemStatus !== 'UP'" class="system-status">
      <el-icon class="is-loading" v-if="systemStatus === 'RESTARTING'"><Loading /></el-icon>
      <span>{{ statusText }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  Setting,
  User,
  Lock,
  Document,
  Tools,
  Shop,
  Monitor,
  List,
  Loading,
} from '@element-plus/icons-vue'
import type { Extension } from '@/libs/commons/api/navigation'

interface Props {
  extensions: Extension[]
  pendingPlugins?: {
    installing: number
    removing: number
    updating: number
  }
  systemStatus?: 'UP' | 'DOWN' | 'RESTARTING' | 'DB_MIGRATION_NEEDED' | 'DB_MIGRATION_RUNNING'
}

const props = withDefaults(defineProps<Props>(), {
  pendingPlugins: () => ({ installing: 0, removing: 0, updating: 0 }),
  systemStatus: 'UP',
})

const route = useRoute()
const router = useRouter()

const activeMenu = computed(() => {
  const path = route.path
  if (path.includes('/admin/users')) return 'users'
  if (path.includes('/admin/groups')) return 'groups'
  if (path.includes('/admin/permissions')) return 'permissions'
  if (path.includes('/admin/permission_templates')) return 'permission_templates'
  if (path.includes('/admin/quality_gates')) return 'quality_gates'
  if (path.includes('/admin/quality_profiles')) return 'quality_profiles'
  if (path.includes('/admin/webhooks')) return 'webhooks'
  if (path.includes('/admin/marketplace')) return 'marketplace'
  if (path.includes('/admin/system')) return 'system'
  if (path.includes('/admin/settings')) return 'settings'
  if (path.includes('/admin/background_tasks')) return 'background_tasks'
  if (path.includes('/admin/audit')) return 'audit'
  if (path.includes('/admin/projects_management')) return 'projects_management'
  return ''
})

const totalPendingPlugins = computed(() => {
  return (
    props.pendingPlugins.installing + props.pendingPlugins.removing + props.pendingPlugins.updating
  )
})

const menuItems = computed(() => {
  const items = [
    {
      key: 'users',
      label: '用户',
      icon: User,
      route: '/admin/users',
    },
    {
      key: 'groups',
      label: '组',
      icon: User,
      route: '/admin/groups',
    },
    {
      key: 'permissions',
      label: '权限',
      icon: Lock,
      route: '/admin/permissions',
    },
    {
      key: 'quality_gates',
      label: '质量门',
      icon: Document,
      route: '/quality_gates',
    },
    {
      key: 'quality_profiles',
      label: '质量配置',
      icon: Setting,
      route: '/quality_profiles',
    },
    {
      key: 'webhooks',
      label: 'Webhooks',
      icon: Tools,
      route: '/admin/webhooks',
    },
    {
      key: 'marketplace',
      label: '市场',
      icon: Shop,
      route: '/admin/marketplace',
      badge: totalPendingPlugins.value,
    },
    {
      key: 'system',
      label: '系统',
      icon: Monitor,
      route: '/admin/system',
    },
    {
      key: 'settings',
      label: '设置',
      icon: Setting,
      route: '/admin/settings',
    },
    {
      key: 'background_tasks',
      label: '后台任务',
      icon: List,
      route: '/admin/background_tasks',
    },
    {
      key: 'audit',
      label: '审计日志',
      icon: Document,
      route: '/admin/audit',
    },
    {
      key: 'projects_management',
      label: '项目管理',
      icon: Document,
      route: '/admin/projects_management',
    },
  ]

  // 添加扩展菜单项
  props.extensions.forEach(ext => {
    items.push({
      key: ext.key,
      label: ext.name,
      icon: Setting,
      route: `/admin/extension/${ext.key}`,
    })
  })

  return items
})

const statusText = computed(() => {
  switch (props.systemStatus) {
    case 'RESTARTING':
      return '系统正在重启...'
    case 'DOWN':
      return '系统已关闭'
    case 'DB_MIGRATION_NEEDED':
      return '需要数据库迁移'
    case 'DB_MIGRATION_RUNNING':
      return '数据库迁移中...'
    default:
      return ''
  }
})

function handleMenuSelect(key: string) {
  const item = menuItems.value.find(i => i.key === key)
  if (item?.route) {
    router.push(item.route)
  }
}
</script>

<style scoped>
.settings-nav {
  display: flex;
  align-items: center;
  background-color: #fff;
  border-bottom: 1px solid #e4e7ed;
  padding: 0 20px;
}

.settings-nav-menu {
  flex: 1;
  border-bottom: none;
}

.system-status {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 16px;
  color: #e6a23c;
  font-size: 14px;
}

.system-status .el-icon {
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
