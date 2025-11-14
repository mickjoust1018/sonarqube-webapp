<template>
  <div v-if="status !== 'none'" class="indexation-notification">
    <el-alert
      :title="title"
      :description="description"
      :type="status === 'completed' ? 'success' : 'info'"
      :closable="false"
      show-icon
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useIndexationContext } from '@/composables/useIndexationContext'

const { status, completedCount, totalCount } = useIndexationContext()

const title = computed(() => {
  if (status.value === 'completed') {
    return '索引完成'
  }
  return '正在索引...'
})

const description = computed(() => {
  if (status.value === 'completed') {
    return '所有项目已成功索引'
  }
  return `正在索引项目 ${completedCount.value} / ${totalCount.value}`
})
</script>

<style scoped>
.indexation-notification {
  padding: 8px 20px;
  background-color: #f0f9ff;
  border-bottom: 1px solid #e4e7ed;
}
</style>
