<template>
  <div class="issue-flow-viewer">
    <div v-if="flows.length === 0" class="empty-state">
      <el-empty description="此问题没有数据流信息" />
    </div>
    <div v-else>
      <div v-for="(flow, flowIndex) in flows" :key="flowIndex" class="flow-item">
        <el-card shadow="hover">
          <template #header>
            <div class="flow-header">
              <span>数据流 {{ flowIndex + 1 }}</span>
              <el-tag size="small" type="info">{{ flow.locations?.length || 0 }} 个位置</el-tag>
            </div>
          </template>
          <div v-if="flow.locations && flow.locations.length > 0" class="flow-locations">
            <el-timeline>
              <el-timeline-item
                v-for="(location, locIndex) in flow.locations"
                :key="locIndex"
                :timestamp="formatLocation(location)"
                placement="top"
                :icon="
                  locIndex === 0
                    ? 'Location'
                    : locIndex === flow.locations.length - 1
                      ? 'Flag'
                      : 'Circle'
                "
              >
                <el-card class="location-card" shadow="hover">
                  <div class="location-content">
                    <div class="location-file">
                      <el-icon><Document /></el-icon>
                      <span class="file-path">{{ getFileName(location.component) }}</span>
                    </div>
                    <div class="location-range">
                      <el-tag size="small" type="info">
                        行 {{ location.textRange.startLine }}
                        <span v-if="location.textRange.endLine !== location.textRange.startLine">
                          - {{ location.textRange.endLine }}
                        </span>
                      </el-tag>
                    </div>
                    <el-button link type="primary" size="small" @click="navigateToCode(location)">
                      查看代码
                    </el-button>
                  </div>
                </el-card>
              </el-timeline-item>
            </el-timeline>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Document, Location } from '@element-plus/icons-vue'

interface Location {
  component: string
  textRange: {
    startLine: number
    endLine: number
    startOffset?: number
    endOffset?: number
  }
}

interface Flow {
  locations?: Location[]
}

interface Props {
  flows: Flow[]
  issueKey?: string
}

defineProps<Props>()
const router = useRouter()

function formatLocation(location: Location): string {
  const fileName = getFileName(location.component)
  return `${fileName}:${location.textRange.startLine}`
}

function getFileName(component: string): string {
  const parts = component.split(':')
  return parts[parts.length - 1] || component
}

function navigateToCode(location: Location) {
  // 提取项目 key
  const parts = location.component.split(':')
  const projectKey = parts[0]
  const filePath = location.component.replace(`${projectKey}:`, '')

  router.push({
    path: `/project/${projectKey}/code`,
    query: {
      file: filePath,
      line: location.textRange.startLine.toString(),
    },
  })
}
</script>

<style scoped>
.issue-flow-viewer {
  padding: 10px 0;
}

.empty-state {
  padding: 40px 0;
  text-align: center;
}

.flow-item {
  margin-bottom: 20px;
}

.flow-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.flow-locations {
  padding: 10px 0;
}

.location-card {
  margin-bottom: 10px;
}

.location-content {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.location-file {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 200px;
}

.file-path {
  font-family: monospace;
  font-size: 13px;
  color: #606266;
}

.location-range {
  margin-left: auto;
}
</style>
