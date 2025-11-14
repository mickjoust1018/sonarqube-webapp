<template>
  <div class="source-viewer">
    <div v-if="loading" class="loading">
      <el-icon class="is-loading"><Loading /></el-icon>
      <span>{{ t('codeViewer.loading') }}</span>
    </div>
    <div v-else-if="sources.length === 0" class="empty">
      <el-empty :description="t('codeViewer.noCode')" />
    </div>
    <CodeMirrorViewer
      v-else
      :code="codeText"
      :language="detectedLanguage"
      :issues="formattedIssues"
      :highlighted-line="highlightedLine"
      :read-only="true"
      @issue-click="handleIssueClick"
      @line-click="handleLineClick"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, nextTick, computed } from 'vue'
import { Loading } from '@element-plus/icons-vue'
import { useI18n } from '@/composables/useI18n'
import { getSources, type SourceLine } from '@/libs/commons/api/components'
import CodeMirrorViewer from './CodeMirrorViewer.vue'

const { t } = useI18n()

interface Issue {
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
const highlightedLine = ref<number | null>(null)

// 将源代码数组转换为文本
const codeText = computed(() => {
  if (sources.value.length === 0) return ''
  return sources.value.map(s => s.code || '').join('\n')
})

// 格式化问题数据以适配 CodeMirrorViewer
const formattedIssues = computed(() => {
  if (!props.issues || props.issues.length === 0) return []

  return props.issues.map(issue => ({
    line: issue.line,
    key: issue.key,
    severity: issue.severity,
    message: issue.message,
    textRange: issue.textRange,
  }))
})

// 检测语言
const detectedLanguage = computed(() => {
  if (!props.componentKey) return undefined
  const parts = props.componentKey.split(':')
  const fileName = parts[parts.length - 1] || ''
  const ext = fileName.split('.').pop()?.toLowerCase() || ''

  const langMap: Record<string, string> = {
    js: 'javascript',
    jsx: 'javascript',
    ts: 'typescript',
    tsx: 'typescript',
    vue: 'javascript',
    java: 'java',
    json: 'json',
  }

  return langMap[ext] || 'javascript'
})

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
    // 检查是否有需要滚动到的行
    checkScrollToLine()
  })
})

function checkScrollToLine() {
  // 从 URL query 参数中读取 line
  const urlParams = new URLSearchParams(window.location.search)
  const lineParam = urlParams.get('line')
  if (lineParam) {
    const lineNum = parseInt(lineParam)
    if (!isNaN(lineNum)) {
      setTimeout(() => {
        highlightedLine.value = lineNum
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

function handleIssueClick(issue: Issue) {
  emit('issue-click', issue)
}

function handleLineClick(line: number) {
  highlightedLine.value = line
}

onMounted(() => {
  // 检查是否有需要滚动到的行
  checkScrollToLine()
})
</script>

<style scoped>
.source-viewer {
  flex: 1;
  overflow: hidden;
  background: #fff;
  display: flex;
  flex-direction: column;
}

.loading,
.empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  gap: 8px;
}
</style>
