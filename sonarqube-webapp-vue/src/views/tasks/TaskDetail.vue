<template>
  <div class="task-detail">
    <div class="page-header">
      <div class="header">
        <div>
          <el-button link @click="goBack">
            <el-icon><ArrowLeft /></el-icon>
            返回
          </el-button>
          <h2 style="margin: 0; display: inline-block; margin-left: 12px">
            {{ task?.name || '任务详情' }}
          </h2>
        </div>
        <div class="header-actions">
          <el-button
            v-if="task?.status === 'RUNNING' || task?.status === 'PENDING'"
            type="warning"
            size="middle"
            @click="cancelTask"
          >
            取消任务
          </el-button>
          <el-button
            v-if="task?.status === 'FAILED'"
            type="primary"
            size="middle"
            @click="retryTask"
          >
            重试任务
          </el-button>
          <el-button type="danger" size="middle" @click="deleteTask">删除任务</el-button>
        </div>
      </div>
    </div>
    <div class="page-content" v-loading="loading">
      <div v-if="task">
        <!-- 基本信息 -->
        <el-card class="info-card" size="middle">
          <template #header>
            <h3>基本信息</h3>
          </template>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="任务ID">{{ task.id }}</el-descriptions-item>
            <el-descriptions-item label="任务名称">{{ task.name }}</el-descriptions-item>
            <el-descriptions-item label="Git地址">
              <el-link :href="task.gitUrl" target="_blank" type="primary">{{
                task.gitUrl
              }}</el-link>
            </el-descriptions-item>
            <el-descriptions-item label="应用代码">
              <el-tag>{{ task.appCode }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="分支">
              <el-tag type="info">{{ task.branch }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag :type="getStatusType(task.status)">{{ getStatusLabel(task.status) }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="关联项目">
              <el-link v-if="task.projectKey" type="primary" @click="viewProject(task.projectKey)">
                {{ getProjectName(task.projectKey) }}
              </el-link>
              <span v-else style="color: #909399">未关联</span>
            </el-descriptions-item>
            <el-descriptions-item label="创建时间">{{
              formatDate(task.createdAt)
            }}</el-descriptions-item>
            <el-descriptions-item label="开始时间" v-if="task.startedAt">
              {{ formatDate(task.startedAt) }}
            </el-descriptions-item>
            <el-descriptions-item label="完成时间" v-if="task.finishedAt">
              {{ formatDate(task.finishedAt) }}
            </el-descriptions-item>
            <el-descriptions-item label="执行时长" v-if="task.duration">
              {{ formatDuration(task.duration) }}
            </el-descriptions-item>
            <el-descriptions-item label="进度" v-if="task.progress !== undefined">
              <el-progress
                :percentage="task.progress"
                :status="task.status === 'FAILED' ? 'exception' : undefined"
              />
            </el-descriptions-item>
          </el-descriptions>
        </el-card>

        <!-- 扫描结果 -->
        <el-card v-if="task.scanResult" class="result-card" size="middle">
          <template #header>
            <h3>扫描结果</h3>
          </template>
          <el-row :gutter="20">
            <el-col :xs="24" :sm="12" :md="6" v-for="metric in scanMetrics" :key="metric.key">
              <el-statistic :title="metric.label" :value="metric.value" :suffix="metric.suffix">
                <template #prefix>
                  <el-icon :size="24" :color="metric.color">
                    <component :is="metric.icon" />
                  </el-icon>
                </template>
              </el-statistic>
            </el-col>
          </el-row>
        </el-card>

        <!-- 元数据 -->
        <el-card v-if="task.metadata" class="metadata-card" size="middle">
          <template #header>
            <h3>元数据</h3>
          </template>
          <el-descriptions :column="2" border>
            <el-descriptions-item
              v-for="(value, key) in task.metadata"
              :key="key"
              :label="formatMetadataKey(String(key))"
            >
              {{ value }}
            </el-descriptions-item>
          </el-descriptions>
        </el-card>

        <!-- 错误信息 -->
        <el-card v-if="task.errorMessage" class="error-card" size="middle">
          <template #header>
            <h3 style="color: #f56c6c">错误信息</h3>
          </template>
          <el-alert type="error" :closable="false">
            {{ task.errorMessage }}
          </el-alert>
        </el-card>
      </div>
      <el-empty v-else description="任务不存在" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft, Warning, TrendCharts, DataAnalysis, Lock } from '@element-plus/icons-vue'
import {
  getTask,
  deleteTask as deleteTaskApi,
  cancelTask as cancelTaskApi,
  retryTask as retryTaskApi,
} from '@/libs/commons/api/tasks'
import { searchProjects } from '@/libs/commons/api/projects'
import type { ScanTask } from '@/libs/commons/types/tasks'
import type { Project } from '@/libs/commons/types/projects'
import { TaskStatus } from '@/libs/commons/types/tasks'
import { format } from 'date-fns'

const route = useRoute()
const router = useRouter()

const task = ref<ScanTask | null>(null)
const projects = ref<Project[]>([])
const loading = ref(false)

const taskId = computed(() => route.params.taskId as string)

const scanMetrics = computed(() => {
  if (!task.value?.scanResult) return []
  const result = task.value.scanResult
  return [
    {
      key: 'issues',
      label: '问题总数',
      value: result.issuesCount,
      suffix: '',
      icon: Warning,
      color: '#e6a23c',
    },
    {
      key: 'coverage',
      label: '覆盖率',
      value: result.coverage,
      suffix: '%',
      icon: TrendCharts,
      color: '#409eff',
    },
    {
      key: 'duplications',
      label: '重复行',
      value: result.duplicatedLines,
      suffix: '',
      icon: DataAnalysis,
      color: '#f56c6c',
    },
    { key: 'bugs', label: 'Bug', value: result.bugs, suffix: '', icon: Warning, color: '#e6a23c' },
    {
      key: 'vulnerabilities',
      label: '漏洞',
      value: result.vulnerabilities,
      suffix: '',
      icon: Lock,
      color: '#f56c6c',
    },
    {
      key: 'codeSmells',
      label: '代码异味',
      value: result.codeSmells,
      suffix: '',
      icon: Warning,
      color: '#909399',
    },
  ]
})

onMounted(() => {
  loadTask()
  loadProjects()
})

async function loadTask() {
  loading.value = true
  try {
    const data = await getTask(taskId.value)
    task.value = data
  } catch (error: any) {
    ElMessage.error(error.message || '加载任务详情失败')
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

function formatMetadataKey(key: string): string {
  const map: Record<string, string> = {
    commitHash: '提交哈希',
    commitMessage: '提交信息',
    author: '提交作者',
    scannerVersion: '扫描器版本',
  }
  return map[key] || key
}

function goBack() {
  router.push('/tasks')
}

function viewProject(projectKey: string) {
  router.push(`/project/${projectKey}`)
}

async function cancelTask() {
  if (!task.value) return
  try {
    await ElMessageBox.confirm('确定要取消这个任务吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    await cancelTaskApi(task.value.id)
    ElMessage.success('任务已取消')
    loadTask()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '取消任务失败')
    }
  }
}

async function retryTask() {
  if (!task.value) return
  try {
    await retryTaskApi(task.value.id)
    ElMessage.success('任务已重新提交')
    router.push('/tasks')
  } catch (error: any) {
    ElMessage.error(error.message || '重试任务失败')
  }
}

async function deleteTask() {
  if (!task.value) return
  try {
    await ElMessageBox.confirm('确定要删除这个任务吗？删除后无法恢复。', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    await deleteTaskApi(task.value.id)
    ElMessage.success('任务已删除')
    router.push('/tasks')
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除任务失败')
    }
  }
}
</script>

<style scoped>
.task-detail {
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

.header-actions {
  display: flex;
  gap: 10px;
}

.info-card,
.result-card,
.metadata-card,
.error-card {
  margin-bottom: 20px;
}
</style>
