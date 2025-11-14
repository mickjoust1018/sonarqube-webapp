<template>
  <div class="file-tree">
    <div class="file-tree-title">目录</div>
    <div class="file-tree-header">
      <el-input
        v-model="searchText"
        :placeholder="t('codeViewer.searchFiles')"
        size="small"
        clearable
        prefix-icon="Search"
      />
    </div>
    <div class="file-tree-content">
      <el-tree
        ref="treeRef"
        :data="treeData"
        :props="treeProps"
        :filter-node-method="filterNode"
        :expand-on-click-node="false"
        node-key="key"
        :default-expanded-keys="defaultExpandedKeys"
        highlight-current
        @node-click="handleNodeClick"
        @current-change="handleCurrentChange"
      >
        <template #default="{ node, data }">
          <span class="tree-node">
            <el-icon v-if="data.qualifier === 'DIR'" class="node-icon">
              <Folder />
            </el-icon>
            <el-icon v-else class="node-icon">
              <Document />
            </el-icon>
            <span class="node-label" :title="data.path">{{ node.label }}</span>
            <span v-if="getDisplayCount(data)" class="node-count">
              ({{ getDisplayCount(data) }})
            </span>
          </span>
        </template>
      </el-tree>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { Folder, Document } from '@element-plus/icons-vue'
import { useI18n } from '@/composables/useI18n'
import type { ComponentMeasure } from '@/libs/commons/api/components'

const { t } = useI18n()

interface TreeNode {
  key: string
  label: string
  qualifier: string
  path?: string
  measures?: Array<{ metric: string; value: string }>
  children?: TreeNode[]
}

const props = defineProps<{
  components: ComponentMeasure[]
  baseComponent: ComponentMeasure
}>()

const emit = defineEmits<{
  (e: 'select', component: ComponentMeasure): void
}>()

const treeRef = ref()
const searchText = ref('')
const selectedKey = ref<string>('')

const treeProps = {
  children: 'children',
  label: 'label',
}

// 默认展开前两级目录
const defaultExpandedKeys = computed(() => {
  const keys: string[] = []
  const traverse = (nodes: TreeNode[], level: number = 0) => {
    if (level >= 2) return
    nodes.forEach(node => {
      if (node.qualifier === 'DIR') {
        keys.push(node.key)
        if (node.children && level < 1) {
          traverse(node.children, level + 1)
        }
      }
    })
  }
  if (treeData.value && treeData.value.length > 0) {
    traverse(treeData.value)
  }
  return keys
})

const treeData = computed(() => {
  const buildTree = (components: ComponentMeasure[]): TreeNode[] => {
    const map = new Map<string, TreeNode>()
    const roots: TreeNode[] = []

    // 创建所有节点
    components.forEach(comp => {
      const node: TreeNode = {
        key: comp.key,
        label: comp.name,
        qualifier: comp.qualifier,
        path: comp.path,
        measures: comp.measures,
        children: [],
      }
      map.set(comp.key, node)
    })

    // 构建树结构
    components.forEach(comp => {
      const node = map.get(comp.key)!
      // 从 key 中提取父级 key
      // key 格式: "project-key:path/to/file"
      // 需要找到直接父级，例如 "project-key:path/to/file" 的父级是 "project-key:path/to"
      const keyParts = comp.key.split(':')
      if (keyParts.length < 2) {
        // 根节点
        roots.push(node)
        return
      }

      const pathParts = keyParts[1].split('/')
      if (pathParts.length === 1) {
        // 第一级子节点，父级是项目根节点
        roots.push(node)
        return
      }

      // 构建父级 key
      const parentPath = pathParts.slice(0, -1).join('/')
      const parentKey = `${keyParts[0]}:${parentPath}`

      if (map.has(parentKey)) {
        const parent = map.get(parentKey)!
        if (!parent.children) {
          parent.children = []
        }
        parent.children.push(node)
      } else {
        // 如果找不到父级，作为根节点
        roots.push(node)
      }
    })

    // 对每个节点的子节点进行排序（目录在前，文件在后，然后按名称排序）
    const sortChildren = (nodes: TreeNode[]) => {
      nodes.forEach(node => {
        if (node.children && node.children.length > 0) {
          node.children.sort((a, b) => {
            // 目录在前
            if (a.qualifier === 'DIR' && b.qualifier !== 'DIR') return -1
            if (a.qualifier !== 'DIR' && b.qualifier === 'DIR') return 1
            // 同类型按名称排序
            return a.label.localeCompare(b.label)
          })
          sortChildren(node.children)
        }
      })
    }

    sortChildren(roots)

    return roots
  }

  const result = buildTree(props.components)
  // 调试：输出树结构
  if (import.meta.env.DEV && result.length > 0) {
    console.log('FileTree data:', result)
  }
  return result
})

function filterNode(value: string, data: TreeNode) {
  if (!value) return true
  return data.label.toLowerCase().includes(value.toLowerCase())
}

watch(searchText, val => {
  treeRef.value?.filter(val)
})

function handleNodeClick(data: TreeNode) {
  if (data.qualifier === 'FIL') {
    // 使用 setCurrentKey 方法设置当前选中节点
    treeRef.value?.setCurrentKey(data.key)
    selectedKey.value = data.key
    const component = props.components.find(c => c.key === data.key)
    if (component) {
      emit('select', component)
    }
  }
}

function handleCurrentChange(data: TreeNode | null) {
  if (data) {
    selectedKey.value = data.key
  }
}

// 获取显示的计数（优先显示文件数，其次显示代码行数）
function getDisplayCount(data: TreeNode): string | null {
  if (!data.measures || data.measures.length === 0) {
    return null
  }

  // 优先显示文件数
  const filesMeasure = data.measures.find(m => m.metric === 'files')
  if (filesMeasure) {
    return filesMeasure.value
  }

  // 其次显示代码行数
  const nclocMeasure = data.measures.find(m => m.metric === 'ncloc')
  if (nclocMeasure) {
    return nclocMeasure.value
  }

  // 如果有其他度量值，显示第一个
  if (data.measures.length > 0) {
    return data.measures[0].value
  }

  return null
}
</script>

<style scoped>
.file-tree {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.file-tree-title {
  padding: 16px;
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  border-bottom: 1px solid #ebeef5;
  background: #fafafa;
}

.file-tree-header {
  padding: 12px 16px;
  border-bottom: 1px solid #ebeef5;
  background: #fff;
}

.file-tree-content {
  flex: 1;
  overflow: auto;
  padding: 8px 0;
}

.tree-node {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
  font-size: 14px;
}

.node-icon {
  flex-shrink: 0;
  color: #606266;
  font-size: 16px;
}

.node-label {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #303133;
}

.node-count {
  flex-shrink: 0;
  color: #909399;
  font-size: 13px;
  margin-left: 4px;
}

:deep(.el-tree) {
  background: transparent;
}

:deep(.el-tree-node) {
  margin-bottom: 2px;
}

:deep(.el-tree-node__content) {
  height: 32px;
  padding: 0 12px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

:deep(.el-tree-node__content:hover) {
  background-color: #f5f7fa;
}

:deep(.el-tree-node.is-current > .el-tree-node__content) {
  background-color: #e6f7ff !important;
}

:deep(.el-tree-node.is-current > .el-tree-node__content .node-label) {
  color: #1890ff;
  font-weight: 500;
}

:deep(.el-tree-node.is-current > .el-tree-node__content .node-icon) {
  color: #1890ff;
}

:deep(.el-tree-node.is-current > .el-tree-node__content .node-count) {
  color: #1890ff;
}

:deep(.el-tree-node__expand-icon) {
  color: #909399;
  font-size: 12px;
}

:deep(.el-tree-node__expand-icon.is-leaf) {
  color: transparent;
  cursor: default;
}

:deep(.el-tree-node__expand-icon.expanded) {
  color: #606266;
}

:deep(.el-input__wrapper) {
  border-radius: 4px;
}
</style>
