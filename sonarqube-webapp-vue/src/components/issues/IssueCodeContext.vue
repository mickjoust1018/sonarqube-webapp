<template>
  <div class="issue-code-context">
    <el-card shadow="never" v-if="issue">
      <template #header>
        <div class="context-header">
          <h3>代码上下文</h3>
          <el-button link type="primary" size="small" @click="navigateToCode">
            在代码查看器中打开
          </el-button>
        </div>
      </template>
      <div v-if="loading" class="loading-state">
        <el-skeleton :rows="10" animated />
      </div>
      <div v-else-if="codeContext" class="code-context-content">
        <div class="file-info">
          <el-icon><Document /></el-icon>
          <span class="file-path">{{ getFileName(issue.component) }}</span>
          <el-tag size="small" type="info">行 {{ issue.line }}</el-tag>
        </div>
        <div class="code-block" v-html="highlightedCode"></div>
      </div>
      <div v-else class="empty-state">
        <el-empty description="无法加载代码上下文" />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Document } from '@element-plus/icons-vue'
import { getJSON } from '@/libs/shared/utils/request'
import type { Issue } from '@/libs/commons/types/issues'
import hljs from 'highlight.js/lib/core'
import javascript from 'highlight.js/lib/languages/javascript'
import java from 'highlight.js/lib/languages/java'
import 'highlight.js/styles/default.css'

// 注册语言
hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('java', java)

interface Props {
  issue: Issue | null
}

const props = defineProps<Props>()
const router = useRouter()

const loading = ref(false)
const codeContext = ref<{ sources: Array<{ line: number; code: string }> } | null>(null)

const highlightedCode = computed(() => {
  if (!codeContext.value || !props.issue) return ''

  const contextLines = codeContext.value.sources
  const issueLine = props.issue.line || 0

  // 高亮问题所在行
  return contextLines
    .map(source => {
      const lineNum = source.line
      const isIssueLine = lineNum === issueLine
      const lineClass = isIssueLine ? 'issue-line' : ''
      const lineMarker = isIssueLine ? '👉' : '  '

      // 简单的代码高亮（可以根据文件扩展名使用 hljs）
      let highlighted = source.code
      try {
        // 根据文件扩展名选择语言
        if (!props.issue) return ''
        const ext = getFileExtension(props.issue.component)
        const lang =
          ext === 'java' ? 'java' : ext === 'js' || ext === 'ts' ? 'javascript' : undefined
        if (lang) {
          highlighted = hljs.highlight(source.code, { language: lang }).value
        } else {
          highlighted = hljs.highlightAuto(source.code).value
        }
      } catch {
        highlighted = source.code
      }

      return `<div class="code-line ${lineClass}" data-line="${lineNum}">
        <span class="line-number">${lineNum.toString().padStart(4, ' ')}</span>
        <span class="line-marker">${lineMarker}</span>
        <span class="line-code">${highlighted}</span>
      </div>`.replace(/\n/g, '<br>')
    })
    .join('\n')
})

function getFileName(component: string): string {
  const parts = component.split(':')
  return parts[parts.length - 1] || component
}

function getFileExtension(component: string): string {
  const fileName = getFileName(component)
  const parts = fileName.split('.')
  return parts.length > 1 ? parts[parts.length - 1] : ''
}

async function loadCodeContext() {
  if (!props.issue || !props.issue.component || !props.issue.line) {
    codeContext.value = null
    return
  }

  loading.value = true
  try {
    // 加载问题所在行前后各 5 行的代码上下文
    const from = Math.max(1, (props.issue.line || 1) - 5)
    const to = (props.issue.line || 1) + 5

    const data = await getJSON<{ sources: Array<{ line: number; code: string }> }>(
      '/api/sources/lines',
      {
        key: props.issue.component,
        from,
        to,
      }
    )

    codeContext.value = data
  } catch (error) {
    console.error('Failed to load code context:', error)
    codeContext.value = null
  } finally {
    loading.value = false
  }
}

function navigateToCode() {
  if (!props.issue) return

  const parts = props.issue.component.split(':')
  const projectKey = parts[0]
  const filePath = props.issue.component.replace(`${projectKey}:`, '')

  router.push({
    path: `/project/${projectKey}/code`,
    query: {
      file: filePath,
      line: props.issue.line?.toString() || '1',
    },
  })
}

watch(
  () => props.issue,
  () => {
    loadCodeContext()
  },
  { immediate: true }
)

onMounted(() => {
  loadCodeContext()
})
</script>

<style scoped>
.issue-code-context {
  padding: 10px 0;
}

.context-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.context-header h3 {
  margin: 0;
  font-size: 16px;
}

.loading-state {
  padding: 20px;
}

.code-context-content {
  padding: 10px 0;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 15px;
  padding: 10px;
  background: #f5f7fa;
  border-radius: 4px;
}

.file-path {
  font-family: monospace;
  font-size: 13px;
  color: #606266;
  flex: 1;
}

.code-block {
  background: #f8f9fa;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  overflow-x: auto;
  max-height: 400px;
  overflow-y: auto;
}

.code-block {
  padding: 10px;
  font-family: 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.6;
}

.code-block :deep(.code-line) {
  display: flex;
  padding: 2px 0;
  white-space: pre;
}

.code-block :deep(.issue-line) {
  background: #fff3cd;
  border-left: 3px solid #ffc107;
  padding-left: 5px;
}

.code-block :deep(.line-number) {
  color: #909399;
  margin-right: 10px;
  user-select: none;
  min-width: 50px;
  text-align: right;
}

.code-block :deep(.line-marker) {
  margin-right: 8px;
  color: #ffc107;
  font-weight: bold;
}

.code-block :deep(.line-code) {
  flex: 1;
}

.empty-state {
  padding: 40px 0;
  text-align: center;
}
</style>
