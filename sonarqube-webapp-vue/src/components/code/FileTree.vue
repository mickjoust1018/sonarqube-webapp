<template>
  <div class="file-tree">
    <div class="file-tree-header">
      <el-input
        v-model="searchText"
        :placeholder="t('codeViewer.searchFiles')"
        size="small"
        clearable
        prefix-icon="Search"
      />
    </div>
    <el-tree
      ref="treeRef"
      :data="treeData"
      :props="treeProps"
      :filter-node-method="filterNode"
      :expand-on-click-node="false"
      node-key="key"
      default-expand-all
      @node-click="handleNodeClick"
    >
      <template #default="{ node, data }">
        <span class="tree-node">
          <el-icon v-if="data.qualifier === 'DIR'">
            <Folder />
          </el-icon>
          <el-icon v-else>
            <Document />
          </el-icon>
          <span class="node-label">{{ node.label }}</span>
          <span v-if="data.measures && data.measures.length > 0" class="node-measures">
            <el-tag v-for="measure in data.measures" :key="measure.metric" size="small" type="info">
              {{ formatMeasure(measure) }}
            </el-tag>
          </span>
        </span>
      </template>
    </el-tree>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { Folder, Document, Search } from '@element-plus/icons-vue'
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

const treeProps = {
  children: 'children',
  label: 'label',
}

const treeData = computed(() => {
  const buildTree = (components: ComponentMeasure[]): TreeNode[] => {
    const map = new Map<string, TreeNode>()
    const roots: TreeNode[] = []

    // 创建所有节点
    components.forEach((comp) => {
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
    components.forEach((comp) => {
      const node = map.get(comp.key)!
      const parentKey = comp.key.split(':').slice(0, -1).join(':')

      if (parentKey && map.has(parentKey)) {
        const parent = map.get(parentKey)!
        if (!parent.children) {
          parent.children = []
        }
        parent.children.push(node)
      } else {
        roots.push(node)
      }
    })

    return roots
  }

  return buildTree(props.components)
})

function filterNode(value: string, data: TreeNode) {
  if (!value) return true
  return data.label.toLowerCase().includes(value.toLowerCase())
}

watch(searchText, (val) => {
  treeRef.value?.filter(val)
})

function handleNodeClick(data: TreeNode) {
  if (data.qualifier === 'FIL') {
    const component = props.components.find((c) => c.key === data.key)
    if (component) {
      emit('select', component)
    }
  }
}

function formatMeasure(measure: { metric: string; value: string }): string {
  const metricMap: Record<string, string> = {
    coverage: '覆盖率',
    ncloc: '代码行',
    complexity: '复杂度',
  }
  const metricName = metricMap[measure.metric] || measure.metric
  return `${metricName}: ${measure.value}`
}
</script>

<style scoped>
.file-tree {
  height: 100%;
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--el-border-color);
}

.file-tree-header {
  padding: 12px;
  border-bottom: 1px solid var(--el-border-color);
}

.tree-node {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.node-label {
  flex: 1;
}

.node-measures {
  display: flex;
  gap: 4px;
}

:deep(.el-tree-node__content) {
  height: 32px;
}
</style>
