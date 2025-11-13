<template>
  <div class="source-viewer">
    <div v-if="loading" class="loading">
      <el-icon class="is-loading"><Loading /></el-icon>
      <span>{{ t('codeViewer.loading') }}</span>
    </div>
    <div v-else-if="sources.length === 0" class="empty">
      <el-empty :description="t('codeViewer.noCode')" />
    </div>
    <div v-else class="source-content">
      <div class="source-lines">
        <div
          v-for="source in sources"
          :key="source.line"
          :class="['source-line', { 'has-issue': hasIssue(source.line) }]"
          :data-line="source.line"
        >
          <span class="line-number">{{ source.line }}</span>
          <span class="line-code" v-html="highlightCode(source.code, source.line)"></span>
          <div v-if="hasIssue(source.line)" class="line-issues">
            <el-tag
              v-for="issue in getIssuesForLine(source.line)"
              :key="issue.key"
              :type="getSeverityType(issue.severity)"
              size="small"
              @click="handleIssueClick(issue)"
            >
              {{ issue.severity }}
            </el-tag>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { Loading } from '@element-plus/icons-vue'
import { useI18n } from '@/composables/useI18n'
import { getSources, type SourceLine } from '@/libs/commons/api/components'
import hljs from 'highlight.js'
import 'highlight.js/styles/github.css'

const { t } = useI18n()

interface Issue {
  line: number
  key: string
  severity: string
}

const props = defineProps<{
  componentKey: string
  branch?: string
  pullRequest?: string
  issues?: Issue[]
}>()

const emit = defineEmits<{
  (e: 'issue-click', issue: Issue): void
}>()

const loading = ref(false)
const sources = ref<SourceLine[]>([])

watch(
  () => [props.componentKey, props.branch, props.pullRequest],
  () => {
    loadSources()
  },
  { immediate: true }
)

async function loadSources() {
  if (!props.componentKey) return

  loading.value = true
  try {
    const data = await getSources(
      props.componentKey,
      undefined,
      undefined,
      props.branch,
      props.pullRequest
    )
    sources.value = data
  } catch (error) {
    console.error('Failed to load sources:', error)
    sources.value = []
  } finally {
    loading.value = false
  }
}

function highlightCode(code: string, line: number): string {
  if (!code || code.trim() === '') {
    return '&nbsp;'
  }
  try {
    return hljs.highlightAuto(code).value
  } catch {
    return code
  }
}

function hasIssue(line: number): boolean {
  return props.issues?.some((issue) => issue.line === line) || false
}

function getIssuesForLine(line: number): Issue[] {
  return props.issues?.filter((issue) => issue.line === line) || []
}

function getSeverityType(severity: string): string {
  const typeMap: Record<string, string> = {
    BLOCKER: 'danger',
    CRITICAL: 'danger',
    MAJOR: 'warning',
    MINOR: 'info',
    INFO: '',
  }
  return typeMap[severity] || ''
}

function handleIssueClick(issue: Issue) {
  emit('issue-click', issue)
}
</script>

<style scoped>
.source-viewer {
  flex: 1;
  overflow: auto;
  background: #fff;
}

.loading,
.empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  gap: 8px;
}

.source-content {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 13px;
  line-height: 1.6;
}

.source-lines {
  padding: 12px 0;
}

.source-line {
  display: flex;
  align-items: flex-start;
  padding: 2px 12px;
  position: relative;
}

.source-line:hover {
  background: #f5f5f5;
}

.source-line.has-issue {
  background: #fff3cd;
}

.line-number {
  display: inline-block;
  width: 60px;
  text-align: right;
  padding-right: 12px;
  color: #999;
  user-select: none;
  flex-shrink: 0;
}

.line-code {
  flex: 1;
  padding-right: 12px;
  overflow-x: auto;
}

.line-code :deep(pre) {
  margin: 0;
  background: transparent;
  padding: 0;
}

.line-issues {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}

.line-issues .el-tag {
  cursor: pointer;
}
</style>
