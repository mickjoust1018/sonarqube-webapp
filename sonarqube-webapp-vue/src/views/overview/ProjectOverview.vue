<template>
  <div class="project-overview">
    <div class="page-header">
      <div class="header">
        <h2>{{ projectKey }} - 概览</h2>
        <div class="header-actions">
          <el-button-group>
            <el-button size="middle" @click="goToIssues">
              <el-icon><Warning /></el-icon>
              问题
            </el-button>
            <el-button size="middle" @click="goToCode">
              <el-icon><Document /></el-icon>
              代码
            </el-button>
            <el-button size="middle" @click="goToBranches">
              <el-icon><Connection /></el-icon>
              分支
            </el-button>
          </el-button-group>
          <el-button type="primary" size="middle" @click="refresh">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </div>
      </div>
    </div>
    <div class="page-content">
      <!-- 度量指标卡片 -->
      <el-row :gutter="20" class="metrics-row">
        <el-col :xs="24" :sm="12" :md="6" v-for="metric in metrics" :key="metric.key">
          <el-card
            class="metric-card"
            shadow="hover"
            :class="{ clickable: metric.key === 'issues' && metric.value > 0 }"
            @click="metric.key === 'issues' && metric.value > 0 ? goToIssues() : null"
          >
            <el-statistic :title="metric.label" :value="metric.value" :suffix="metric.suffix">
              <template #prefix>
                <el-icon :size="24" :color="metric.color">
                  <component :is="metric.icon" />
                </el-icon>
              </template>
            </el-statistic>
          </el-card>
        </el-col>
      </el-row>

      <!-- 图表控制栏 -->
      <el-card class="chart-controls-card" shadow="never" size="middle">
        <el-row :gutter="20" align="middle">
          <el-col :span="12">
            <el-radio-group v-model="chartType" size="middle">
              <el-radio-button label="issues">问题趋势</el-radio-button>
              <el-radio-button label="coverage">覆盖率趋势</el-radio-button>
              <el-radio-button label="duplications">重复率趋势</el-radio-button>
              <el-radio-button label="bugs">Bug趋势</el-radio-button>
            </el-radio-group>
          </el-col>
          <el-col :span="12" style="text-align: right">
            <el-select
              v-model="timeRange"
              size="middle"
              style="width: 150px"
              @change="handleTimeRangeChange"
            >
              <el-option label="最近7天" value="7" />
              <el-option label="最近30天" value="30" />
              <el-option label="最近90天" value="90" />
              <el-option label="最近1年" value="365" />
            </el-select>
          </el-col>
        </el-row>
      </el-card>

      <!-- 图表区域 -->
      <el-row :gutter="20" class="charts-row">
        <el-col :xs="24" :md="12">
          <el-card size="middle">
            <template #header>
              <h3>{{ getChartTitle() }}</h3>
            </template>
            <div ref="mainChartRef" class="chart-container"></div>
          </el-card>
        </el-col>
        <el-col :xs="24" :md="12">
          <el-card size="middle">
            <template #header>
              <h3>分支概览</h3>
            </template>
            <div v-if="branches.length > 0" class="branches-overview">
              <el-table :data="branches" style="width: 100%" size="middle">
                <el-table-column prop="name" label="分支名称" />
                <el-table-column prop="type" label="类型" width="100">
                  <template #default="{ row }">
                    <el-tag size="small" :type="row.isMain ? 'success' : 'info'">
                      {{ row.isMain ? '主分支' : row.type }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="status.qualityGateStatus" label="质量门" width="100">
                  <template #default="{ row }">
                    <el-tag
                      size="small"
                      :type="row.status?.qualityGateStatus === 'OK' ? 'success' : 'danger'"
                    >
                      {{ row.status?.qualityGateStatus || 'N/A' }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="analysisDate" label="分析时间" width="150">
                  <template #default="{ row }">
                    {{ formatDate(row.analysisDate) }}
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="100">
                  <template #default="{ row }">
                    <el-button link type="primary" size="middle" @click="goToBranch(row.name)">
                      查看
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
            <el-empty v-else description="暂无分支数据" />
          </el-card>
        </el-col>
      </el-row>

      <!-- 质量门状态 -->
      <el-card class="quality-gate-card" size="middle">
        <template #header>
          <h3>质量门状态</h3>
        </template>
        <div v-if="qualityGate" class="quality-gate-content">
          <el-row :gutter="20">
            <el-col :xs="24" :md="12">
              <div class="quality-gate-status">
                <el-result
                  :icon="qualityGate.status === 'OK' ? 'success' : 'error'"
                  :title="qualityGate.status === 'OK' ? '通过' : '未通过'"
                  :sub-title="qualityGate.name"
                >
                  <template #extra>
                    <el-button type="primary" size="middle" @click="viewQualityGate">
                      查看详情
                    </el-button>
                  </template>
                </el-result>
              </div>
            </el-col>
            <el-col :xs="24" :md="12">
              <div class="conditions-list">
                <h4 style="margin-top: 0; margin-bottom: 16px">条件列表</h4>
                <div
                  v-for="condition in qualityGate.conditions"
                  :key="condition.metric"
                  class="condition-item"
                >
                  <el-icon :color="condition.status === 'OK' ? '#67c23a' : '#f56c6c'" :size="20">
                    <component :is="condition.status === 'OK' ? 'Check' : 'Close'" />
                  </el-icon>
                  <span class="condition-label">{{ condition.metric }}</span>
                  <span class="condition-value">{{ condition.actualValue }}</span>
                  <el-tag :type="condition.status === 'OK' ? 'success' : 'danger'" size="small">
                    {{ condition.status }}
                  </el-tag>
                </div>
              </div>
            </el-col>
          </el-row>
        </div>
        <el-empty v-else description="暂无质量门数据" />
      </el-card>

      <!-- 关联任务 - 按分支分组 -->
      <el-card size="middle" class="tasks-card">
        <template #header>
          <div style="display: flex; justify-content: space-between; align-items: center">
            <h3>扫描任务（按分支分组）</h3>
            <el-button link type="primary" size="small" @click="goToTasks">查看全部</el-button>
          </div>
        </template>
        <div v-if="projectTasks.length > 0">
          <el-collapse v-model="activeBranchCollapse" accordion>
            <el-collapse-item v-for="(tasks, branch) in tasksByBranch" :key="branch" :name="branch">
              <template #title>
                <div style="display: flex; align-items: center; width: 100%">
                  <el-tag type="info" size="small" style="margin-right: 8px">{{ branch }}</el-tag>
                  <span style="flex: 1">共 {{ tasks.length }} 个任务</span>
                  <el-tag
                    v-if="tasks[0]?.status === 'SUCCESS'"
                    type="success"
                    size="small"
                    style="margin-right: 8px"
                  >
                    最新: 成功
                  </el-tag>
                  <el-tag
                    v-else-if="tasks[0]?.status === 'RUNNING'"
                    type="warning"
                    size="small"
                    style="margin-right: 8px"
                  >
                    最新: 执行中
                  </el-tag>
                  <el-tag
                    v-else-if="tasks[0]?.status === 'FAILED'"
                    type="danger"
                    size="small"
                    style="margin-right: 8px"
                  >
                    最新: 失败
                  </el-tag>
                </div>
              </template>
              <el-table :data="tasks" style="width: 100%" size="middle">
                <el-table-column prop="name" label="任务名称" min-width="200">
                  <template #default="{ row }">
                    <el-link type="primary" @click="viewTask(row.id)">{{ row.name }}</el-link>
                  </template>
                </el-table-column>
                <el-table-column prop="status" label="状态" width="100">
                  <template #default="{ row }">
                    <el-tag :type="getTaskStatusType(row.status)" size="small">
                      {{ getTaskStatusLabel(row.status) }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="progress" label="进度" width="120">
                  <template #default="{ row }">
                    <el-progress
                      v-if="row.status === 'RUNNING' && row.progress !== undefined"
                      :percentage="row.progress"
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
                <el-table-column label="操作" width="100">
                  <template #default="{ row }">
                    <el-button link type="primary" size="small" @click="viewTask(row.id)"
                      >查看</el-button
                    >
                  </template>
                </el-table-column>
              </el-table>
            </el-collapse-item>
          </el-collapse>
        </div>
        <el-empty v-else description="暂无扫描任务" />
      </el-card>

      <!-- 最近活动 -->
      <el-card size="middle">
        <template #header>
          <h3>最近活动</h3>
        </template>
        <el-timeline>
          <el-timeline-item
            v-for="(activity, index) in activities"
            :key="index"
            :timestamp="formatDate(activity.date)"
            placement="top"
            size="mini"
          >
            <el-card size="small">
              <h4 style="margin: 0 0 8px 0; font-size: 14px">{{ activity.category }}</h4>
              <p style="margin: 0; font-size: 13px; color: #606266">{{ activity.description }}</p>
            </el-card>
          </el-timeline-item>
        </el-timeline>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  Refresh,
  Warning,
  Lock,
  DataAnalysis,
  TrendCharts,
  Document,
  Connection,
} from '@element-plus/icons-vue'
import { format } from 'date-fns'
import * as d3Selection from 'd3-selection'
import * as d3Scale from 'd3-scale'
import * as d3Shape from 'd3-shape'
import * as d3Axis from 'd3-axis'
import { getProjectTasks } from '@/libs/commons/api/tasks'
import type { ScanTask } from '@/libs/commons/types/tasks'
import { TaskStatus } from '@/libs/commons/types/tasks'

const route = useRoute()
const router = useRouter()

const projectKey = computed(() => (route.params.id || route.params.projectKey) as string)

const metrics = ref([
  { key: 'issues', label: '问题总数', value: 0, suffix: '', icon: Warning, color: '#e6a23c' },
  { key: 'coverage', label: '覆盖率', value: 0, suffix: '%', icon: TrendCharts, color: '#409eff' },
  {
    key: 'duplications',
    label: '重复率',
    value: 0,
    suffix: '%',
    icon: DataAnalysis,
    color: '#f56c6c',
  },
  { key: 'security', label: '安全热点', value: 0, suffix: '', icon: Lock, color: '#909399' },
])

const qualityGate = ref<any>(null)
const activities = ref<any[]>([])
const mainChartRef = ref<HTMLElement>()
const branches = ref<any[]>([])
const chartType = ref('issues')
const timeRange = ref('30')
const projectTasks = ref<ScanTask[]>([])
const activeBranchCollapse = ref<string>('')

// 按分支分组的任务
const tasksByBranch = computed(() => {
  const grouped: Record<string, ScanTask[]> = {}
  projectTasks.value.forEach(task => {
    const branch = task.branch || 'unknown'
    if (!grouped[branch]) {
      grouped[branch] = []
    }
    grouped[branch].push(task)
  })
  // 按创建时间排序每个分支的任务
  Object.keys(grouped).forEach(branch => {
    grouped[branch].sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })
  })
  // 默认展开第一个分支
  if (!activeBranchCollapse.value && Object.keys(grouped).length > 0) {
    activeBranchCollapse.value = Object.keys(grouped)[0]
  }
  return grouped
})

onMounted(() => {
  loadOverviewData()
})

const issuesHistory = ref<Array<{ date: string; issues: number }>>([])
const coverageHistory = ref<Array<{ date: string; coverage: number }>>([])
const duplicationsHistory = ref<Array<{ date: string; duplications: number }>>([])
const bugsHistory = ref<Array<{ date: string; bugs: number }>>([])

async function loadOverviewData() {
  try {
    // 加载度量数据
    const { getComponentMeasures } = await import('@/libs/commons/api/measures')
    const measuresData = await getComponentMeasures({
      component: projectKey.value,
      metricKeys: 'issues,coverage,duplicated_lines_density,security_hotspots',
    })

    if (measuresData.component?.measures) {
      measuresData.component.measures.forEach((measure: any) => {
        const metric = metrics.value.find(m => m.key === measure.metric)
        if (metric) {
          metric.value = parseFloat(measure.value) || 0
        }
      })
    }

    // 加载质量门数据
    try {
      const { getQualityGateStatus } = await import('@/libs/commons/api/quality-gates')
      const qgData = await getQualityGateStatus({
        projectKey: projectKey.value,
      })
      qualityGate.value = qgData
    } catch (error) {
      // 忽略错误
    }

    // 加载活动数据
    try {
      const { searchProjectAnalyses } = await import('@/libs/commons/api/project-activity')
      const activityData = await searchProjectAnalyses({
        project: projectKey.value,
        ps: 10,
      })
      activities.value =
        activityData.analyses?.map(a => ({
          date: a.date,
          category: '分析',
          description: `分析日期: ${formatDate(a.date)}`,
        })) || []
    } catch (error) {
      // 忽略错误
    }

    // 加载分支数据
    try {
      const { listBranches } = await import('@/libs/commons/api/branches')
      const branchesData = await listBranches({ project: projectKey.value })
      branches.value = branchesData.branches || []
    } catch (error) {
      console.error('Failed to load branches:', error)
    }

    // 加载项目任务数据
    try {
      const tasksData = await getProjectTasks(projectKey.value, { ps: 100 })
      projectTasks.value = tasksData.tasks || []
    } catch (error) {
      console.error('Failed to load project tasks:', error)
    }

    // 加载历史数据用于图表
    await loadHistoryData()

    // 渲染图表
    setTimeout(() => {
      renderMainChart()
    }, 100)
  } catch (error: any) {
    ElMessage.error(error.message || '加载概览数据失败')
  }
}

async function loadHistoryData() {
  const days = parseInt(timeRange.value)
  try {
    const { getJSON } = await import('@/libs/shared/utils/request')

    // 加载问题历史数据
    try {
      const issuesData = await getJSON<any>('/api/measures/search_history', {
        component: projectKey.value,
        metrics: 'issues',
        ps: days,
      })
      if (issuesData.measures && issuesData.measures[0]?.history) {
        issuesHistory.value = issuesData.measures[0].history.map((h: any) => ({
          date: h.date,
          issues: parseFloat(h.value) || 0,
        }))
      }
    } catch {
      issuesHistory.value = generateSampleData('issues', days) as Array<{
        date: string
        issues: number
      }>
    }

    // 加载覆盖率历史数据
    try {
      const coverageData = await getJSON<any>('/api/measures/search_history', {
        component: projectKey.value,
        metrics: 'coverage',
        ps: days,
      })
      if (coverageData.measures && coverageData.measures[0]?.history) {
        coverageHistory.value = coverageData.measures[0].history.map((h: any) => ({
          date: h.date,
          coverage: parseFloat(h.value) || 0,
        }))
      }
    } catch {
      coverageHistory.value = generateSampleData('coverage', days) as Array<{
        date: string
        coverage: number
      }>
    }

    // 加载重复率历史数据
    try {
      const duplicationsData = await getJSON<any>('/api/measures/search_history', {
        component: projectKey.value,
        metrics: 'duplicated_lines_density',
        ps: days,
      })
      if (duplicationsData.measures && duplicationsData.measures[0]?.history) {
        duplicationsHistory.value = duplicationsData.measures[0].history.map((h: any) => ({
          date: h.date,
          duplications: parseFloat(h.value) || 0,
        }))
      }
    } catch {
      duplicationsHistory.value = generateSampleData('duplications', days) as Array<{
        date: string
        duplications: number
      }>
    }

    // 加载Bug历史数据
    try {
      const bugsData = await getJSON<any>('/api/measures/search_history', {
        component: projectKey.value,
        metrics: 'bugs',
        ps: days,
      })
      if (bugsData.measures && bugsData.measures[0]?.history) {
        bugsHistory.value = bugsData.measures[0].history.map((h: any) => ({
          date: h.date,
          bugs: parseFloat(h.value) || 0,
        }))
      }
    } catch {
      bugsHistory.value = generateSampleData('bugs', days) as Array<{ date: string; bugs: number }>
    }
  } catch (error) {
    console.error('Failed to load history data:', error)
    const days = parseInt(timeRange.value)
    issuesHistory.value = generateSampleData('issues', days) as Array<{
      date: string
      issues: number
    }>
    coverageHistory.value = generateSampleData('coverage', days) as Array<{
      date: string
      coverage: number
    }>
    duplicationsHistory.value = generateSampleData('duplications', days) as Array<{
      date: string
      duplications: number
    }>
    bugsHistory.value = generateSampleData('bugs', days) as Array<{ date: string; bugs: number }>
  }
}

function generateSampleData(type: string, days: number = 30) {
  const data = []
  const now = new Date()
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    const dateStr = format(new Date(date), 'yyyy-MM-dd')

    if (type === 'issues') {
      data.push({ date: dateStr, issues: Math.floor(Math.random() * 100) + 20 })
    } else if (type === 'coverage') {
      data.push({ date: dateStr, coverage: Math.floor(Math.random() * 30) + 60 })
    } else if (type === 'duplications') {
      data.push({ date: dateStr, duplications: Math.floor(Math.random() * 10) + 2 })
    } else if (type === 'bugs') {
      data.push({ date: dateStr, bugs: Math.floor(Math.random() * 20) + 1 })
    }
  }
  return data
}

function renderMainChart() {
  if (!mainChartRef.value) return

  switch (chartType.value) {
    case 'issues':
      renderIssuesChart()
      break
    case 'coverage':
      renderCoverageChart()
      break
    case 'duplications':
      renderDuplicationsChart()
      break
    case 'bugs':
      renderBugsChart()
      break
  }
}

function getChartTitle(): string {
  const titles: Record<string, string> = {
    issues: '问题趋势',
    coverage: '覆盖率趋势',
    duplications: '重复率趋势',
    bugs: 'Bug趋势',
  }
  return titles[chartType.value] || '趋势图'
}

function handleTimeRangeChange() {
  loadHistoryData().then(() => {
    setTimeout(() => {
      renderMainChart()
    }, 100)
  })
}

watch(chartType, () => {
  setTimeout(() => {
    renderMainChart()
  }, 100)
})

function renderIssuesChart() {
  if (!mainChartRef.value) return

  // 清空容器
  mainChartRef.value.innerHTML = ''

  const data =
    issuesHistory.value.length > 0
      ? issuesHistory.value
      : generateSampleData('issues', parseInt(timeRange.value))
  const displayData = data as Array<{ date: string; issues: number }>

  const width = mainChartRef.value.clientWidth || 400
  const height = 250
  const margin = { top: 20, right: 20, bottom: 50, left: 50 }

  if (!mainChartRef.value) return

  const svg = d3Selection
    .select(mainChartRef.value)
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('viewBox', `0 0 ${width} ${height}`)
    .attr('preserveAspectRatio', 'xMidYMid meet')

  const xScale = d3Scale
    .scaleBand()
    .domain(displayData.map(d => d.date))
    .range([margin.left, width - margin.right])
    .padding(0.1)

  const maxIssues = Math.max(...displayData.map(d => d.issues || 0), 0)
  const yScale = d3Scale
    .scaleLinear()
    .domain([0, maxIssues * 1.1])
    .nice()
    .range([height - margin.bottom, margin.top])

  // 绘制柱状图
  svg
    .selectAll('rect')
    .data(displayData)
    .enter()
    .append('rect')
    .attr('x', d => xScale(d.date) || 0)
    .attr('y', d => yScale(d.issues))
    .attr('width', xScale.bandwidth())
    .attr('height', d => height - margin.bottom - yScale(d.issues))
    .attr('fill', '#409eff')
    .attr('rx', 2)
    .on('mouseover', function (_event, d) {
      d3Selection.select(this).attr('fill', '#66b1ff')
      // 显示工具提示
      const tooltip = svg
        .append('g')
        .attr('class', 'tooltip')
        .attr(
          'transform',
          `translate(${(xScale(d.date) || 0) + xScale.bandwidth() / 2}, ${yScale(d.issues) - 10})`
        )
      tooltip
        .append('rect')
        .attr('x', -30)
        .attr('y', -20)
        .attr('width', 60)
        .attr('height', 20)
        .attr('fill', 'rgba(0, 0, 0, 0.8)')
        .attr('rx', 4)
      tooltip
        .append('text')
        .attr('text-anchor', 'middle')
        .attr('fill', 'white')
        .attr('font-size', '12px')
        .attr('y', -5)
        .text(`${d.issues}`)
    })
    .on('mouseout', function () {
      d3Selection.select(this).attr('fill', '#409eff')
      svg.selectAll('.tooltip').remove()
    })

  // 添加坐标轴
  const axisBottom = d3Axis.axisBottom(xScale).tickFormat((d: any) => {
    const date = new Date(d)
    return format(date, 'MM/dd')
  })
  const axisLeft = d3Axis.axisLeft(yScale).ticks(5)

  svg
    .append('g')
    .attr('transform', `translate(0, ${height - margin.bottom})`)
    .call(axisBottom)
    .selectAll('text')
    .attr('transform', 'rotate(-45)')
    .attr('text-anchor', 'end')
    .attr('dx', '-0.5em')
    .attr('dy', '0.5em')

  svg.append('g').attr('transform', `translate(${margin.left}, 0)`).call(axisLeft)
}

function renderCoverageChart() {
  if (!mainChartRef.value) return

  mainChartRef.value.innerHTML = ''

  const data =
    coverageHistory.value.length > 0
      ? coverageHistory.value
      : generateSampleData('coverage', parseInt(timeRange.value))
  const displayData = data as Array<{ date: string; coverage: number }>

  const width = mainChartRef.value.clientWidth || 400
  const height = 250
  const margin = { top: 20, right: 20, bottom: 50, left: 50 }

  if (!mainChartRef.value) return

  const svg = d3Selection
    .select(mainChartRef.value)
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('viewBox', `0 0 ${width} ${height}`)
    .attr('preserveAspectRatio', 'xMidYMid meet')

  const xScale = d3Scale
    .scaleBand()
    .domain(displayData.map(d => d.date))
    .range([margin.left, width - margin.right])
    .padding(0.1)

  const maxCoverage = Math.max(100, ...displayData.map(d => d.coverage || 0), 0)
  const yScale = d3Scale
    .scaleLinear()
    .domain([0, maxCoverage * 1.1])
    .nice()
    .range([height - margin.bottom, margin.top])

  // 绘制折线图
  const line = d3Shape
    .line<{ date: string; coverage: number }>()
    .x(d => (xScale(d.date) || 0) + xScale.bandwidth() / 2)
    .y(d => yScale(d.coverage))
    .curve(d3Shape.curveMonotoneX)

  svg
    .append('path')
    .datum(displayData)
    .attr('fill', 'none')
    .attr('stroke', '#67c23a')
    .attr('stroke-width', 2.5)
    .attr('d', line)

  // 添加数据点
  svg
    .selectAll('circle')
    .data(displayData)
    .enter()
    .append('circle')
    .attr('cx', d => (xScale(d.date) || 0) + xScale.bandwidth() / 2)
    .attr('cy', d => yScale(d.coverage))
    .attr('r', 4)
    .attr('fill', '#67c23a')
    .attr('stroke', 'white')
    .attr('stroke-width', 2)
    .on('mouseover', function (_event, d) {
      d3Selection.select(this).attr('r', 6)
      // 显示工具提示
      const tooltip = svg
        .append('g')
        .attr('class', 'tooltip')
        .attr(
          'transform',
          `translate(${(xScale(d.date) || 0) + xScale.bandwidth() / 2}, ${yScale(d.coverage) - 10})`
        )
      tooltip
        .append('rect')
        .attr('x', -30)
        .attr('y', -20)
        .attr('width', 60)
        .attr('height', 20)
        .attr('fill', 'rgba(0, 0, 0, 0.8)')
        .attr('rx', 4)
      tooltip
        .append('text')
        .attr('text-anchor', 'middle')
        .attr('fill', 'white')
        .attr('font-size', '12px')
        .attr('y', -5)
        .text(`${d.coverage}%`)
    })
    .on('mouseout', function () {
      d3Selection.select(this).attr('r', 4)
      svg.selectAll('.tooltip').remove()
    })

  // 添加坐标轴
  const axisBottom = d3Axis.axisBottom(xScale).tickFormat((d: any) => {
    const date = new Date(d)
    return format(date, 'MM/dd')
  })
  const axisLeft = d3Axis
    .axisLeft(yScale)
    .ticks(5)
    .tickFormat((d: any) => `${d}%`)

  svg
    .append('g')
    .attr('transform', `translate(0, ${height - margin.bottom})`)
    .call(axisBottom)
    .selectAll('text')
    .attr('transform', 'rotate(-45)')
    .attr('text-anchor', 'end')
    .attr('dx', '-0.5em')
    .attr('dy', '0.5em')

  svg.append('g').attr('transform', `translate(${margin.left}, 0)`).call(axisLeft)
}

function formatDate(date?: string): string {
  if (!date) return '-'
  try {
    return format(new Date(date), 'yyyy-MM-dd HH:mm')
  } catch {
    return date
  }
}

function refresh() {
  loadOverviewData()
}

function viewQualityGate() {
  router.push(`/project/${projectKey.value}/quality_gate`)
}

function goToIssues() {
  router.push(`/project/${projectKey.value}/issues`)
}

function goToCode() {
  router.push(`/project/${projectKey.value}/code`)
}

function goToBranches() {
  router.push(`/project/${projectKey.value}/branches`)
}

function goToTasks() {
  router.push(`/tasks?projectKey=${projectKey.value}`)
}

function viewTask(taskId: string) {
  router.push(`/tasks/${taskId}`)
}

function getTaskStatusType(status: TaskStatus): string {
  const map: Record<string, string> = {
    PENDING: 'info',
    RUNNING: 'warning',
    SUCCESS: 'success',
    FAILED: 'danger',
    CANCELLED: '',
  }
  return map[status] || ''
}

function getTaskStatusLabel(status: TaskStatus): string {
  const map: Record<string, string> = {
    PENDING: '待执行',
    RUNNING: '执行中',
    SUCCESS: '成功',
    FAILED: '失败',
    CANCELLED: '已取消',
  }
  return map[status] || status
}

function goToBranch(_branchName: string) {
  router.push(`/project/${projectKey.value}/branches`)
}

function renderDuplicationsChart() {
  if (!mainChartRef.value) return
  mainChartRef.value.innerHTML = ''

  const data =
    duplicationsHistory.value.length > 0
      ? duplicationsHistory.value
      : generateSampleData('duplications', parseInt(timeRange.value))
  renderLineChart(data, 'duplications', '%', '#f56c6c')
}

function renderBugsChart() {
  if (!mainChartRef.value) return
  mainChartRef.value.innerHTML = ''

  const data =
    bugsHistory.value.length > 0
      ? bugsHistory.value
      : generateSampleData('bugs', parseInt(timeRange.value))
  renderBarChart(data, 'bugs', '', '#e6a23c')
}

function renderLineChart(data: any[], valueKey: string, suffix: string, color: string) {
  const width = mainChartRef.value!.clientWidth || 400
  const height = 250
  const margin = { top: 20, right: 20, bottom: 50, left: 50 }

  if (!mainChartRef.value) return

  const svg = d3Selection
    .select(mainChartRef.value)
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('viewBox', `0 0 ${width} ${height}`)
    .attr('preserveAspectRatio', 'xMidYMid meet')

  const xScale = d3Scale
    .scaleBand()
    .domain(data.map(d => d.date))
    .range([margin.left, width - margin.right])
    .padding(0.1)

  const maxValue = Math.max(...data.map(d => d[valueKey] || 0))
  const yScale = d3Scale
    .scaleLinear()
    .domain([0, maxValue * 1.1])
    .nice()
    .range([height - margin.bottom, margin.top])

  const line = d3Shape
    .line<any>()
    .x(d => (xScale(d.date) || 0) + xScale.bandwidth() / 2)
    .y(d => yScale(d[valueKey] || 0))
    .curve(d3Shape.curveMonotoneX)

  svg
    .append('path')
    .datum(data)
    .attr('fill', 'none')
    .attr('stroke', color)
    .attr('stroke-width', 2.5)
    .attr('d', line)

  svg
    .selectAll('circle')
    .data(data)
    .enter()
    .append('circle')
    .attr('cx', d => (xScale(d.date) || 0) + xScale.bandwidth() / 2)
    .attr('cy', d => yScale(d[valueKey] || 0))
    .attr('r', 4)
    .attr('fill', color)
    .attr('stroke', 'white')
    .attr('stroke-width', 2)

  const axisBottom = d3Axis.axisBottom(xScale).tickFormat((d: any) => {
    const date = new Date(d)
    return format(date, 'MM/dd')
  })
  const axisLeft = d3Axis
    .axisLeft(yScale)
    .ticks(5)
    .tickFormat((d: any) => `${d}${suffix}`)

  svg
    .append('g')
    .attr('transform', `translate(0, ${height - margin.bottom})`)
    .call(axisBottom)
    .selectAll('text')
    .attr('transform', 'rotate(-45)')
    .attr('text-anchor', 'end')
    .attr('dx', '-0.5em')
    .attr('dy', '0.5em')

  svg.append('g').attr('transform', `translate(${margin.left}, 0)`).call(axisLeft)
}

function renderBarChart(data: any[], valueKey: string, suffix: string, color: string) {
  const width = mainChartRef.value!.clientWidth || 400
  const height = 250
  const margin = { top: 20, right: 20, bottom: 50, left: 50 }

  if (!mainChartRef.value) return

  const svg = d3Selection
    .select(mainChartRef.value)
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('viewBox', `0 0 ${width} ${height}`)
    .attr('preserveAspectRatio', 'xMidYMid meet')

  const xScale = d3Scale
    .scaleBand()
    .domain(data.map(d => d.date))
    .range([margin.left, width - margin.right])
    .padding(0.1)

  const maxValue = Math.max(...data.map(d => d[valueKey] || 0))
  const yScale = d3Scale
    .scaleLinear()
    .domain([0, maxValue * 1.1])
    .nice()
    .range([height - margin.bottom, margin.top])

  svg
    .selectAll('rect')
    .data(data)
    .enter()
    .append('rect')
    .attr('x', d => xScale(d.date) || 0)
    .attr('y', d => yScale(d[valueKey] || 0))
    .attr('width', xScale.bandwidth())
    .attr('height', d => height - margin.bottom - yScale(d[valueKey] || 0))
    .attr('fill', color)
    .attr('rx', 2)

  const axisBottom = d3Axis.axisBottom(xScale).tickFormat((d: any) => {
    const date = new Date(d)
    return format(date, 'MM/dd')
  })
  const axisLeft = d3Axis
    .axisLeft(yScale)
    .ticks(5)
    .tickFormat((d: any) => `${d}${suffix}`)

  svg
    .append('g')
    .attr('transform', `translate(0, ${height - margin.bottom})`)
    .call(axisBottom)
    .selectAll('text')
    .attr('transform', 'rotate(-45)')
    .attr('text-anchor', 'end')
    .attr('dx', '-0.5em')
    .attr('dy', '0.5em')

  svg.append('g').attr('transform', `translate(${margin.left}, 0)`).call(axisLeft)
}
</script>

<style scoped>
.project-overview {
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
  gap: 12px;
  align-items: center;
}

.metrics-row {
  margin-bottom: 20px;
}

.metric-card {
  text-align: center;
  transition: all 0.3s;
}

.metric-card.clickable {
  cursor: pointer;
}

.metric-card.clickable:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.charts-row {
  margin-bottom: 20px;
}

.chart-container {
  height: 250px;
  width: 100%;
  min-height: 250px;
}

.quality-gate-card {
  margin-bottom: 20px;
}

.quality-gate-content {
  padding: 20px;
}

.quality-gate-status {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
}

.conditions-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 16px;
  background: #f5f7fa;
  border-radius: 4px;
  min-height: 200px;
}

.condition-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background: #f5f7fa;
  border-radius: 4px;
}

.condition-label {
  flex: 1;
  font-weight: 500;
}

.condition-value {
  color: #909399;
  margin-right: 10px;
}

.chart-controls-card {
  margin-bottom: 20px;
}

.branches-overview {
  padding: 10px 0;
}

.tasks-card {
  margin-bottom: 20px;
}
</style>
