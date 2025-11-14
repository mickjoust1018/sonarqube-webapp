<template>
  <div class="code-viewer-page">
    <div class="code-header">
      <div class="breadcrumbs">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item
            v-for="(crumb, index) in breadcrumbs"
            :key="index"
            @click="handleBreadcrumbClick(crumb)"
          >
            {{ crumb.name }}
          </el-breadcrumb-item>
        </el-breadcrumb>
      </div>
      <div class="header-actions">
        <el-select
          v-model="selectedBranch"
          :placeholder="t('codeViewer.selectBranch')"
          size="small"
          style="width: 200px"
          @change="handleBranchChange"
        >
          <el-option
            v-for="branch in branches"
            :key="branch.name"
            :label="branch.name"
            :value="branch.name"
          >
            <span>{{ branch.name }}</span>
            <el-tag v-if="branch.isMain" size="small" type="success" style="margin-left: 8px">
              {{ t('codeViewer.mainBranch') }}
            </el-tag>
          </el-option>
        </el-select>
        <el-button
          v-if="selectedComponent"
          :icon="Search"
          size="small"
          @click="showSearchDialog = true"
        >
          {{ t('codeViewer.search') }}
        </el-button>
      </div>
    </div>
    <div class="code-content">
      <div class="file-tree-container">
        <FileTree
          v-if="baseComponent"
          :components="components"
          :base-component="baseComponent"
          @select="handleFileSelect"
        />
      </div>
      <div class="source-container">
        <div v-if="selectedComponent" class="source-header">
          <span class="file-name">{{ selectedComponent.name }}</span>
          <div class="file-measures">
            <el-tag
              v-for="measure in selectedComponent.measures"
              :key="measure.metric"
              size="small"
              type="info"
            >
              {{ formatMeasure(measure) }}
            </el-tag>
          </div>
        </div>
        <SourceViewer
          v-if="selectedComponent"
          :component-key="selectedComponent.key"
          :branch="selectedBranch"
          :issues="fileIssues"
          @issue-click="handleIssueClick"
        />
        <div v-else class="empty-state">
          <el-empty :description="t('codeViewer.selectFile')" />
        </div>
      </div>
    </div>
    <el-dialog v-model="showSearchDialog" :title="t('codeViewer.searchInFile')" width="600px">
      <el-input
        v-model="searchQuery"
        :placeholder="t('codeViewer.searchPlaceholder')"
        clearable
        @keyup.enter="performSearch"
      />
      <template #footer>
        <el-button @click="showSearchDialog = false">{{ t('common.cancel') }}</el-button>
        <el-button type="primary" @click="performSearch">{{ t('common.search') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Search } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useI18n } from '@/composables/useI18n'
import FileTree from '@/components/code/FileTree.vue'
import SourceViewer from '@/components/code/SourceViewer.vue'
import {
  getComponentTree,
  getBreadcrumbs,
  type ComponentMeasure,
} from '@/libs/commons/api/components'
import { getBranches, type Branch } from '@/libs/commons/api/branches'
import { searchIssues } from '@/libs/commons/api/issues'
import { mockSources } from '@/libs/shared/mocks/mockData'
import type { Issue } from '@/libs/commons/types/issues'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const projectKey = computed(() => (route.params.id || route.params.projectKey) as string)
const selectedBranch = ref<string>('main')
const branches = ref<Branch[]>([])
const components = ref<ComponentMeasure[]>([])
const baseComponent = ref<ComponentMeasure | null>(null)
const selectedComponent = ref<ComponentMeasure | null>(null)
const breadcrumbs = ref<ComponentMeasure[]>([])
const showSearchDialog = ref(false)
const searchQuery = ref('')
const fileIssues = ref<
  Array<{
    line: number
    key: string
    severity: string
    message?: string
    textRange?: {
      startLine: number
      endLine: number
      startOffset: number
      endOffset: number
    }
  }>
>([])

onMounted(() => {
  if (!projectKey.value) {
    ElMessage.warning('请先选择项目')
    router.push('/projects')
    return
  }
  loadBranches()
  loadComponentTree()
})

watch(
  () => route.query.component,
  component => {
    if (component) {
      const comp = components.value.find((c: ComponentMeasure) => c.key === component)
      if (comp) {
        selectComponent(comp)
      }
    }
  }
)

watch(
  () => route.query.line,
  line => {
    if (line && selectedComponent.value) {
      // 延迟一下，等待 SourceViewer 加载完成
      setTimeout(() => {
        const lineNum = parseInt(String(line))
        if (!isNaN(lineNum)) {
          // 触发滚动到指定行
          const event = new CustomEvent('scroll-to-line', { detail: { line: lineNum } })
          window.dispatchEvent(event)
        }
      }, 500)
    }
  }
)

async function loadBranches() {
  if (!projectKey.value) return
  try {
    const data = await getBranches(projectKey.value)
    branches.value = data
    if (data.length > 0) {
      const mainBranch = data.find(b => b.isMain)
      selectedBranch.value = mainBranch?.name || data[0].name
    }
  } catch (error) {
    console.error('Failed to load branches:', error)
  }
}

async function loadComponentTree() {
  if (!projectKey.value) return
  try {
    // 优先使用 mock 数据
    const { mockComponentTree } = await import('@/libs/shared/mocks/mockData')
    if (mockComponentTree[projectKey.value]) {
      const data = mockComponentTree[projectKey.value]
      baseComponent.value = data.baseComponent
      components.value = data.components
      if (route.query.component) {
        const comp = components.value.find((c: ComponentMeasure) => c.key === route.query.component)
        if (comp) {
          selectComponent(comp)
        }
      }
      return
    }

    // 如果没有 mock 数据，尝试从 API 获取
    const data = await getComponentTree(projectKey.value, 'children', [
      'coverage',
      'ncloc',
      'complexity',
    ])
    baseComponent.value = data.baseComponent
    components.value = data.components
    if (route.query.component) {
      const comp = components.value.find((c: ComponentMeasure) => c.key === route.query.component)
      if (comp) {
        selectComponent(comp)
      }
    }
  } catch (error: any) {
    console.error('Failed to load component tree:', error)
    // 如果 API 失败，尝试使用 mock 数据
    const { mockComponentTree } = await import('@/libs/shared/mocks/mockData')
    if (mockComponentTree[projectKey.value]) {
      const data = mockComponentTree[projectKey.value]
      baseComponent.value = data.baseComponent
      components.value = data.components
    } else {
      ElMessage.error(error?.message || t('codeViewer.loadTreeFailed'))
    }
  }
}

async function selectComponent(component: ComponentMeasure) {
  if (component.qualifier !== 'FIL') return

  selectedComponent.value = component
  await loadComponentIssues(component.key)

  try {
    const crumbs = await getBreadcrumbs(component.key, selectedBranch.value)
    breadcrumbs.value = crumbs
  } catch (error) {
    console.error('Failed to load breadcrumbs:', error)
  }

  router.replace({
    query: { ...route.query, component: component.key },
  })
}

async function loadComponentIssues(componentKey: string) {
  try {
    // 先尝试从 mock 数据获取
    if (mockSources[componentKey]?.issues) {
      fileIssues.value = mockSources[componentKey].issues.map(issue => ({
        line: issue.line,
        key: issue.key,
        severity: issue.severity,
        message: issue.message,
        textRange: issue.textRange,
      }))
      return
    }

    // 从 API 获取问题
    const response = await searchIssues({
      componentKeys: componentKey,
      resolved: 'false',
      ps: 500, // 获取最多 500 个问题
    })

    fileIssues.value = response.issues
      .filter((issue: Issue) => issue.component === componentKey && issue.line)
      .map((issue: Issue) => ({
        line: issue.line!,
        key: issue.key,
        severity: issue.severity,
        message: issue.message,
        textRange: issue.flows?.[0]?.locations?.[0]?.textRange
          ? {
              startLine: issue.flows[0].locations[0].textRange.startLine,
              endLine: issue.flows[0].locations[0].textRange.endLine,
              startOffset: 0,
              endOffset: 0,
            }
          : undefined,
      }))
  } catch (error) {
    console.error('Failed to load component issues:', error)
    // 如果 API 失败，尝试使用 mock 数据
    if (mockSources[componentKey]?.issues) {
      fileIssues.value = mockSources[componentKey].issues.map(issue => ({
        line: issue.line,
        key: issue.key,
        severity: issue.severity,
        message: issue.message,
        textRange: issue.textRange,
      }))
    } else {
      fileIssues.value = []
    }
  }
}

function handleFileSelect(component: ComponentMeasure) {
  selectComponent(component)
}

function handleBreadcrumbClick(crumb: ComponentMeasure) {
  if (crumb.qualifier === 'FIL') {
    selectComponent(crumb)
  } else {
    // 重新加载组件树，显示该目录下的文件
    loadComponentTree()
  }
}

function handleBranchChange() {
  if (selectedComponent.value) {
    selectComponent(selectedComponent.value)
  }
}

function handleIssueClick(issue: {
  line: number
  key: string
  severity: string
  message?: string
  textRange?: {
    startLine: number
    endLine: number
    startOffset: number
    endOffset: number
  }
}) {
  router.push({
    name: 'Issues',
    query: { issues: issue.key },
  })
}

function formatMeasure(measure: { metric: string; value: string }): string {
  const metricMap: Record<string, string> = {
    coverage: t('codeViewer.coverage'),
    ncloc: t('codeViewer.lines'),
    complexity: t('codeViewer.complexity'),
  }
  const metricName = metricMap[measure.metric] || measure.metric
  return `${metricName}: ${measure.value}`
}

function performSearch() {
  // TODO: 实现代码搜索功能
  ElMessage.info(t('codeViewer.searchNotImplemented'))
  showSearchDialog.value = false
}
</script>

<style scoped>
.code-viewer-page {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.code-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid var(--el-border-color);
  background: #fff;
}

.breadcrumbs {
  flex: 1;
}

.breadcrumbs :deep(.el-breadcrumb__item) {
  cursor: pointer;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.code-content {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.file-tree-container {
  width: 320px;
  flex-shrink: 0;
  padding: 16px;
  background: #f5f7fa;
  overflow: hidden;
}

.source-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #fff;
}

.source-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid var(--el-border-color);
  background: #fafafa;
}

.file-name {
  font-weight: 500;
  font-size: 14px;
}

.file-measures {
  display: flex;
  gap: 8px;
}

.empty-state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
