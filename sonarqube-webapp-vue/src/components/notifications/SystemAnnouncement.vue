<template>
  <div v-if="announcement" class="system-announcement">
    <el-alert
      :title="announcement.title"
      :description="announcement.message"
      type="info"
      :closable="false"
      show-icon
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAppStore } from '@/stores/app'

useAppStore()

interface SystemAnnouncement {
  title: string
  message: string
}

const announcement = computed<SystemAnnouncement | null>(() => {
  // 从 appState 中获取系统公告
  // systemAnnouncement 属性在当前 AppState 类型中不存在，暂时返回 null
  return null
})
</script>

<style scoped>
.system-announcement {
  padding: 8px 20px;
  background-color: #f0f9ff;
  border-bottom: 1px solid #e4e7ed;
}
</style>
