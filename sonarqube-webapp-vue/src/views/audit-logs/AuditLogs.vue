<template>
  <div class="audit-logs">
    <el-container>
      <el-header>
        <h2>审计日志</h2>
      </el-header>
      <el-main>
        <el-table :data="logs" v-loading="loading">
          <el-table-column prop="createdAt" label="时间" />
          <el-table-column prop="userLogin" label="用户" />
          <el-table-column prop="action" label="操作" />
          <el-table-column prop="details" label="详情" />
        </el-table>
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getJSON } from '@/libs/shared/utils/request'

const logs = ref([])
const loading = ref(false)

onMounted(() => {
  loadLogs()
})

async function loadLogs() {
  loading.value = true
  try {
    const data = await getJSON('/api/audit_logs/search')
    logs.value = data.auditLogs || []
  } catch (error) {
    ElMessage.error('加载审计日志失败')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.audit-logs {
  padding: 20px;
}
</style>
