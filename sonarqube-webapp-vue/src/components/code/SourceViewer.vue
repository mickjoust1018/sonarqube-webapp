<template>
  <div class="source-viewer">
    <div v-if="loading" class="loading">
      <el-icon class="is-loading"><Loading /></el-icon>
      <span>{{ t('codeViewer.loading') }}</span>
    </div>
    <div v-else-if="sources.length === 0" class="empty">
      <el-empty :description="t('codeViewer.noCode')" />
    </div>
    <div v-else class="source-content" ref="sourceContentRef" tabindex="0" @keydown="handleKeyDown">
      <div class="source-lines">
        <div
          v-for="source in sources"
          :key="source.line"
          :class="[
            'source-line',
            { 'has-issue': hasIssue(source.line), highlighted: highlightedLine === source.line },
          ]"
          :data-line="source.line"
          :ref="
            el => {
              if (el) lineRefs[source.line] = el as HTMLElement
            }
          "
        >
          <span class="line-number">{{ source.line }}</span>
          <span class="line-code" v-html="highlightCode(source.code)"></span>
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
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue'
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
const sourceContentRef = ref<HTMLElement>()
const highlightedLine = ref<number | null>(null)
const lineRefs = ref<Record<number, HTMLElement>>({})

watch(
  () => [props.componentKey, props.branch, props.pullRequest],
  () => {
    loadSources()
    highlightedLine.value = null
  },
  { immediate: true }
)

watch(sources, () => {
  nextTick(() => {
    // 聚焦到容器以便接收键盘事件
    if (sourceContentRef.value) {
      sourceContentRef.value.focus()
    }
    // 检查是否有需要滚动到的行
    checkScrollToLine()
  })
})

function handleScrollToLine(event: Event) {
  const customEvent = event as CustomEvent<{ line: number }>
  scrollToLine(customEvent.detail.line)
}

function checkScrollToLine() {
  // 从 URL query 参数中读取 line
  const urlParams = new URLSearchParams(window.location.search)
  const lineParam = urlParams.get('line')
  if (lineParam) {
    const lineNum = parseInt(lineParam)
    if (!isNaN(lineNum)) {
      setTimeout(() => {
        scrollToLine(lineNum)
      }, 300)
    }
  }
}

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

function highlightCode(code: string): string {
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
  return props.issues?.some(issue => issue.line === line) || false
}

function getIssuesForLine(line: number): Issue[] {
  return props.issues?.filter(issue => issue.line === line) || []
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

function handleKeyDown(event: KeyboardEvent) {
  if (!sources.value.length) return

  const currentLine = highlightedLine.value || sources.value[0]?.line || 1
  const currentIndex = sources.value.findIndex(s => s.line === currentLine)

  let newLine: number | null = null

  switch (event.key) {
    case 'ArrowDown':
    case 'j':
      event.preventDefault()
      if (currentIndex < sources.value.length - 1) {
        newLine = sources.value[currentIndex + 1].line
      }
      break
    case 'ArrowUp':
    case 'k':
      event.preventDefault()
      if (currentIndex > 0) {
        newLine = sources.value[currentIndex - 1].line
      }
      break
    case 'Home':
      event.preventDefault()
      newLine = sources.value[0]?.line || null
      break
    case 'End':
      event.preventDefault()
      newLine = sources.value[sources.value.length - 1]?.line || null
      break
    case 'PageDown':
      event.preventDefault()
      const pageDownIndex = Math.min(currentIndex + 20, sources.value.length - 1)
      newLine = sources.value[pageDownIndex]?.line || null
      break
    case 'PageUp':
      event.preventDefault()
      const pageUpIndex = Math.max(currentIndex - 20, 0)
      newLine = sources.value[pageUpIndex]?.line || null
      break
    case '/':
      // 搜索快捷键（由父组件处理）
      if (event.ctrlKey || event.metaKey) {
        event.preventDefault()
        // 可以触发搜索对话框
      }
      break
  }

  if (newLine !== null) {
    highlightedLine.value = newLine
    scrollToLine(newLine)
  }
}

function scrollToLine(line: number) {
  nextTick(() => {
    const lineElement = lineRefs.value[line]
    if (lineElement && sourceContentRef.value) {
      lineElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  })
}

onMounted(() => {
  // 监听滚动到指定行的事件
  window.addEventListener('scroll-to-line', handleScrollToLine)
  // 聚焦到容器以便接收键盘事件
  if (sourceContentRef.value) {
    sourceContentRef.value.focus()
  }
  // 检查是否有需要滚动到的行
  checkScrollToLine()
})

onUnmounted(() => {
  window.removeEventListener('scroll-to-line', handleScrollToLine)
})
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

.source-line.highlighted {
  background: #e6f7ff;
  border-left: 3px solid #409eff;
  padding-left: 9px;
}

.source-content:focus {
  outline: none;
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
