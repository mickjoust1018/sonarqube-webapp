<template>
  <div class="project-overview">
    <el-container>
      <el-header>
        <div class="header">
          <h2>{{ projectKey }} - 概览</h2>
          <div class="header-actions">
            <el-button-group>
              <el-button @click="goToIssues">
                <el-icon><Warning /></el-icon>
                问题
              </el-button>
              <el-button @click="goToCode">
                <el-icon><Document /></el-icon>
                代码
              </el-button>
              <el-button @click="goToBranches">
                <el-icon><Connection /></el-icon>
                分支
              </el-button>
            </el-button-group>
            <el-button type="primary" @click="refresh">
              <el-icon><Refresh /></el-icon>
              刷新
            </el-button>
          </div>
        </div>
      </el-header>
      <el-main>
        <!-- 度量指标卡片 -->
        <el-row :gutter="20" class="metrics-row">
          <el-col :xs="24" :sm="12" :md="6" v-for="metric in metrics" :key="metric.key">
            <el-card class="metric-card" shadow="hover">
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

        <!-- 图表区域 -->
        <el-row :gutter="20" class="charts-row">
          <el-col :xs="24" :md="12">
            <el-card>
              <template #header>
                <h3>问题趋势</h3>
              </template>
              <div ref="issuesChartRef" class="chart-container"></div>
            </el-card>
          </el-col>
          <el-col :xs="24" :md="12">
            <el-card>
              <template #header>
                <h3>覆盖率趋势</h3>
              </template>
              <div ref="coverageChartRef" class="chart-container"></div>
            </el-card>
          </el-col>
        </el-row>

        <!-- 质量门状态 -->
        <el-card class="quality-gate-card">
          <template #header>
            <h3>质量门状态</h3>
          </template>
          <div v-if="qualityGate" class="quality-gate-content">
            <el-result
              :icon="qualityGate.status === 'OK' ? 'success' : 'error'"
              :title="qualityGate.status === 'OK' ? '通过' : '未通过'"
              :sub-title="qualityGate.name"
            >
              <template #extra>
                <el-button type="primary" @click="viewQualityGate">查看详情</el-button>
              </template>
            </el-result>
            <el-divider />
            <div class="conditions-list">
              <div
                v-for="condition in qualityGate.conditions"
                :key="condition.metric"
                class="condition-item"
              >
                <el-icon
                  :color="condition.status === 'OK' ? '#67c23a' : '#f56c6c'"
                  :size="20"
                >
                  <component :is="condition.status === 'OK' ? 'Check' : 'Close'" />
                </el-icon>
                <span class="condition-label">{{ condition.metric }}</span>
                <span class="condition-value">{{ condition.actualValue }}</span>
                <el-tag
                  :type="condition.status === 'OK' ? 'success' : 'danger'"
                  size="small"
                >
                  {{ condition.status }}
                </el-tag>
              </div>
            </div>
          </div>
          <el-empty v-else description="暂无质量门数据" />
        </el-card>

        <!-- 最近活动 -->
        <el-card>
          <template #header>
            <h3>最近活动</h3>
          </template>
          <el-timeline>
            <el-timeline-item
              v-for="(activity, index) in activities"
              :key="index"
              :timestamp="formatDate(activity.date)"
              placement="top"
            >
              <el-card>
                <h4>{{ activity.category }}</h4>
                <p>{{ activity.description }}</p>
              </el-card>
            </el-timeline-item>
          </el-timeline>
        </el-card>
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Refresh, Check, Close, Warning, Lock, DataAnalysis, TrendCharts, Document, Connection } from '@element-plus/icons-vue'
import { getJSON } from '@/libs/shared/utils/request'
import { format } from 'date-fns'
import * as d3Selection from 'd3-selection'
import * as d3Scale from 'd3-scale'
import * as d3Shape from 'd3-shape'
import * as d3Array from 'd3-array'
import * as d3Axis from 'd3-axis'

const route = useRoute()
const router = useRouter()

const projectKey = computed(() => route.params.projectKey as string)

const metrics = ref([
  { key: 'issues', label: '问题总数', value: 0, suffix: '', icon: Warning, color: '#e6a23c' },
  { key: 'coverage', label: '覆盖率', value: 0, suffix: '%', icon: TrendCharts, color: '#409eff' },
  { key: 'duplications', label: '重复率', value: 0, suffix: '%', icon: DataAnalysis, color: '#f56c6c' },
  { key: 'security', label: '安全热点', value: 0, suffix: '', icon: Lock, color: '#909399' },
])

const qualityGate = ref<any>(null)
const activities = ref<any[]>([])
const issuesChartRef = ref<HTMLElement>()
const coverageChartRef = ref<HTMLElement>()

onMounted(() => {
  loadOverviewData()
})

const issuesHistory = ref<Array<{ date: string; issues: number }>>([])
const coverageHistory = ref<Array<{ date: string; coverage: number }>>([])

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
        const metric = metrics.value.find((m) => m.key === measure.metric)
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
      activities.value = activityData.analyses?.map((a) => ({
        date: a.date,
        category: '分析',
        description: `分析日期: ${formatDate(a.date)}`,
      })) || []
    } catch (error) {
      // 忽略错误
    }

    // 加载历史数据用于图表
    await loadHistoryData()

    // 渲染图表
    setTimeout(() => {
      renderCharts()
    }, 100)
  } catch (error: any) {
    ElMessage.error(error.message || '加载概览数据失败')
  }
}

async function loadHistoryData() {
  try {
    // 加载问题历史数据
    const { getJSON } = await import('@/libs/shared/utils/request')
    try {
      const issuesData = await getJSON<any>('/api/measures/search_history', {
        component: projectKey.value,
        metrics: 'issues',
        ps: 30,
      })
      if (issuesData.measures && issuesData.measures[0]?.history) {
        issuesHistory.value = issuesData.measures[0].history.map((h: any) => ({
          date: h.date,
          issues: parseFloat(h.value) || 0,
        }))
      }
    } catch {
      // 使用示例数据
      issuesHistory.value = generateSampleData('issues') as Array<{ date: string; issues: number }>
    }

    // 加载覆盖率历史数据
    try {
      const coverageData = await getJSON<any>('/api/measures/search_history', {
        component: projectKey.value,
        metrics: 'coverage',
        ps: 30,
      })
      if (coverageData.measures && coverageData.measures[0]?.history) {
        coverageHistory.value = coverageData.measures[0].history.map((h: any) => ({
          date: h.date,
          coverage: parseFloat(h.value) || 0,
        }))
      }
    } catch {
      // 使用示例数据
      coverageHistory.value = generateSampleData('coverage') as Array<{ date: string; coverage: number }>
    }
  } catch (error) {
    console.error('Failed to load history data:', error)
    issuesHistory.value = generateSampleData('issues') as Array<{ date: string; issues: number }>
    coverageHistory.value = generateSampleData('coverage') as Array<{ date: string; coverage: number }>
  }
}

function generateSampleData(type: string) {
  const data = []
  const now = new Date()
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    if (type === 'issues') {
      data.push({
        date: format(new Date(date), 'yyyy-MM-dd'),
        issues: Math.floor(Math.random() * 100) + 20,
      })
    } else {
      data.push({
        date: format(new Date(date), 'yyyy-MM-dd'),
        coverage: Math.floor(Math.random() * 30) + 60,
      })
    }
  }
  return data
}

function renderCharts() {
  // 问题趋势图
  if (issuesChartRef.value) {
    renderIssuesChart()
  }

  // 覆盖率趋势图
  if (coverageChartRef.value) {
    renderCoverageChart()
  }
}

function renderIssuesChart() {
  if (!issuesChartRef.value) return

  // 清空容器
  issuesChartRef.value.innerHTML = ''

  const data = issuesHistory.value.length > 0 ? issuesHistory.value : generateSampleData('issues')

  // 只显示最近的数据点（最多20个）
  const displayData = data.slice(-20)

  const width = issuesChartRef.value.clientWidth || 400
  const height = 250
  const margin = { top: 20, right: 20, bottom: 50, left: 50 }

  const svg = d3Selection
    .select(issuesChartRef.value)
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('viewBox', `0 0 ${width} ${height}`)
    .attr('preserveAspectRatio', 'xMidYMid meet')

  const xScale = d3Scale
    .scaleBand()
    .domain(displayData.map((d) => d.date))
    .range([margin.left, width - margin.right])
    .padding(0.1)

  const maxIssues = (d3Array.max(displayData, (d) => d.issues) as number) || 0
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
    .attr('x', (d) => xScale(d.date) || 0)
    .attr('y', (d) => yScale(d.issues))
    .attr('width', xScale.bandwidth())
    .attr('height', (d) => height - margin.bottom - yScale(d.issues))
    .attr('fill', '#409eff')
    .attr('rx', 2)
    .on('mouseover', function (_event, d) {
      d3Selection.select(this).attr('fill', '#66b1ff')
      // 显示工具提示
      const tooltip = svg
        .append('g')
        .attr('class', 'tooltip')
        .attr('transform', `translate(${(xScale(d.date) || 0) + xScale.bandwidth() / 2}, ${yScale(d.issues) - 10})`)
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

  svg
    .append('g')
    .attr('transform', `translate(${margin.left}, 0)`)
    .call(axisLeft)
}

function renderCoverageChart() {
  if (!coverageChartRef.value) return

  coverageChartRef.value.innerHTML = ''

  const data = coverageHistory.value.length > 0 ? coverageHistory.value : generateSampleData('coverage')

  // 只显示最近的数据点（最多20个）
  const displayData = data.slice(-20)

  const width = coverageChartRef.value.clientWidth || 400
  const height = 250
  const margin = { top: 20, right: 20, bottom: 50, left: 50 }

  const svg = d3Selection
    .select(coverageChartRef.value)
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('viewBox', `0 0 ${width} ${height}`)
    .attr('preserveAspectRatio', 'xMidYMid meet')

  const xScale = d3Scale
    .scaleBand()
    .domain(displayData.map((d) => d.date))
    .range([margin.left, width - margin.right])
    .padding(0.1)

  const maxCoverage = Math.max(100, (d3Array.max(displayData, (d) => d.coverage) as number) || 0)
  const yScale = d3Scale
    .scaleLinear()
    .domain([0, maxCoverage * 1.1])
    .nice()
    .range([height - margin.bottom, margin.top])

  // 绘制折线图
  const line = d3Shape
    .line<{ date: string; coverage: number }>()
    .x((d) => (xScale(d.date) || 0) + xScale.bandwidth() / 2)
    .y((d) => yScale(d.coverage))
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
    .attr('cx', (d) => (xScale(d.date) || 0) + xScale.bandwidth() / 2)
    .attr('cy', (d) => yScale(d.coverage))
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
        .attr('transform', `translate(${(xScale(d.date) || 0) + xScale.bandwidth() / 2}, ${yScale(d.coverage) - 10})`)
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
  const axisLeft = d3Axis.axisLeft(yScale).ticks(5).tickFormat((d: any) => `${d}%`)

  svg
    .append('g')
    .attr('transform', `translate(0, ${height - margin.bottom})`)
    .call(axisBottom)
    .selectAll('text')
    .attr('transform', 'rotate(-45)')
    .attr('text-anchor', 'end')
    .attr('dx', '-0.5em')
    .attr('dy', '0.5em')

  svg
    .append('g')
    .attr('transform', `translate(${margin.left}, 0)`)
    .call(axisLeft)
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
</script>


<style scoped>
.project-overview {
  padding: 20px;
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

.conditions-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
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
</style>
