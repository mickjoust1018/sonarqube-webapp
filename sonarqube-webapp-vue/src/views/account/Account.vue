<template>
  <div class="account">
    <el-container>
      <el-aside width="200px">
        <el-menu :default-active="activeMenu" @select="handleMenuSelect">
          <el-menu-item index="profile">
            <el-icon><User /></el-icon>
            <span>个人资料</span>
          </el-menu-item>
          <el-menu-item index="security">
            <el-icon><Lock /></el-icon>
            <span>安全</span>
          </el-menu-item>
          <el-menu-item index="projects">
            <el-icon><Document /></el-icon>
            <span>项目</span>
          </el-menu-item>
          <el-menu-item index="notifications">
            <el-icon><Bell /></el-icon>
            <span>通知</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      <el-main>
        <router-view />
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { User, Lock, Document, Bell } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()

const activeMenu = computed(() => {
  const path = route.path
  if (path.includes('/security')) return 'security'
  if (path.includes('/projects')) return 'projects'
  if (path.includes('/notifications')) return 'notifications'
  return 'profile'
})

function handleMenuSelect(key: string) {
  router.push(`/account/${key}`)
}
</script>

<style scoped>
.account {
  padding: 20px;
}
</style>
