<template>
  <div class="global-nav-user">
    <el-button v-if="!isLoggedIn" @click="handleLogin">登录</el-button>
    <el-dropdown v-else @command="handleCommand">
      <span class="user-info">
        <el-avatar :size="32" :src="avatarUrl" />
        <span class="username">{{ currentUser?.name || currentUser?.login }}</span>
        <el-icon><ArrowDown /></el-icon>
      </span>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item command="account">
            <el-icon><User /></el-icon>
            <span>账户</span>
          </el-dropdown-item>
          <el-dropdown-item command="projects" divided>
            <el-icon><Document /></el-icon>
            <span>我的项目</span>
          </el-dropdown-item>
          <el-dropdown-item command="notifications">
            <el-icon><Bell /></el-icon>
            <span>通知</span>
          </el-dropdown-item>
          <el-dropdown-item command="logout" divided>
            <el-icon><SwitchButton /></el-icon>
            <span>退出</span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { User, Document, Bell, SwitchButton, ArrowDown } from '@element-plus/icons-vue'
import { useAppStore } from '@/stores/app'
import { getBaseUrl } from '@/libs/shared/utils/browser'

const router = useRouter()
const appStore = useAppStore()

const currentUser = computed(() => appStore.currentUser)
const isLoggedIn = computed(() => {
  return currentUser.value !== null
})

const avatarUrl = computed(() => {
  if (!currentUser.value?.avatar) return undefined
  // 如果启用了 Gravatar，可以在这里处理
  return currentUser.value.avatar
})

function handleLogin() {
  const returnTo = encodeURIComponent(window.location.pathname + window.location.search)
  window.location.href = `${getBaseUrl()}/sessions/new?return_to=${returnTo}${window.location.hash}`
}

function handleCommand(command: string) {
  switch (command) {
    case 'account':
      router.push('/account')
      break
    case 'projects':
      router.push('/account/projects')
      break
    case 'notifications':
      router.push('/account/notifications')
      break
    case 'logout':
      router.push('/sessions/logout')
      break
  }
}
</script>

<style scoped>
.global-nav-user {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
  gap: 8px;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.user-info:hover {
  background-color: #f5f7fa;
}

.username {
  font-size: 14px;
  color: #303133;
}

.el-icon {
  font-size: 12px;
  color: #909399;
}
</style>
