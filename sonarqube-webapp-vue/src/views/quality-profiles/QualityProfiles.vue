<template>
  <div class="quality-profiles-page">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span class="card-title">质量配置</span>
        </div>
      </template>

      <div class="toolbar">
        <el-input
          v-model="searchText"
          placeholder="搜索质量配置..."
          :prefix-icon="Search"
          clearable
          style="width: 300px"
        />
        <el-select v-model="filterLanguage" placeholder="语言筛选" clearable style="width: 150px">
          <el-option label="Java" value="java" />
          <el-option label="JavaScript" value="js" />
          <el-option label="TypeScript" value="ts" />
          <el-option label="Python" value="py" />
        </el-select>
      </div>

      <el-table :data="filteredProfiles" v-loading="loading" stripe style="margin-top: 16px">
        <el-table-column prop="name" label="名称" width="250" sortable>
          <template #default="{ row }">
            <el-link type="primary" :underline="false" @click="handleView(row.key)">
              {{ row.name }}
            </el-link>
            <el-tag v-if="row.isDefault" size="small" type="success" style="margin-left: 8px">
              默认
            </el-tag>
            <el-tag v-if="row.isBuiltIn" size="small" type="info" style="margin-left: 4px">
              内置
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="languageName" label="语言" width="120" sortable>
          <template #default="{ row }">
            <el-tag size="small">{{ row.languageName }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="活跃规则数" width="140" sortable>
          <template #default="{ row }">
            <el-tag size="small" type="info">{{ row.activeRuleCount || 0 }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="项目数" width="120" sortable>
          <template #default="{ row }">
            <el-tag size="small">{{ row.projectCount || 0 }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="lastUsed" label="最后使用" width="180" sortable>
          <template #default="{ row }">
            {{ formatDate(row.lastUsed) }}
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
import { mockQualityProfiles } from '@/libs/shared/mocks/mockData'
import { format } from 'date-fns'

const profiles = ref<any[]>([])
const loading = ref(false)
const searchText = ref('')
const filterLanguage = ref<string>('')

const filteredProfiles = computed(() => {
  let result = profiles.value

  if (searchText.value) {
    const search = searchText.value.toLowerCase()
    result = result.filter(p => p.name.toLowerCase().includes(search))
  }

  if (filterLanguage.value) {
    result = result.filter(p => p.language === filterLanguage.value)
  }

  return result
})

onMounted(() => {
  loadProfiles()
})

async function loadProfiles() {
  loading.value = true
  try {
    profiles.value = mockQualityProfiles
  } catch (error) {
    ElMessage.error('加载质量配置列表失败')
  } finally {
    loading.value = false
  }
}

function handleView(key: string) {
  ElMessage.info(`查看质量配置: ${key}`)
}

function formatDate(date: string | undefined): string {
  if (!date) return '-'
  try {
    return format(new Date(date), 'yyyy-MM-dd HH:mm')
  } catch {
    return date
  }
}
</script>

<style scoped>
.quality-profiles-page {
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
