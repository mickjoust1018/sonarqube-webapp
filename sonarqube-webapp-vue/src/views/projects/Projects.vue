<template>
  <div class="projects">
    <div class="page-header">
      <div class="header">
        <h2>{{ isFavorite ? '收藏的项目' : '项目' }}</h2>
        <div class="header-actions">
          <el-input
            v-model="searchQuery"
            placeholder="搜索项目..."
            style="width: 300px; margin-right: 10px"
            clearable
            @input="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
          <el-button type="primary" @click="goToCreate">
            <el-icon><Plus /></el-icon>
            创建项目
          </el-button>
        </div>
      </div>
    </div>
    <div class="page-content">
      <div class="filters">
        <el-form :inline="true" :model="filters">
          <el-form-item label="类型">
            <el-select v-model="filters.qualifiers" placeholder="请选择" clearable multiple>
              <el-option label="项目" value="TRK" />
              <el-option label="应用" value="APP" />
              <el-option label="组合" value="VW" />
            </el-select>
          </el-form-item>
          <el-form-item label="标签">
            <el-select
              v-model="filters.tags"
              placeholder="请选择标签"
              clearable
              multiple
              filterable
              allow-create
            >
              <el-option v-for="tag in availableTags" :key="tag" :label="tag" :value="tag" />
            </el-select>
          </el-form-item>
          <el-form-item label="排序">
            <el-select v-model="filters.sort" placeholder="请选择" clearable>
              <el-option label="名称" value="name" />
              <el-option label="分析日期" value="analysisDate" />
              <el-option label="创建日期" value="creationDate" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button @click="resetFilters">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
      <el-table :data="projects" v-loading="loading" style="width: 100%">
        <el-table-column type="expand">
          <template #default="{ row }">
            <div class="project-details">
              <p><strong>描述:</strong> {{ row.description || '无' }}</p>
              <p><strong>最后分析:</strong> {{ formatDate(row.lastAnalysisDate) }}</p>
              <p v-if="row.tags && row.tags.length > 0">
                <strong>标签:</strong>
                <el-tag v-for="tag in row.tags" :key="tag" size="small" style="margin-left: 5px">
                  {{ tag }}
                </el-tag>
              </p>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="项目名称" min-width="200">
          <template #default="{ row }">
            <el-link type="primary" @click="viewProject(row.key)">{{ row.name }}</el-link>
          </template>
        </el-table-column>
        <el-table-column prop="key" label="项目 Key" min-width="200" />
        <el-table-column prop="qualifier" label="类型" width="100">
          <template #default="{ row }">
            <el-tag>{{ getQualifierLabel(row.qualifier) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="visibility" label="可见性" width="100">
          <template #default="{ row }">
            <el-tag :type="row.visibility === 'private' ? 'info' : 'success'">
              {{ row.visibility === 'private' ? '私有' : '公开' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="lastAnalysisDate" label="最后分析" width="180">
          <template #default="{ row }">
            {{ formatDate(row.lastAnalysisDate) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="viewProject(row.key)">查看</el-button>
            <el-button link type="primary" @click="toggleFavorite(row)">
              {{ row.isFavorite ? '取消收藏' : '收藏' }}
            </el-button>
            <el-dropdown @command="(cmd: string) => handleCommand(cmd, row)">
              <el-button link type="primary">
                更多 <el-icon><ArrowDown /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="settings">设置</el-dropdown-item>
                  <el-dropdown-item command="delete" divided>删除</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        v-model:current-page="pagination.pageIndex"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus, ArrowDown } from '@element-plus/icons-vue'
import { searchProjects, deleteProject, getProjectTags } from '@/libs/commons/api/projects'
import { postJSON } from '@/libs/shared/utils/request'
import type { Project, ProjectsQuery } from '@/libs/commons/types/projects'
import { format } from 'date-fns'

const router = useRouter()
const route = useRoute()

const projects = ref<Project[]>([])
const loading = ref(false)
const searchQuery = ref('')
const availableTags = ref<string[]>([])

const isFavorite = computed(() => route.path.includes('/favorite'))

const pagination = ref({
  pageIndex: 1,
  pageSize: 20,
  total: 0,
})

const filters = reactive<ProjectsQuery>({
  qualifiers: [],
  tags: [],
  sort: 'name',
})

let searchTimer: ReturnType<typeof setTimeout> | null = null

onMounted(() => {
  loadProjects()
  loadTags()
})

watch(
  () => route.path,
  () => {
    loadProjects()
  }
)

async function loadProjects() {
  loading.value = true
  try {
    const query: Record<string, any> = {
      p: pagination.value.pageIndex,
      ps: pagination.value.pageSize,
    }

    if (isFavorite.value) {
      query.filter = 'isFavorite'
    }

    if (searchQuery.value) {
      query.search = searchQuery.value
    }

    if (filters.qualifiers && filters.qualifiers.length > 0) {
      query.qualifiers = filters.qualifiers.join(',')
    }

    if (filters.tags && filters.tags.length > 0) {
      query.tags = filters.tags.join(',')
    }

    if (filters.sort) {
      query.s = filters.sort
    }

    const data = await searchProjects(query)
    projects.value = data.components || []
    pagination.value.total = data.paging?.total || 0
  } catch (error: any) {
    ElMessage.error(error.message || '加载项目列表失败')
  } finally {
    loading.value = false
  }
}

async function loadTags() {
  try {
    const data = await getProjectTags({ ps: 100 })
    availableTags.value = data || []
  } catch (error) {
    // 忽略错误
  }
}

function handleSearch() {
  if (searchTimer) {
    clearTimeout(searchTimer)
  }
  searchTimer = setTimeout(() => {
    pagination.value.pageIndex = 1
    loadProjects()
  }, 500)
}

function handleSizeChange(size: number) {
  pagination.value.pageSize = size
  pagination.value.pageIndex = 1
  loadProjects()
}

function handlePageChange(page: number) {
  pagination.value.pageIndex = page
  loadProjects()
}

function resetFilters() {
  filters.qualifiers = []
  filters.tags = []
  filters.sort = 'name'
  searchQuery.value = ''
  pagination.value.pageIndex = 1
  loadProjects()
}

function getQualifierLabel(qualifier: string): string {
  const map: Record<string, string> = {
    TRK: '项目',
    APP: '应用',
    VW: '组合',
  }
  return map[qualifier] || qualifier
}

function formatDate(date?: string): string {
  if (!date) return '-'
  try {
    return format(new Date(date), 'yyyy-MM-dd HH:mm:ss')
  } catch {
    return date
  }
}

function goToCreate() {
  router.push('/projects/create')
}

function viewProject(key: string) {
  router.push(`/project/${key}`)
}

async function toggleFavorite(project: Project) {
  try {
    if (project.isFavorite) {
      await postJSON('/api/favorites/remove', { component: project.key })
      ElMessage.success('已取消收藏')
    } else {
      await postJSON('/api/favorites/add', { component: project.key })
      ElMessage.success('已收藏')
    }
    loadProjects()
  } catch (error: any) {
    ElMessage.error(error.message || '操作失败')
  }
}

function handleCommand(cmd: string, project: Project) {
  switch (cmd) {
    case 'settings':
      router.push(`/project/${project.key}/information`)
      break
    case 'delete':
      handleDelete(project)
      break
  }
}

async function handleDelete(project: Project) {
  try {
    await ElMessageBox.confirm(
      `确定要删除项目 "${project.name}" 吗？此操作不可恢复。`,
      '删除项目',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        inputPlaceholder: '请输入项目名称确认',
        inputPattern: new RegExp(`^${project.name}$`),
        inputErrorMessage: '项目名称不匹配',
      }
    )
    await deleteProject(project.key)
    ElMessage.success('删除成功')
    loadProjects()
  } catch (error: any) {
    if (error !== 'cancel' && error !== 'close') {
      ElMessage.error(error.message || '删除失败')
    }
  }
}
</script>

<style scoped>
.projects {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header h2 {
  margin: 0;
}

.header-actions {
  display: flex;
  align-items: center;
}

.filters {
  margin-bottom: 20px;
  padding: 20px;
  background: #f5f7fa;
  border-radius: 4px;
}

.project-details {
  padding: 10px;
}

.project-details p {
  margin: 5px 0;
}
</style>
