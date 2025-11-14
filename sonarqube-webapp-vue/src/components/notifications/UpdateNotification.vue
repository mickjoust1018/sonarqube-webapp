<template>
  <div v-if="hasUpdate" class="update-notification">
    <el-alert
      title="系统更新可用"
      description="有新版本可用，请考虑更新系统。"
      type="info"
      :closable="true"
      @close="handleClose"
      show-icon
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAppStore } from '@/stores/app'

interface Props {
  isGlobalBanner?: boolean
}

withDefaults(defineProps<Props>(), {
  isGlobalBanner: false,
})

useAppStore()
const dismissed = ref(false)

const hasUpdate = computed(() => {
  // 检查是否有更新可用
  // 这里可以根据实际需求实现检查逻辑
  return false && !dismissed.value // 暂时返回 false
})

function handleClose() {
  dismissed.value = true
}
</script>

<style scoped>
.update-notification {
  padding: 8px 20px;
  background-color: #f0f9ff;
  border-bottom: 1px solid #e4e7ed;
}
</style>
