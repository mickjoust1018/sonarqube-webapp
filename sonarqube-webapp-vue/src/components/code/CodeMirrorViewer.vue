<template>
  <div class="codemirror-viewer" ref="editorContainerRef"></div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, nextTick, computed } from 'vue'
import {
  EditorView,
  lineNumbers,
  highlightSpecialChars,
  drawSelection,
  highlightActiveLine,
  keymap,
  gutter,
  GutterMarker,
  Decoration,
  hoverTooltip,
} from '@codemirror/view'
import { EditorState, Extension, Compartment, StateField, Range } from '@codemirror/state'
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands'
import { javascript } from '@codemirror/lang-javascript'
import { java } from '@codemirror/lang-java'
import { json } from '@codemirror/lang-json'
import { highlightSelectionMatches } from '@codemirror/search'
import { useI18n } from '@/composables/useI18n'
import type { Issue } from '@/libs/commons/types/issues'

const { t } = useI18n()

interface IssueMarker {
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
  code: string
  language?: string
  issues?: IssueMarker[]
  highlightedLine?: number | null
  readOnly?: boolean
}>()

const emit = defineEmits<{
  (e: 'issue-click', issue: IssueMarker): void
  (e: 'line-click', line: number): void
}>()

const editorContainerRef = ref<HTMLElement>()
let editorView: EditorView | null = null
const languageConf = new Compartment()
const readOnlyConf = new Compartment()
const issueConf = new Compartment()
const highlightConf = new Compartment()

// 根据文件扩展名或语言名称获取语言支持
function getLanguageExtension(language?: string): Extension {
  if (!language) return []

  const lang = language.toLowerCase()

  if (lang === 'javascript' || lang === 'js' || lang === 'jsx') {
    return javascript({ jsx: lang === 'jsx' })
  }

  if (lang === 'typescript' || lang === 'ts' || lang === 'tsx') {
    return javascript({ typescript: true, jsx: lang === 'tsx' })
  }

  if (lang === 'java') {
    return java()
  }

  if (lang === 'json') {
    return json()
  }

  // 默认使用 JavaScript
  return javascript()
}

// 问题标记图标类
class IssueMarker extends GutterMarker {
  constructor(
    public severity: string,
    public issueCount: number
  ) {
    super()
  }

  eq(other: IssueMarker) {
    return other.severity === this.severity && other.issueCount === this.issueCount
  }

  toDOM() {
    const marker = document.createElement('div')
    marker.className = `issue-marker issue-marker-${this.severity.toLowerCase()}`
    marker.innerHTML = this.getIcon()
    marker.title = `${this.issueCount} 个问题 (${this.severity})`
    return marker
  }

  getIcon(): string {
    const icons: Record<string, string> = {
      BLOCKER: '🔴',
      CRITICAL: '🟠',
      MAJOR: '🟡',
      MINOR: '🔵',
      INFO: '⚪',
    }
    return icons[this.severity] || '⚪'
  }
}

// 创建问题行类名和装饰扩展
function createIssueLineClassExtension(issues: IssueMarker[] = []): Extension {
  if (issues.length === 0) return []

  const issueLines = new Set(issues.map(i => i.line))
  const severityMap = new Map<number, string>()
  const issueMap = new Map<number, IssueMarker[]>()

  issues.forEach(issue => {
    severityMap.set(issue.line, issue.severity)
    if (!issueMap.has(issue.line)) {
      issueMap.set(issue.line, [])
    }
    issueMap.get(issue.line)!.push(issue)
  })

  // 创建行类名装饰
  const lineClassField = StateField.define<Set<number>>({
    create() {
      return issueLines
    },
    update(value, tr) {
      return value
    },
    provide: f =>
      EditorView.lineClass.from(f, (line, state) => {
        const lineNum = state.doc.lineAt(line.from).number
        if (value.has(lineNum)) {
          const severity = severityMap.get(lineNum) || 'INFO'
          if (severity === 'BLOCKER' || severity === 'CRITICAL') {
            return 'issue-line issue-critical'
          } else if (severity === 'MAJOR') {
            return 'issue-line issue-major'
          } else if (severity === 'MINOR') {
            return 'issue-line issue-minor'
          }
          return 'issue-line'
        }
        return ''
      }),
  })

  // 创建精确位置高亮装饰
  const decorationField = StateField.define({
    create(state) {
      const decorations: Range<Decoration>[] = []
      issues.forEach(issue => {
        if (issue.textRange && issue.line) {
          try {
            const line = state.doc.line(issue.textRange.startLine)
            if (line) {
              const from = line.from + (issue.textRange.startOffset || 0)
              const to = Math.min(line.from + (issue.textRange.endOffset || line.length), line.to)
              const severity = issue.severity || 'INFO'
              const className = `issue-range issue-range-${severity.toLowerCase()}`
              decorations.push(
                Decoration.mark({
                  class: className,
                  attributes: {
                    'data-issue-key': issue.key,
                    title: issue.message || `${severity} 问题`,
                  },
                }).range(from, to)
              )
            }
          } catch (error) {
            // 如果无法解析位置，忽略
          }
        }
      })
      return Decoration.set(decorations)
    },
    update(decorations, tr) {
      return decorations.map(tr.changes)
    },
    provide: f => EditorView.decorations.from(f),
  })

  return [lineClassField, decorationField]
}

// 创建行号标记扩展
function createIssueGutterExtension(issues: IssueMarker[] = []): Extension {
  if (issues.length === 0) return []

  const issueMap = new Map<number, IssueMarker[]>()
  issues.forEach(issue => {
    if (!issueMap.has(issue.line)) {
      issueMap.set(issue.line, [])
    }
    issueMap.get(issue.line)!.push(issue)
  })

  // 获取每行的最高严重性
  const getHighestSeverity = (lineIssues: IssueMarker[]): string => {
    const severityOrder = ['BLOCKER', 'CRITICAL', 'MAJOR', 'MINOR', 'INFO']
    return lineIssues.reduce((highest, issue) => {
      const currentIndex = severityOrder.indexOf(issue.severity)
      const highestIndex = severityOrder.indexOf(highest)
      return currentIndex < highestIndex ? issue.severity : highest
    }, 'INFO')
  }

  return gutter({
    class: 'cm-issue-gutter',
    renderEmptyElements: false,
    markers(view) {
      const markers: Range<GutterMarker>[] = []
      issueMap.forEach((lineIssues, lineNum) => {
        try {
          const line = view.state.doc.line(lineNum)
          const severity = getHighestSeverity(lineIssues)
          const marker = new IssueMarker(severity, lineIssues.length)
          markers.push(marker.range(line.from))
        } catch (error) {
          // 忽略无效行号
        }
      })
      return markers
    },
    initialSpacer() {
      return new IssueMarker('INFO', 0)
    },
  })
}

// 创建悬停提示扩展
function createIssueTooltipExtension(issues: IssueMarker[] = []): Extension {
  if (issues.length === 0) return []

  const issueMap = new Map<number, IssueMarker[]>()
  issues.forEach(issue => {
    if (!issueMap.has(issue.line)) {
      issueMap.set(issue.line, [])
    }
    issueMap.get(issue.line)!.push(issue)
  })

  return hoverTooltip(
    (view, pos) => {
      const line = view.state.doc.lineAt(pos)
      const lineIssues = issueMap.get(line.number)

      if (!lineIssues || lineIssues.length === 0) {
        return null
      }

      const tooltip = document.createElement('div')
      tooltip.className = 'issue-tooltip'

      lineIssues.forEach(issue => {
        const issueDiv = document.createElement('div')
        issueDiv.className = `issue-tooltip-item issue-tooltip-${issue.severity.toLowerCase()}`
        issueDiv.innerHTML = `
        <div class="issue-tooltip-header">
          <span class="issue-tooltip-severity">${issue.severity}</span>
          <span class="issue-tooltip-key">${issue.key}</span>
        </div>
        ${issue.message ? `<div class="issue-tooltip-message">${escapeHtml(issue.message)}</div>` : ''}
      `
        issueDiv.addEventListener('click', () => {
          emit('issue-click', issue)
        })
        tooltip.appendChild(issueDiv)
      })

      return {
        dom: tooltip,
        pos: line.from,
      }
    },
    {
      hoverTime: 300,
    }
  )
}

// HTML 转义函数
function escapeHtml(text: string): string {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

// 创建高亮行装饰
function createHighlightLineExtension(line: number | null): Extension {
  if (!line) return []

  const highlightField = StateField.define<number | null>({
    create() {
      return line
    },
    update(value, tr) {
      return value
    },
    provide: f =>
      EditorView.lineClass.from(f, (linePos, state) => {
        const lineNum = state.doc.lineAt(linePos.from).number
        if (value === lineNum) {
          return 'highlighted-line'
        }
        return ''
      }),
  })

  return highlightField
}

// 创建自定义主题
const customTheme = EditorView.theme({
  '&': {
    fontSize: '13px',
    fontFamily: "'Monaco', 'Menlo', 'Ubuntu Mono', monospace",
    height: '100%',
  },
  '.cm-content': {
    padding: '12px 0',
    minHeight: '100%',
  },
  '.cm-line': {
    padding: '2px 12px',
    lineHeight: '1.6',
  },
  '.cm-lineNumbers': {
    minWidth: '60px',
  },
  '.cm-lineNumbers .cm-gutterElement': {
    textAlign: 'right',
    color: '#999',
    paddingRight: '12px',
  },
  '.cm-line.issue-line': {
    backgroundColor: '#fff3cd',
    position: 'relative',
  },
  '.cm-line.issue-critical': {
    backgroundColor: '#fee',
  },
  '.cm-line.issue-major': {
    backgroundColor: '#fff3cd',
  },
  '.cm-line.issue-minor': {
    backgroundColor: '#e6f7ff',
  },
  '.cm-issue-gutter': {
    width: '24px',
    minWidth: '24px',
  },
  '.cm-issue-gutter .issue-marker': {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '20px',
    height: '20px',
    fontSize: '12px',
    cursor: 'pointer',
    borderRadius: '2px',
    transition: 'all 0.2s',
  },
  '.cm-issue-gutter .issue-marker:hover': {
    transform: 'scale(1.2)',
  },
  '.issue-range': {
    borderRadius: '2px',
    padding: '1px 2px',
  },
  '.issue-range-blocker, .issue-range-critical': {
    backgroundColor: 'rgba(255, 0, 0, 0.2)',
    borderBottom: '2px solid #f56c6c',
  },
  '.issue-range-major': {
    backgroundColor: 'rgba(255, 193, 7, 0.2)',
    borderBottom: '2px solid #ffc107',
  },
  '.issue-range-minor': {
    backgroundColor: 'rgba(64, 158, 255, 0.2)',
    borderBottom: '2px solid #409eff',
  },
  '.issue-range-info': {
    backgroundColor: 'rgba(144, 147, 153, 0.2)',
    borderBottom: '2px solid #909399',
  },
  '.cm-line.highlighted-line': {
    backgroundColor: '#e6f7ff',
    borderLeft: '3px solid #409eff',
    paddingLeft: '9px',
  },
  '.cm-scroller': {
    overflow: 'auto',
  },
  '.cm-gutters': {
    backgroundColor: '#fff',
    border: 'none',
  },
  '.cm-focused': {
    outline: 'none',
  },
})

// 初始化编辑器
function initEditor() {
  if (!editorContainerRef.value) return

  const language = props.language || detectLanguage(props.code)

  const extensions: Extension[] = [
    lineNumbers(),
    highlightSpecialChars(),
    history(),
    drawSelection(),
    highlightActiveLine(),
    highlightSelectionMatches(),
    EditorState.allowMultipleSelections.of(true),
    keymap.of([...defaultKeymap, ...historyKeymap]),
    customTheme,
    languageConf.of(getLanguageExtension(language)),
    readOnlyConf.of([
      EditorView.lineWrapping,
      EditorState.readOnly.of(props.readOnly !== false),
      EditorView.editable.of(props.readOnly === false),
    ]),
  ]

  // 添加问题高亮
  if (props.issues && props.issues.length > 0) {
    const issueExtensions: Extension[] = []
    const lineClassExt = createIssueLineClassExtension(props.issues)
    if (Array.isArray(lineClassExt)) {
      issueExtensions.push(...lineClassExt)
    } else if (lineClassExt) {
      issueExtensions.push(lineClassExt)
    }
    const gutterExt = createIssueGutterExtension(props.issues)
    if (gutterExt) {
      if (Array.isArray(gutterExt)) {
        issueExtensions.push(...gutterExt)
      } else {
        issueExtensions.push(gutterExt)
      }
    }
    const tooltipExt = createIssueTooltipExtension(props.issues)
    if (tooltipExt) {
      if (Array.isArray(tooltipExt)) {
        issueExtensions.push(...tooltipExt)
      } else {
        issueExtensions.push(tooltipExt)
      }
    }
    extensions.push(issueConf.of(issueExtensions))
  } else {
    extensions.push(issueConf.of([]))
  }

  // 添加高亮行
  if (props.highlightedLine) {
    const highlightExt = createHighlightLineExtension(props.highlightedLine)
    if (Array.isArray(highlightExt)) {
      extensions.push(highlightConf.of(highlightExt))
    } else if (highlightExt) {
      extensions.push(highlightConf.of([highlightExt]))
    } else {
      extensions.push(highlightConf.of([]))
    }
  } else {
    extensions.push(highlightConf.of([]))
  }

  // 添加点击事件
  extensions.push(
    EditorView.domEventHandlers({
      click: (event, view) => {
        const pos = view.posAtCoords({ x: event.clientX, y: event.clientY })
        if (pos) {
          try {
            const line = view.state.doc.lineAt(pos)
            emit('line-click', line.number)

            // 检查是否有问题
            if (props.issues) {
              const issue = props.issues.find(i => i.line === line.number)
              if (issue) {
                emit('issue-click', issue)
              }
            }
          } catch (error) {
            // 忽略错误
          }
        }
      },
    })
  )

  const state = EditorState.create({
    doc: props.code || '',
    extensions,
  })

  editorView = new EditorView({
    state,
    parent: editorContainerRef.value,
  })
}

// 更新编辑器内容
function updateEditor() {
  if (!editorView) return

  const language = props.language || detectLanguage(props.code)

  // 更新语言
  editorView.dispatch({
    effects: languageConf.reconfigure(getLanguageExtension(language)),
  })

  // 更新只读状态
  editorView.dispatch({
    effects: readOnlyConf.reconfigure([
      EditorView.lineWrapping,
      EditorState.readOnly.of(props.readOnly !== false),
      EditorView.editable.of(props.readOnly === false),
    ]),
  })

  // 更新内容
  if (editorView.state.doc.toString() !== props.code) {
    editorView.dispatch({
      changes: {
        from: 0,
        to: editorView.state.doc.length,
        insert: props.code || '',
      },
    })
  }

  // 更新问题高亮扩展
  if (props.issues && props.issues.length > 0) {
    const issueExtensions: Extension[] = []
    const lineClassExt = createIssueLineClassExtension(props.issues)
    if (Array.isArray(lineClassExt)) {
      issueExtensions.push(...lineClassExt)
    } else if (lineClassExt) {
      issueExtensions.push(lineClassExt)
    }
    const gutterExt = createIssueGutterExtension(props.issues)
    if (gutterExt) {
      if (Array.isArray(gutterExt)) {
        issueExtensions.push(...gutterExt)
      } else {
        issueExtensions.push(gutterExt)
      }
    }
    const tooltipExt = createIssueTooltipExtension(props.issues)
    if (tooltipExt) {
      if (Array.isArray(tooltipExt)) {
        issueExtensions.push(...tooltipExt)
      } else {
        issueExtensions.push(tooltipExt)
      }
    }
    editorView.dispatch({
      effects: issueConf.reconfigure(issueExtensions),
    })
  } else {
    editorView.dispatch({
      effects: issueConf.reconfigure([]),
    })
  }

  // 更新高亮行扩展
  if (props.highlightedLine) {
    const highlightExt = createHighlightLineExtension(props.highlightedLine)
    if (Array.isArray(highlightExt)) {
      editorView.dispatch({
        effects: highlightConf.reconfigure(highlightExt),
      })
    } else if (highlightExt) {
      editorView.dispatch({
        effects: highlightConf.reconfigure([highlightExt]),
      })
    } else {
      editorView.dispatch({
        effects: highlightConf.reconfigure([]),
      })
    }
  } else {
    editorView.dispatch({
      effects: highlightConf.reconfigure([]),
    })
  }
}

// 检测代码语言
function detectLanguage(code: string): string {
  // 简单的语言检测逻辑
  if (code.includes('package ') && code.includes('public class')) {
    return 'java'
  }
  if (code.includes('export ') || code.includes('import ')) {
    if (code.includes('interface ') || code.includes('type ')) {
      return 'typescript'
    }
    return 'javascript'
  }
  if (code.trim().startsWith('{') || code.trim().startsWith('[')) {
    try {
      JSON.parse(code)
      return 'json'
    } catch {
      // 不是有效的 JSON
    }
  }
  return 'javascript'
}

// 滚动到指定行
function scrollToLine(line: number) {
  if (!editorView) return

  nextTick(() => {
    try {
      const linePos = editorView.state.doc.line(line)
      const pos = linePos.from
      editorView.dispatch({
        effects: EditorView.scrollIntoView(pos, {
          y: 'center',
        }),
      })
    } catch (error) {
      console.error('Failed to scroll to line:', error)
    }
  })
}

watch(
  () => props.code,
  () => {
    if (editorView) {
      updateEditor()
    }
  }
)

watch(
  () => props.issues,
  () => {
    if (editorView) {
      updateEditor()
    }
  },
  { deep: true }
)

watch(
  () => props.highlightedLine,
  newLine => {
    if (newLine && editorView) {
      scrollToLine(newLine)
      updateEditor()
    }
  }
)

watch(
  () => props.language,
  () => {
    if (editorView) {
      updateEditor()
    }
  }
)

onMounted(() => {
  nextTick(() => {
    initEditor()

    // 监听滚动到指定行的事件
    const handleScrollToLine = (event: Event) => {
      const customEvent = event as CustomEvent<{ line: number }>
      scrollToLine(customEvent.detail.line)
    }

    window.addEventListener('scroll-to-line', handleScrollToLine)

    // 检查 URL 中的 line 参数
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
  })
})

onUnmounted(() => {
  if (editorView) {
    editorView.destroy()
    editorView = null
  }
})
</script>

<style scoped>
.codemirror-viewer {
  flex: 1;
  height: 100%;
  overflow: hidden;
  background: #fff;
}

:deep(.cm-editor) {
  height: 100%;
}

:deep(.cm-scroller) {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

:deep(.cm-line.issue-line) {
  position: relative;
}

:deep(.cm-line.issue-line::after) {
  content: '';
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background-color: #f56c6c;
}

:deep(.issue-tooltip) {
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  padding: 8px;
  max-width: 400px;
  z-index: 1000;
}

:deep(.issue-tooltip-item) {
  padding: 8px;
  border-radius: 4px;
  margin-bottom: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

:deep(.issue-tooltip-item:hover) {
  background-color: #f5f7fa;
}

:deep(.issue-tooltip-item:last-child) {
  margin-bottom: 0;
}

:deep(.issue-tooltip-header) {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

:deep(.issue-tooltip-severity) {
  font-weight: 600;
  font-size: 12px;
}

:deep(.issue-tooltip-key) {
  font-size: 11px;
  color: #909399;
  font-family: monospace;
}

:deep(.issue-tooltip-message) {
  font-size: 12px;
  color: #606266;
  line-height: 1.5;
}

:deep(.issue-tooltip-blocker .issue-tooltip-severity),
:deep(.issue-tooltip-critical .issue-tooltip-severity) {
  color: #f56c6c;
}

:deep(.issue-tooltip-major .issue-tooltip-severity) {
  color: #e6a23c;
}

:deep(.issue-tooltip-minor .issue-tooltip-severity) {
  color: #409eff;
}

:deep(.issue-tooltip-info .issue-tooltip-severity) {
  color: #909399;
}
</style>
