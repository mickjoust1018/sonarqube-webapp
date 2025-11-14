<template>
  <div class="tasks">
    <div class="page-header">
      <div class="header">
        <h2>任务中心</h2>
        <div class="header-actions">
          <el-button type="primary" size="middle" @click="showCreateDialog = true">
            <el-icon><Plus /></el-icon>
            创建任务
          </el-button>
        </div>
      </div>
    </div>
    <div class="page-content">
      <!-- 筛选栏 -->
      <div class="filters">
        <el-form :inline="true" :model="filters">
          <el-form-item label="项目">
            <el-select
              v-model="filters.projectKey"
              placeholder="请选择项目"
              clearable
              filterable
              style="width: 200px"
            >
              <el-option
                v-for="project in projects"
                :key="project.key"
                :label="project.name"
                :value="project.key"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="Git地址">
            <el-input
              v-model="filters.gitUrl"
              placeholder="Git仓库地址"
              clearable
              style="width: 300px"
            />
          </el-form-item>
          <el-form-item label="应用代码">
            <el-input
              v-model="filters.appCode"
              placeholder="应用代码"
              clearable
              style="width: 150px"
            />
          </el-form-item>
          <el-form-item label="分支">
            <el-input
              v-model="filters.branch"
              placeholder="分支名称"
              clearable
              style="width: 150px"
            />
          </el-form-item>
          <el-form-item label="状态">
            <el-select
              v-model="filters.status"
              placeholder="请选择状态"
              clearable
              multiple
              style="width: 200px"
            >
              <el-option label="待执行" value="PENDING" />
              <el-option label="执行中" value="RUNNING" />
              <el-option label="成功" value="SUCCESS" />
              <el-option label="失败" value="FAILED" />
              <el-option label="已取消" value="CANCELLED" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="search">搜索</el-button>
            <el-button @click="reset">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 任务列表 -->
      <el-table :data="tasks" v-loading="loading" style="width: 100%" size="middle">
        <el-table-column prop="name" label="任务名称" min-width="200">
          <template #default="{ row }">
            <el-link type="primary" @click="viewTask(row.id)">{{ row.name }}</el-link>
          </template>
        </el-table-column>
        <el-table-column prop="gitUrl" label="Git地址" min-width="250" show-overflow-tooltip />
        <el-table-column prop="appCode" label="应用代码" width="120" />
        <el-table-column prop="branch" label="分支" width="120">
          <template #default="{ row }">
            <el-tag size="small">{{ row.branch }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="projectKey" label="关联项目" width="150">
          <template #default="{ row }">
            <el-link v-if="row.projectKey" type="primary" @click="viewProject(row.projectKey)">
              {{ getProjectName(row.projectKey) }}
            </el-link>
            <span v-else style="color: #909399">未关联</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">{{
              getStatusLabel(row.status)
            }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="progress" label="进度" width="120">
          <template #default="{ row }">
            <el-progress
              v-if="row.status === 'RUNNING' && row.progress !== undefined"
              :percentage="row.progress"
              :status="row.status === 'FAILED' ? 'exception' : undefined"
            />
            <span v-else-if="row.status === 'SUCCESS'">100%</span>
            <span v-else style="color: #909399">-</span>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column prop="duration" label="执行时长" width="100">
          <template #default="{ row }">
            {{ row.duration ? formatDuration(row.duration) : '-' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="viewTask(row.id)">查看</el-button>
            <el-button
              v-if="row.status === 'RUNNING' || row.status === 'PENDING'"
              link
              type="warning"
              size="small"
              @click="cancelTask(row.id)"
            >
              取消
            </el-button>
            <el-button
              v-if="row.status === 'FAILED'"
              link
              type="primary"
              size="small"
              @click="retryTask(row.id)"
            >
              重试
            </el-button>
            <el-button link type="danger" size="small" @click="deleteTask(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        v-model:current-page="pagination.pageIndex"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        :page-sizes="[20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
        style="margin-top: 20px; justify-content: flex-end"
      />
    </div>

    <!-- 创建任务对话框 -->
    <el-dialog v-model="showCreateDialog" title="创建扫描任务" width="600px">
      <el-form :model="createForm" :rules="createRules" ref="createFormRef" label-width="100px">
        <el-form-item label="任务名称" prop="name">
          <el-input v-model="createForm.name" placeholder="请输入任务名称" />
        </el-form-item>
        <el-form-item label="Git地址" prop="gitUrl">
          <el-input v-model="createForm.gitUrl" placeholder="https://github.com/example/repo.git" />
        </el-form-item>
        <el-form-item label="应用代码" prop="appCode">
          <el-input v-model="createForm.appCode" placeholder="APP_CODE" />
        </el-form-item>
        <el-form-item label="分支" prop="branch">
          <el-input v-model="createForm.branch" placeholder="main" />
        </el-form-item>
        <el-form-item label="关联项目">
          <el-select
            v-model="createForm.projectKey"
            placeholder="请选择项目（可选）"
            clearable
            filterable
            style="width: 100%"
          >
            <el-option
              v-for="project in projects"
              :key="project.key"
              :label="project.name"
              :value="project.key"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" @click="handleCreate" :loading="creating">创建</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import {
  getTasks,
  createTask,
  deleteTask as deleteTaskApi,
  cancelTask as cancelTaskApi,
  retryTask as retryTaskApi,
} from '@/libs/commons/api/tasks'
import { searchProjects, createOrGetProject } from '@/libs/commons/api/projects'
import type { ScanTask, TasksQuery } from '@/libs/commons/types/tasks'
import type { Project } from '@/libs/commons/types/projects'
import { TaskStatus } from '@/libs/commons/types/tasks'
import { format } from 'date-fns'

const router = useRouter()

const tasks = ref<ScanTask[]>([])
const projects = ref<Project[]>([])
const loading = ref(false)
const showCreateDialog = ref(false)
const creating = ref(false)

const pagination = ref({
  pageIndex: 1,
  pageSize: 20,
  total: 0,
})

const filters = reactive<Partial<TasksQuery>>({
  projectKey: undefined,
  gitUrl: undefined,
  appCode: undefined,
  branch: undefined,
  status: undefined,
})

const createForm = reactive({
  name: '',
  gitUrl: '',
  appCode: '',
  branch: 'main',
  projectKey: undefined as string | undefined,
})

const createFormRef = ref()

const createRules = {
  name: [{ required: true, message: '请输入任务名称', trigger: 'blur' }],
  gitUrl: [{ required: true, message: '请输入Git地址', trigger: 'blur' }],
  appCode: [{ required: true, message: '请输入应用代码', trigger: 'blur' }],
  branch: [{ required: true, message: '请输入分支名称', trigger: 'blur' }],
}

onMounted(() => {
  loadTasks()
  loadProjects()
})

async function loadTasks() {
  loading.value = true
  try {
    const query: TasksQuery = {
      p: pagination.value.pageIndex,
      ps: pagination.value.pageSize,
      ...filters,
    }
    const data = await getTasks(query)
    tasks.value = data.tasks || []
    pagination.value.total = data.paging?.total || 0
  } catch (error: any) {
    ElMessage.error(error.message || '加载任务列表失败')
  } finally {
    loading.value = false
  }
}

async function loadProjects() {
  try {
    const data = await searchProjects({ ps: 100 })
    projects.value = data.components || []
  } catch (error) {
    console.error('Failed to load projects:', error)
  }
}

function search() {
  pagination.value.pageIndex = 1
  loadTasks()
}

function reset() {
  filters.projectKey = undefined
  filters.gitUrl = undefined
  filters.appCode = undefined
  filters.branch = undefined
  filters.status = undefined
  search()
}

function handleSizeChange(size: number) {
  pagination.value.pageSize = size
  pagination.value.pageIndex = 1
  loadTasks()
}

function handlePageChange(page: number) {
  pagination.value.pageIndex = page
  loadTasks()
}

function getStatusType(status: TaskStatus): string {
  const map: Record<string, string> = {
    PENDING: 'info',
    RUNNING: 'warning',
    SUCCESS: 'success',
    FAILED: 'danger',
    CANCELLED: '',
  }
  return map[status] || ''
}

function getStatusLabel(status: TaskStatus): string {
  const map: Record<string, string> = {
    PENDING: '待执行',
    RUNNING: '执行中',
    SUCCESS: '成功',
    FAILED: '失败',
    CANCELLED: '已取消',
  }
  return map[status] || status
}

function getProjectName(projectKey: string): string {
  const project = projects.value.find(p => p.key === projectKey)
  return project?.name || projectKey
}

function formatDate(date: string): string {
  try {
    return format(new Date(date), 'yyyy-MM-dd HH:mm:ss')
  } catch {
    return date
  }
}

function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}秒`
  } else if (seconds < 3600) {
    return `${Math.floor(seconds / 60)}分${seconds % 60}秒`
  } else {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}小时${minutes}分`
  }
}

function viewTask(taskId: string) {
  router.push(`/tasks/${taskId}`)
}

function viewProject(projectKey: string) {
  router.push(`/project/${projectKey}`)
}

async function handleCreate() {
  if (!createFormRef.value) return
  await createFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      creating.value = true
      try {
        // 如果没有指定项目，尝试根据gitUrl和appCode自动创建或关联项目
        let projectKey = createForm.projectKey
        if (!projectKey && createForm.gitUrl && createForm.appCode) {
          try {
            const project = await createOrGetProject({
              gitUrl: createForm.gitUrl,
              appCode: createForm.appCode,
              name: createForm.appCode, // 默认使用appCode作为项目名称
            })
            projectKey = project.key
            // 刷新项目列表
            await loadProjects()
          } catch (error: any) {
            console.warn('自动创建/关联项目失败:', error)
            // 继续创建任务，即使项目创建失败
          }
        }

        // 创建任务
        await createTask({
          ...createForm,
          projectKey,
        })
        ElMessage.success('任务创建成功')
        showCreateDialog.value = false
        // 重置表单
        Object.assign(createForm, {
          name: '',
          gitUrl: '',
          appCode: '',
          branch: 'main',
          projectKey: undefined,
        })
        loadTasks()
      } catch (error: any) {
        ElMessage.error(error.message || '任务创建失败')
      } finally {
        creating.value = false
      }
    }
  })
}

async function cancelTask(taskId: string) {
  try {
    await ElMessageBox.confirm('确定要取消这个任务吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    await cancelTaskApi(taskId)
    ElMessage.success('任务已取消')
    loadTasks()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '取消任务失败')
    }
  }
}

async function retryTask(taskId: string) {
  try {
    await retryTaskApi(taskId)
    ElMessage.success('任务已重新提交')
    loadTasks()
  } catch (error: any) {
    ElMessage.error(error.message || '重试任务失败')
  }
}

async function deleteTask(taskId: string) {
  try {
    await ElMessageBox.confirm('确定要删除这个任务吗？删除后无法恢复。', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    await deleteTaskApi(taskId)
    ElMessage.success('任务已删除')
    loadTasks()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除任务失败')
    }
  }
}
</script>

<style scoped>
.tasks {
  padding: 20px;
  min-height: 100%;
}

.page-header {
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e4e7ed;
}

.page-content {
  padding: 0;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header h2 {
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.filters {
  margin-bottom: 20px;
  padding: 20px;
  background: #f5f7fa;
  border-radius: 4px;
}
</style>
