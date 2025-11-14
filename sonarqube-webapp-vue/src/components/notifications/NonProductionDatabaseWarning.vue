<template>
  <div v-if="showWarning" class="non-production-warning">
    <el-alert
      title="非生产数据库警告"
      description="当前连接的是非生产数据库，请勿在生产环境中使用。"
      type="warning"
      :closable="false"
      show-icon
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAppStore } from '@/stores/app'

useAppStore()

const showWarning = computed(() => {
  // 检查是否是生产环境
  // 这里可以根据实际需求实现检查逻辑
  return false // 暂时返回 false，实际应该检查环境
})
</script>

<style scoped>
.non-production-warning {
  padding: 8px 20px;
  background-color: #fef0f0;
  border-bottom: 1px solid #e4e7ed;
}
</style>
