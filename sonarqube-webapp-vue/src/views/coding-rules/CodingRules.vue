<template>
  <div class="coding-rules-page">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span class="card-title">编码规则</span>
        </div>
      </template>

      <div class="toolbar">
        <el-input
          v-model="searchText"
          placeholder="搜索规则..."
          :prefix-icon="Search"
          clearable
          style="width: 300px"
        />
        <el-select v-model="filterLanguage" placeholder="语言筛选" clearable style="width: 150px">
          <el-option label="Java" value="java" />
          <el-option label="JavaScript" value="js" />
          <el-option label="TypeScript" value="ts" />
        </el-select>
        <el-select v-model="filterType" placeholder="类型筛选" clearable style="width: 150px">
          <el-option label="代码异味" value="CODE_SMELL" />
          <el-option label="Bug" value="BUG" />
          <el-option label="漏洞" value="VULNERABILITY" />
        </el-select>
        <el-select v-model="filterSeverity" placeholder="严重程度" clearable style="width: 150px">
          <el-option label="阻断" value="BLOCKER" />
          <el-option label="严重" value="CRITICAL" />
          <el-option label="主要" value="MAJOR" />
          <el-option label="次要" value="MINOR" />
          <el-option label="信息" value="INFO" />
        </el-select>
      </div>

      <el-table :data="filteredRules" v-loading="loading" stripe style="margin-top: 16px">
        <el-table-column prop="name" label="规则名称" min-width="300" sortable>
          <template #default="{ row }">
            <el-link type="primary" :underline="false" @click="handleView(row.key)">
              {{ row.name }}
            </el-link>
          </template>
        </el-table-column>
        <el-table-column prop="key" label="规则 Key" width="200" />
        <el-table-column prop="languageName" label="语言" width="120">
          <template #default="{ row }">
            <el-tag size="small">{{ row.languageName }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="类型" width="120" sortable>
          <template #default="{ row }">
            <el-tag :type="getTypeTagType(row.type)" size="small">
              {{ getTypeLabel(row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="严重程度" width="120" sortable>
          <template #default="{ row }">
            <el-tag :type="getSeverityTagType(row.severity)" size="small">
              {{ getSeverityLabel(row.severity) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="标签" min-width="200">
          <template #default="{ row }">
            <el-tag
              v-for="tag in row.tags"
              :key="tag"
              size="small"
              style="margin-right: 4px; margin-bottom: 4px"
            >
              {{ tag }}
            </el-tag>
          </template>
        </el-table-column>
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
import { Search } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { mockCodingRules } from '@/libs/shared/mocks/mockData'

const rules = ref<any[]>([])
const loading = ref(false)
const searchText = ref('')
const filterLanguage = ref<string>('')
const filterType = ref<string>('')
const filterSeverity = ref<string>('')

const filteredRules = computed(() => {
  let result = rules.value

  if (searchText.value) {
    const search = searchText.value.toLowerCase()
    result = result.filter(
      r =>
        r.name.toLowerCase().includes(search) ||
        r.key.toLowerCase().includes(search) ||
        r.description.toLowerCase().includes(search)
    )
  }

  if (filterLanguage.value) {
    result = result.filter(r => r.language === filterLanguage.value)
  }

  if (filterType.value) {
    result = result.filter(r => r.type === filterType.value)
  }

  if (filterSeverity.value) {
    result = result.filter(r => r.severity === filterSeverity.value)
  }

  return result
})

function getTypeTagType(type: string): string {
  const map: Record<string, string> = {
    CODE_SMELL: 'warning',
    BUG: 'danger',
    VULNERABILITY: 'danger',
  }
  return map[type] || 'info'
}

function getTypeLabel(type: string): string {
  const map: Record<string, string> = {
    CODE_SMELL: '代码异味',
    BUG: 'Bug',
    VULNERABILITY: '漏洞',
  }
  return map[type] || type
}

function getSeverityTagType(severity: string): string {
  const map: Record<string, string> = {
    BLOCKER: 'danger',
    CRITICAL: 'danger',
    MAJOR: 'warning',
    MINOR: 'info',
    INFO: 'info',
  }
  return map[severity] || 'info'
}

function getSeverityLabel(severity: string): string {
  const map: Record<string, string> = {
    BLOCKER: '阻断',
    CRITICAL: '严重',
    MAJOR: '主要',
    MINOR: '次要',
    INFO: '信息',
  }
  return map[severity] || severity
}

onMounted(() => {
  loadRules()
})

async function loadRules() {
  loading.value = true
  try {
    rules.value = mockCodingRules
  } catch (error) {
    ElMessage.error('加载规则列表失败')
  } finally {
    loading.value = false
  }
}

function handleView(key: string) {
  ElMessage.info(`查看规则: ${key}`)
}
</script>

<style scoped>
.coding-rules-page {
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
