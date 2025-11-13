<template>
  <div class="dashboard">
    <el-container>
      <el-header>
        <h2>仪表板</h2>
      </el-header>
      <el-main>
        <el-row :gutter="20">
          <el-col :span="6">
            <el-card>
              <el-statistic title="项目总数" :value="stats.projects" />
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card>
              <el-statistic title="问题总数" :value="stats.issues" />
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card>
              <el-statistic title="安全热点" :value="stats.hotspots" />
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card>
              <el-statistic title="代码覆盖率" :value="stats.coverage" suffix="%" />
            </el-card>
          </el-col>
        </el-row>
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getJSON } from '@/libs/shared/utils/request'

const stats = ref({
  projects: 0,
  issues: 0,
  hotspots: 0,
  coverage: 0,
})

onMounted(() => {
  loadStats()
})

async function loadStats() {
  try {
    // 这里应该加载统计数据
    stats.value = {
      projects: 0,
      issues: 0,
      hotspots: 0,
      coverage: 0,
    }
  } catch (error) {
    ElMessage.error('加载统计数据失败')
  }
}
</script>

<style scoped>
.dashboard {
  padding: 20px;
}
</style>
