<template>
  <div class="security-hotspots-page">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span class="card-title">安全热点</span>
        </div>
      </template>

      <div class="toolbar">
        <el-input
          v-model="searchText"
          placeholder="搜索安全热点..."
          :prefix-icon="Search"
          clearable
          style="width: 300px"
        />
        <el-select v-model="filterStatus" placeholder="状态筛选" clearable style="width: 150px">
          <el-option label="待审查" value="TO_REVIEW" />
          <el-option label="已审查" value="REVIEWED" />
        </el-select>
        <el-select
          v-model="filterProbability"
          placeholder="漏洞概率"
          clearable
          style="width: 150px"
        >
          <el-option label="高" value="HIGH" />
          <el-option label="中" value="MEDIUM" />
          <el-option label="低" value="LOW" />
        </el-select>
      </div>

      <el-table :data="filteredHotspots" v-loading="loading" stripe style="margin-top: 16px">
        <el-table-column prop="key" label="Key" width="150" />
        <el-table-column prop="component" label="组件" min-width="250" />
        <el-table-column prop="message" label="消息" min-width="300" />
        <el-table-column label="漏洞概率" width="120" sortable>
          <template #default="{ row }">
            <el-tag :type="getProbabilityType(row.vulnerabilityProbability)" size="small">
              {{ getProbabilityLabel(row.vulnerabilityProbability) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="line" label="行号" width="100" />
        <el-table-column prop="assignee" label="分配人" width="150" />
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleView(row.key)">
              查看
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { Search } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { mockSecurityHotspots } from '@/libs/shared/mocks/mockData'

const route = useRoute()

const hotspots = ref<any[]>([])
const loading = ref(false)
const searchText = ref('')
const filterStatus = ref<string>('')
const filterProbability = ref<string>('')

const filteredHotspots = computed(() => {
  let result = hotspots.value

  if (searchText.value) {
    const search = searchText.value.toLowerCase()
    result = result.filter(
      h =>
        h.key.toLowerCase().includes(search) ||
        h.component.toLowerCase().includes(search) ||
        h.message.toLowerCase().includes(search)
    )
  }

  if (filterStatus.value) {
    result = result.filter(h => h.status === filterStatus.value)
  }

  if (filterProbability.value) {
    result = result.filter(h => h.vulnerabilityProbability === filterProbability.value)
  }

  // 项目筛选
  const projectKey = route.params.id || route.params.projectKey
  if (projectKey) {
    result = result.filter(h => h.project === projectKey)
  }

  return result
})

function getProbabilityType(probability: string): string {
  const map: Record<string, string> = {
    HIGH: 'danger',
    MEDIUM: 'warning',
    LOW: 'info',
  }
  return map[probability] || 'info'
}

function getProbabilityLabel(probability: string): string {
  const map: Record<string, string> = {
    HIGH: '高',
    MEDIUM: '中',
    LOW: '低',
  }
  return map[probability] || probability
}

function getStatusType(status: string): string {
  const map: Record<string, string> = {
    TO_REVIEW: 'warning',
    REVIEWED: 'success',
  }
  return map[status] || 'info'
}

function getStatusLabel(status: string): string {
  const map: Record<string, string> = {
    TO_REVIEW: '待审查',
    REVIEWED: '已审查',
  }
  return map[status] || status
}

onMounted(() => {
  loadHotspots()
})

async function loadHotspots() {
  loading.value = true
  try {
    hotspots.value = mockSecurityHotspots
  } catch (error) {
    ElMessage.error('加载安全热点列表失败')
  } finally {
    loading.value = false
  }
}

function handleView(key: string) {
  ElMessage.info(`查看安全热点: ${key}`)
}
</script>

<style scoped>
.security-hotspots-page {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  font-size: 18px;
  font-weight: 500;
}

.toolbar {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}
</style>
