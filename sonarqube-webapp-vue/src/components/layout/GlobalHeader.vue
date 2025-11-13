<template>
  <el-header class="global-header">
    <div class="header-content">
      <div class="logo">
        <router-link to="/">
          <span>SonarQube</span>
        </router-link>
      </div>
      <el-menu
        mode="horizontal"
        :default-active="activeMenu"
        class="header-menu"
        @select="handleMenuSelect"
      >
        <el-menu-item index="projects">
          <el-icon><Document /></el-icon>
          <span>项目</span>
        </el-menu-item>
        <el-menu-item index="issues">
          <el-icon><Warning /></el-icon>
          <span>问题</span>
        </el-menu-item>
        <el-menu-item index="security_hotspots">
          <el-icon><Lock /></el-icon>
          <span>安全热点</span>
        </el-menu-item>
        <el-menu-item index="quality_gates">
          <el-icon><Check /></el-icon>
          <span>质量门</span>
        </el-menu-item>
        <el-menu-item index="quality_profiles">
          <el-icon><Setting /></el-icon>
          <span>质量配置</span>
        </el-menu-item>
      </el-menu>
      <div class="header-actions">
        <el-dropdown>
          <span class="user-info">
            <el-avatar :size="32" :src="userAvatar" />
            <span class="username">{{ currentUser?.name || currentUser?.login }}</span>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item>
                <router-link to="/account">账户</router-link>
              </el-dropdown-item>
              <el-dropdown-item divided>
                <router-link to="/sessions/logout">退出</router-link>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
  </el-header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { Document, Warning, Lock, Check, Setting } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()

const currentUser = computed(() => appStore.currentUser)
const userAvatar = computed(() => currentUser.value?.avatar)

const activeMenu = computed(() => {
  const path = route.path
  if (path.startsWith('/projects')) return 'projects'
  if (path.startsWith('/issues')) return 'issues'
  if (path.startsWith('/security_hotspots')) return 'security_hotspots'
  if (path.startsWith('/quality_gates')) return 'quality_gates'
  if (path.startsWith('/quality_profiles')) return 'quality_profiles'
  return ''
})

function handleMenuSelect(key: string) {
  router.push(`/${key}`)
}
</script>

<style scoped>
.global-header {
  height: 60px;
  background-color: #fff;
  border-bottom: 1px solid #e4e7ed;
  padding: 0;
}

.header-content {
  display: flex;
  align-items: center;
  height: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
}

.logo {
  margin-right: 40px;
}

.logo a {
  text-decoration: none;
  color: #303133;
  font-size: 20px;
  font-weight: bold;
}

.header-menu {
  flex: 1;
  border-bottom: none;
}

.header-actions {
  margin-left: auto;
}

.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
  gap: 8px;
}

.username {
  font-size: 14px;
  color: #303133;
}
</style>
