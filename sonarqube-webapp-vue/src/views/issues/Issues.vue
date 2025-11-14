<template>
  <div class="issues">
    <div class="page-header">
      <div class="header">
        <h2>{{ (route.params.id || route.params.projectKey) ? `项目问题 - ${route.params.id || route.params.projectKey}` : '问题' }}</h2>
        <el-button
          type="primary"
          @click="showBulkChange = true"
          :disabled="checkedIssues.length === 0"
        >
          批量操作 ({{ checkedIssues.length }})
        </el-button>
      </div>
    </div>
    <div class="page-content">
      <div class="filters">
        <el-form :inline="true" :model="filters">
          <el-form-item label="严重程度">
            <el-select
              v-model="filters.severities"
              placeholder="请选择"
              clearable
              multiple
              style="width: 200px"
            >
              <el-option label="阻断" value="BLOCKER" />
              <el-option label="严重" value="CRITICAL" />
              <el-option label="主要" value="MAJOR" />
              <el-option label="次要" value="MINOR" />
              <el-option label="提示" value="INFO" />
            </el-select>
          </el-form-item>
          <el-form-item label="状态">
            <el-select
              v-model="filters.statuses"
              placeholder="请选择"
              clearable
              multiple
              style="width: 200px"
            >
              <el-option label="打开" value="OPEN" />
              <el-option label="已确认" value="CONFIRMED" />
              <el-option label="已解决" value="FIXED" />
              <el-option label="已接受" value="ACCEPTED" />
              <el-option label="误报" value="FALSE_POSITIVE" />
            </el-select>
          </el-form-item>
          <el-form-item label="类型">
            <el-select
              v-model="filters.types"
              placeholder="请选择"
              clearable
              multiple
              style="width: 200px"
            >
              <el-option label="代码异味" value="CODE_SMELL" />
              <el-option label="漏洞" value="VULNERABILITY" />
              <el-option label="Bug" value="BUG" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="search">搜索</el-button>
            <el-button @click="reset">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
      <el-table
        :data="issues"
        v-loading="loading"
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="key" label="Key" width="200" />
        <el-table-column prop="message" label="消息" min-width="300" />
        <el-table-column prop="severity" label="严重程度" width="120">
          <template #default="{ row }">
            <el-tag :type="getSeverityType(row.severity)">{{ row.severity }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="类型" width="120" />
        <el-table-column prop="component" label="组件" />
        <el-table-column prop="line" label="行号" width="80" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="viewIssue(row)">查看</el-button>
            <el-button link type="primary" @click="assignIssue(row)">分配</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        v-model:current-page="pagination.pageIndex"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        :page-sizes="[20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
      />
    </div>

    <!-- 批量操作对话框 -->
    <el-dialog v-model="showBulkChange" title="批量操作" width="500px">
      <el-form :model="bulkChangeForm" label-width="100px">
        <el-form-item label="操作">
          <el-select v-model="bulkChangeForm.action" placeholder="请选择操作">
            <el-option label="更改状态" value="do_transition" />
            <el-option label="更改严重程度" value="set_severity" />
            <el-option label="更改类型" value="set_type" />
            <el-option label="分配" value="assign" />
            <el-option label="添加标签" value="add_tags" />
            <el-option label="移除标签" value="remove_tags" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="bulkChangeForm.action === 'do_transition'" label="状态">
          <el-select v-model="bulkChangeForm.transition" placeholder="请选择状态">
            <el-option label="确认" value="confirm" />
            <el-option label="解决" value="resolve" />
            <el-option label="误报" value="falsepositive" />
            <el-option label="接受" value="accept" />
            <el-option label="重新打开" value="reopen" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="bulkChangeForm.action === 'set_severity'" label="严重程度">
          <el-select v-model="bulkChangeForm.severity" placeholder="请选择严重程度">
            <el-option label="阻断" value="BLOCKER" />
            <el-option label="严重" value="CRITICAL" />
            <el-option label="主要" value="MAJOR" />
            <el-option label="次要" value="MINOR" />
            <el-option label="提示" value="INFO" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="bulkChangeForm.action === 'set_type'" label="类型">
          <el-select v-model="bulkChangeForm.type" placeholder="请选择类型">
            <el-option label="代码异味" value="CODE_SMELL" />
            <el-option label="漏洞" value="VULNERABILITY" />
            <el-option label="Bug" value="BUG" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="bulkChangeForm.action === 'assign'" label="分配给">
          <el-input v-model="bulkChangeForm.assignee" placeholder="用户名" />
        </el-form-item>
        <el-form-item
          v-if="bulkChangeForm.action === 'add_tags' || bulkChangeForm.action === 'remove_tags'"
          label="标签"
        >
          <el-input v-model="bulkChangeForm.tags" placeholder="多个标签用逗号分隔" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showBulkChange = false">取消</el-button>
        <el-button type="primary" @click="handleBulkChange" :loading="bulkChanging">确定</el-button>
      </template>
    </el-dialog>

    <!-- 问题详情侧边栏 -->
    <IssueDetailsSidebar
      v-model="showIssueDetails"
      :issue="selectedIssue"
      @issue-updated="handleIssueUpdated"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { searchIssues, bulkChange } from '@/libs/commons/api/issues'
import type { Issue } from '@/libs/commons/types/issues'
import IssueDetailsSidebar from '@/components/issues/IssueDetailsSidebar.vue'

const route = useRoute()

const issues = ref<Issue[]>([])
const loading = ref(false)
const checkedIssues = ref<Issue[]>([])
const showBulkChange = ref(false)
const bulkChanging = ref(false)

const pagination = ref({
  pageIndex: 1,
  pageSize: 20,
  total: 0,
})

const filters = reactive({
  severities: [] as string[],
  statuses: [] as string[],
  types: [] as string[],
})

const bulkChangeForm = reactive({
  action: '',
  transition: '',
  severity: '',
  type: '',
  assignee: '',
  tags: '',
})

onMounted(() => {
  loadIssues()
})

async function loadIssues() {
  loading.value = true
  try {
    const params: Record<string, any> = {
      p: pagination.value.pageIndex,
      ps: pagination.value.pageSize,
    }

    if (filters.severities.length > 0) {
      params.severities = filters.severities.join(',')
    }
    if (filters.statuses.length > 0) {
      params.statuses = filters.statuses.join(',')
    }
    if (filters.types.length > 0) {
      params.types = filters.types.join(',')
    }
    const projectKey = route.params.id || route.params.projectKey
    if (projectKey) {
      params.componentKeys = projectKey as string
    }

    const data = await searchIssues(params)
    issues.value = data.issues || []
    pagination.value.total = data.total || 0
  } catch (error: any) {
    ElMessage.error(error.message || '加载问题列表失败')
  } finally {
    loading.value = false
  }
}

function handleSizeChange(size: number) {
  pagination.value.pageSize = size
  pagination.value.pageIndex = 1
  loadIssues()
}

function handlePageChange(page: number) {
  pagination.value.pageIndex = page
  loadIssues()
}

function handleSelectionChange(selection: Issue[]) {
  checkedIssues.value = selection
}

function search() {
  pagination.value.pageIndex = 1
  loadIssues()
}

function reset() {
  filters.severities = []
  filters.statuses = []
  filters.types = []
  search()
}

function getSeverityType(severity: string): string {
  const map: Record<string, string> = {
    BLOCKER: 'danger',
    CRITICAL: 'danger',
    MAJOR: 'warning',
    MINOR: 'info',
    INFO: '',
  }
  return map[severity] || ''
}

function getStatusType(status: string): string {
  const map: Record<string, string> = {
    OPEN: 'warning',
    CONFIRMED: 'info',
    FIXED: 'success',
    ACCEPTED: '',
    FALSE_POSITIVE: 'info',
  }
  return map[status] || ''
}

const selectedIssue = ref<Issue | null>(null)
const showIssueDetails = ref(false)

function viewIssue(issue: Issue) {
  selectedIssue.value = issue
  showIssueDetails.value = true
}

function handleIssueUpdated(issue: Issue) {
  const index = issues.value.findIndex(i => i.key === issue.key)
  if (index !== -1) {
    issues.value[index] = issue
  }
  loadIssues()
}

function assignIssue(_issue: Issue) {
  ElMessageBox.prompt('请输入要分配的用户名', '分配问题', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
  })
    .then(() => {
      // TODO: 调用分配 API
      ElMessage.success('分配成功')
      loadIssues()
    })
    .catch(() => {})
}

async function handleBulkChange() {
  if (!bulkChangeForm.action) {
    ElMessage.warning('请选择操作')
    return
  }

  bulkChanging.value = true
  try {
    const data: {
      issues: string
      actions?: string
      add_tags?: string
      assign?: string
      comment?: string
      do_transition?: string
      remove_tags?: string
      sendNotifications?: boolean
      set_severity?: string
      set_type?: string
    } = {
      issues: checkedIssues.value.map(i => i.key).join(','),
    }

    switch (bulkChangeForm.action) {
      case 'do_transition':
        if (!bulkChangeForm.transition) {
          ElMessage.warning('请选择状态')
          return
        }
        data.do_transition = bulkChangeForm.transition
        break
      case 'set_severity':
        if (!bulkChangeForm.severity) {
          ElMessage.warning('请选择严重程度')
          return
        }
        data.set_severity = bulkChangeForm.severity
        break
      case 'set_type':
        if (!bulkChangeForm.type) {
          ElMessage.warning('请选择类型')
          return
        }
        data.set_type = bulkChangeForm.type
        break
      case 'assign':
        data.assign = bulkChangeForm.assignee || ''
        break
      case 'add_tags':
        if (!bulkChangeForm.tags) {
          ElMessage.warning('请输入标签')
          return
        }
        data.add_tags = bulkChangeForm.tags
        break
      case 'remove_tags':
        if (!bulkChangeForm.tags) {
          ElMessage.warning('请输入标签')
          return
        }
        data.remove_tags = bulkChangeForm.tags
        break
    }

    await bulkChange(data)
    ElMessage.success('批量操作成功')
    showBulkChange.value = false
    checkedIssues.value = []
    Object.assign(bulkChangeForm, {
      action: '',
      transition: '',
      severity: '',
      type: '',
      assignee: '',
      tags: '',
    })
    loadIssues()
  } catch (error: any) {
    ElMessage.error(error.message || '批量操作失败')
  } finally {
    bulkChanging.value = false
  }
}
</script>

<style scoped>
.issues {
  padding: 20px;
  min-height: 100%;
}

.page-header {
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e4e7ed;
}

.page-content {
  padding: 0;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filters {
  margin-bottom: 20px;
  padding: 20px;
  background: #f5f7fa;
  border-radius: 4px;
}
</style>
