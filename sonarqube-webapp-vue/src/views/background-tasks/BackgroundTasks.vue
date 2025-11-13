<template>
  <div class="background-tasks">
    <el-container>
      <el-header>
        <h2>后台任务</h2>
      </el-header>
      <el-main>
        <el-table :data="tasks" v-loading="loading">
          <el-table-column prop="id" label="ID" />
          <el-table-column prop="type" label="类型" />
          <el-table-column prop="status" label="状态" />
          <el-table-column prop="submittedAt" label="提交时间" />
          <el-table-column label="操作">
            <template #default="{ row }">
              <el-button link type="primary" @click="view(row.id)">查看</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getJSON } from '@/libs/shared/utils/request'

const tasks = ref([])
const loading = ref(false)

onMounted(() => {
  loadTasks()
})

async function loadTasks() {
  loading.value = true
  try {
    const data = await getJSON('/api/ce/activity')
    tasks.value = data.tasks || []
  } catch (error) {
    ElMessage.error('加载任务列表失败')
  } finally {
    loading.value = false
  }
}

function view(id: string) {
  console.log('View task:', id)
}
</script>

<style scoped>
.background-tasks {
  padding: 20px;
}
</style>
