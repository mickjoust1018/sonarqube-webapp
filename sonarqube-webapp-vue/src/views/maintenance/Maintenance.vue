<template>
  <div class="maintenance">
    <el-result
      icon="warning"
      title="系统维护中"
      sub-title="系统正在进行维护，请稍后再试"
    >
      <template #extra>
        <el-button type="primary" @click="refresh">刷新页面</el-button>
      </template>
    </el-result>
  </div>
</template>

<script setup lang="ts">
function refresh() {
  window.location.reload()
}
</script>

<style scoped>
.maintenance {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
}
</style>
