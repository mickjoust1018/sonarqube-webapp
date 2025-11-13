<template>
  <el-drawer
    v-model="visible"
    :title="issue ? `${t('issueDetails.title')} - ${issue.key}` : t('issueDetails.title')"
    size="600px"
    direction="rtl"
    @close="handleClose"
  >
    <div v-if="issue" class="issue-details">
      <!-- 问题基本信息 -->
      <el-card class="issue-info-card" shadow="never">
        <template #header>
          <h3>{{ t('issueDetails.basicInfo') }}</h3>
        </template>
        <el-descriptions :column="1" border>
          <el-descriptions-item label="Key">{{ issue.key }}</el-descriptions-item>
          <el-descriptions-item label="消息">
            <div v-html="formatMessage(issue.message)"></div>
          </el-descriptions-item>
          <el-descriptions-item label="严重程度">
            <el-tag :type="getSeverityType(issue.severity)">{{ issue.severity }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusType(issue.status)">{{ issue.status }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="类型">{{ issue.type }}</el-descriptions-item>
          <el-descriptions-item label="组件">{{ issue.component }}</el-descriptions-item>
          <el-descriptions-item label="行号" v-if="issue.line">{{ issue.line }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">
            {{ formatDate(issue.creationDate) }}
          </el-descriptions-item>
          <el-descriptions-item label="分配人" v-if="issue.assignee">
            {{ issue.assignee }}
          </el-descriptions-item>
        </el-descriptions>
      </el-card>

      <!-- 操作按钮 -->
      <el-card class="issue-actions-card" shadow="never" v-if="issue.actions && issue.actions.length > 0">
        <template #header>
          <h3>{{ t('issueDetails.actions') }}</h3>
        </template>
        <div class="actions-grid">
          <el-button
            v-if="issue.actions.includes('assign')"
            @click="showAssignDialog = true"
            type="primary"
          >
            分配
          </el-button>
          <el-button
            v-if="issue.actions.includes('set_severity')"
            @click="showSeverityDialog = true"
          >
            更改严重程度
          </el-button>
          <el-button
            v-if="issue.actions.includes('set_type')"
            @click="showTypeDialog = true"
          >
            更改类型
          </el-button>
          <el-button
            v-if="issue.actions.includes('comment')"
            @click="showCommentDialog = true"
            type="success"
          >
            添加评论
          </el-button>
          <el-button
            v-if="canTransition"
            @click="showTransitionDialog = true"
          >
            状态转换
          </el-button>
        </div>
      </el-card>

      <!-- 评论和历史记录 -->
      <el-card class="issue-activity-card" shadow="never">
        <template #header>
          <h3>{{ t('issueDetails.activity') }}</h3>
        </template>
        <el-tabs v-model="activeTab">
          <el-tab-pane :label="t('issueDetails.comments')" name="comments">
            <div class="comments-section">
              <el-button
                v-if="issue.actions && issue.actions.includes('comment')"
                type="primary"
                @click="showCommentDialog = true"
                style="margin-bottom: 20px"
              >
                添加评论
              </el-button>
              <div v-if="comments.length === 0" class="empty-state">
                <el-empty :description="t('issueDetails.noComments')" />
              </div>
              <div v-else>
                <div
                  v-for="comment in comments"
                  :key="comment.key"
                  class="comment-item"
                >
                  <div class="comment-header">
                    <el-avatar :size="32">{{ comment.login.charAt(0).toUpperCase() }}</el-avatar>
                    <div class="comment-info">
                      <strong>{{ comment.login }}</strong>
                      <span class="comment-date">{{ formatDate(comment.createdAt) }}</span>
                    </div>
                    <div class="comment-actions" v-if="comment.updatable">
                      <el-button
                        link
                        type="primary"
                        size="small"
                        @click="handleEditComment(comment)"
                      >
                        编辑
                      </el-button>
                      <el-button
                        link
                        type="danger"
                        size="small"
                        @click="handleDeleteComment(comment.key)"
                      >
                        删除
                      </el-button>
                    </div>
                  </div>
                  <div v-if="editingComment && editingComment.key === comment.key" class="comment-edit-form">
                    <el-input
                      v-if="editingComment"
                      v-model="editingComment.text"
                      type="textarea"
                      :rows="3"
                      placeholder="编辑评论..."
                    />
                    <div class="comment-edit-actions">
                      <el-button size="small" @click="cancelEditComment">取消</el-button>
                      <el-button size="small" type="primary" @click="saveEditComment" :loading="updating">
                        保存
                      </el-button>
                    </div>
                  </div>
                  <div v-else class="comment-content" v-html="comment.htmlText"></div>
                </div>
              </div>
            </div>
          </el-tab-pane>
          <el-tab-pane :label="t('issueDetails.history')" name="history">
            <div v-if="changelog.length === 0" class="empty-state">
                <el-empty :description="t('issueDetails.noHistory')" />
            </div>
            <el-timeline v-else>
              <el-timeline-item
                v-for="(item, index) in changelog"
                :key="index"
                :timestamp="formatDate(item.creationDate)"
                placement="top"
              >
                <el-card class="history-item-card" shadow="hover">
                  <div class="history-item">
                    <div class="history-header">
                      <el-avatar :size="24">{{ (item.user || '系统').charAt(0).toUpperCase() }}</el-avatar>
                      <strong class="history-user">{{ item.user || '系统' }}</strong>
                      <el-tag v-if="item.action" size="small" type="info">{{ item.action }}</el-tag>
                    </div>
                    <div v-if="item.diffs && item.diffs.length > 0" class="history-diffs">
                      <div
                        v-for="(diff, diffIndex) in item.diffs"
                        :key="diffIndex"
                        class="history-diff-item"
                      >
                        <span class="diff-field">{{ formatFieldName(diff.field) }}:</span>
                        <span class="diff-old">{{ diff.oldValue || '(空)' }}</span>
                        <el-icon><ArrowRight /></el-icon>
                        <span class="diff-new">{{ diff.newValue || '(空)' }}</span>
                      </div>
                    </div>
                    <div v-else-if="item.comment" class="history-comment">
                      <p>{{ item.comment }}</p>
                    </div>
                  </div>
                </el-card>
              </el-timeline-item>
            </el-timeline>
          </el-tab-pane>
        </el-tabs>
      </el-card>
    </div>

    <!-- 分配对话框 -->
    <el-dialog v-model="showAssignDialog" :title="t('issueDetails.assign')" width="400px">
      <el-form>
            <el-form-item :label="t('issueDetails.assignTo')">
          <el-autocomplete
            v-model="assignForm.assignee"
            :fetch-suggestions="searchUsers"
            :placeholder="t('issueDetails.searchUser')"
            clearable
            @select="handleUserSelect"
          >
            <template #default="{ item }">
              <div class="user-option">
                <span class="user-login">{{ item.login }}</span>
                <span class="user-name" v-if="item.name">({{ item.name }})</span>
              </div>
            </template>
          </el-autocomplete>
          <div class="form-hint">{{ t('issueDetails.unassignHint') }}</div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAssignDialog = false">取消</el-button>
        <el-button type="primary" @click="handleAssign" :loading="assigning">确定</el-button>
      </template>
    </el-dialog>

    <!-- 更改严重程度对话框 -->
    <el-dialog v-model="showSeverityDialog" title="更改严重程度" width="400px">
      <el-form>
        <el-form-item label="严重程度">
          <el-select v-model="severityForm.severity" placeholder="请选择">
            <el-option label="阻断" value="BLOCKER" />
            <el-option label="严重" value="CRITICAL" />
            <el-option label="主要" value="MAJOR" />
            <el-option label="次要" value="MINOR" />
            <el-option label="提示" value="INFO" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showSeverityDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSetSeverity" :loading="updating">确定</el-button>
      </template>
    </el-dialog>

    <!-- 更改类型对话框 -->
    <el-dialog v-model="showTypeDialog" title="更改类型" width="400px">
      <el-form>
        <el-form-item label="类型">
          <el-select v-model="typeForm.type" placeholder="请选择">
            <el-option label="代码异味" value="CODE_SMELL" />
            <el-option label="漏洞" value="VULNERABILITY" />
            <el-option label="Bug" value="BUG" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showTypeDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSetType" :loading="updating">确定</el-button>
      </template>
    </el-dialog>

    <!-- 状态转换对话框 -->
    <el-dialog v-model="showTransitionDialog" title="状态转换" width="400px">
      <el-form>
        <el-form-item label="转换到">
          <el-select v-model="transitionForm.transition" placeholder="请选择">
            <el-option label="确认" value="confirm" />
            <el-option label="解决" value="resolve" />
            <el-option label="误报" value="falsepositive" />
            <el-option label="接受" value="accept" />
            <el-option label="重新打开" value="reopen" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showTransitionDialog = false">取消</el-button>
        <el-button type="primary" @click="handleTransition" :loading="updating">确定</el-button>
      </template>
    </el-dialog>

    <!-- 添加评论对话框 -->
    <el-dialog v-model="showCommentDialog" title="添加评论" width="500px">
      <el-form>
        <el-form-item label="评论">
          <el-input
            v-model="commentForm.text"
            type="textarea"
            :rows="5"
            placeholder="请输入评论内容"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCommentDialog = false">取消</el-button>
        <el-button type="primary" @click="handleAddComment" :loading="commenting">确定</el-button>
      </template>
    </el-dialog>
  </el-drawer>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import DOMPurify from 'dompurify'
import { useI18n } from '@/composables/useI18n'

const { t } = useI18n()
import {
  assignIssue,
  setSeverity,
  setType,
  doTransition,
  addIssueComment,
  deleteIssueComment,
  editIssueComment,
  getIssueChangelog,
} from '@/libs/commons/api/issues'
import type { Issue } from '@/libs/commons/types/issues'
import { format } from 'date-fns'
import { ArrowRight } from '@element-plus/icons-vue'
import { getJSON } from '@/libs/shared/utils/request'

interface Props {
  modelValue: boolean
  issue: Issue | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'issue-updated': [issue: Issue]
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

const activeTab = ref('comments')
const comments = ref<any[]>([])
const changelog = ref<any[]>([])
const showAssignDialog = ref(false)
const showSeverityDialog = ref(false)
const showTypeDialog = ref(false)
const showTransitionDialog = ref(false)
const showCommentDialog = ref(false)
const assigning = ref(false)
const updating = ref(false)
const commenting = ref(false)

const assignForm = ref({ assignee: '' })
const severityForm = ref({ severity: '' })
const typeForm = ref({ type: '' })
const transitionForm = ref({ transition: '' })
const commentForm = ref({ text: '' })
const editingComment = ref<{ key: string; text: string } | null>(null)
const userSearchCache = ref<Map<string, any[]>>(new Map())

const canTransition = computed(() => {
  if (!props.issue) return false
  return props.issue.status === 'OPEN' || props.issue.status === 'CONFIRMED'
})

watch(
  () => props.issue,
  async (newIssue) => {
    if (newIssue) {
      await loadComments()
      await loadChangelog()
    }
  },
  { immediate: true }
)

async function loadComments() {
  if (!props.issue) return
  comments.value = props.issue.comments || []
}

async function loadChangelog() {
  if (!props.issue) return
  try {
    const data = await getIssueChangelog(props.issue.key)
    changelog.value = data.changelog || []
  } catch (error) {
    console.error('Failed to load changelog:', error)
  }
}

function handleClose() {
  emit('update:modelValue', false)
}

function formatMessage(message?: string): string {
  if (!message) return ''
  return DOMPurify.sanitize(message)
}

function formatDate(date?: string): string {
  if (!date) return '-'
  try {
    return format(new Date(date), 'yyyy-MM-dd HH:mm:ss')
  } catch {
    return date
  }
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

async function handleAssign() {
  if (!props.issue) return
  assigning.value = true
  try {
    const updated = await assignIssue({
      issue: props.issue.key,
      assignee: assignForm.value.assignee || undefined,
    })
    ElMessage.success(t('issueDetails.assignSuccess'))
    showAssignDialog.value = false
    assignForm.value.assignee = ''
    emit('issue-updated', updated)
    await loadComments()
  } catch (error: any) {
    ElMessage.error(error.message || t('issueDetails.assignFailed'))
  } finally {
    assigning.value = false
  }
}

async function handleSetSeverity() {
  if (!props.issue) return
  updating.value = true
  try {
    const updated = await setSeverity({
      issue: props.issue.key,
      severity: severityForm.value.severity,
    })
    ElMessage.success('更改成功')
    showSeverityDialog.value = false
    severityForm.value.severity = ''
    emit('issue-updated', updated)
  } catch (error: any) {
    ElMessage.error(error.message || '更改失败')
  } finally {
    updating.value = false
  }
}

async function handleSetType() {
  if (!props.issue) return
  updating.value = true
  try {
    const updated = await setType({
      issue: props.issue.key,
      type: typeForm.value.type,
    })
    ElMessage.success('更改成功')
    showTypeDialog.value = false
    typeForm.value.type = ''
    emit('issue-updated', updated)
  } catch (error: any) {
    ElMessage.error(error.message || '更改失败')
  } finally {
    updating.value = false
  }
}

async function handleTransition() {
  if (!props.issue) return
  updating.value = true
  try {
    const updated = await doTransition({
      issue: props.issue.key,
      transition: transitionForm.value.transition,
    })
    ElMessage.success('状态转换成功')
    showTransitionDialog.value = false
    transitionForm.value.transition = ''
    emit('issue-updated', updated)
    await loadChangelog()
  } catch (error: any) {
    ElMessage.error(error.message || '状态转换失败')
  } finally {
    updating.value = false
  }
}

async function handleAddComment() {
  if (!props.issue || !commentForm.value.text.trim()) {
    ElMessage.warning(t('issueDetails.commentRequired'))
    return
  }
  commenting.value = true
  try {
    const updated = await addIssueComment({
      issue: props.issue.key,
      text: commentForm.value.text,
    })
    ElMessage.success(t('issueDetails.commentAddSuccess'))
    showCommentDialog.value = false
    commentForm.value.text = ''
    emit('issue-updated', updated)
    await loadComments()
  } catch (error: any) {
    ElMessage.error(error.message || t('issueDetails.commentAddFailed'))
  } finally {
    commenting.value = false
  }
}

async function handleDeleteComment(commentKey: string) {
  if (!props.issue) return
  try {
    await ElMessageBox.confirm(t('issueDetails.confirmDelete'), t('issueDetails.deleteTitle'), {
      type: 'warning',
    })
    await deleteIssueComment({ comment: commentKey })
    ElMessage.success(t('issueDetails.commentDeleteSuccess'))
    await loadComments()
    if (props.issue) {
      const updated = { ...props.issue }
      emit('issue-updated', updated)
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || t('issueDetails.commentDeleteFailed'))
    }
  }
}

async function handleEditComment(comment: any) {
  editingComment.value = {
    key: comment.key,
    text: comment.markdown || comment.text || '',
  }
}

function cancelEditComment() {
  editingComment.value = null
}

async function saveEditComment() {
  if (!editingComment.value || !props.issue) return
  updating.value = true
  try {
    const updated = await editIssueComment({
      comment: editingComment.value.key,
      text: editingComment.value.text,
    })
    ElMessage.success(t('issueDetails.commentUpdateSuccess'))
    editingComment.value = null
    emit('issue-updated', updated)
    await loadComments()
  } catch (error: any) {
    ElMessage.error(error.message || t('issueDetails.commentUpdateFailed'))
  } finally {
    updating.value = false
  }
}

async function searchUsers(queryString: string, cb: (results: any[]) => void) {
  if (!queryString) {
    cb([])
    return
  }

  // 检查缓存
  const cacheKey = queryString.toLowerCase()
  if (userSearchCache.value.has(cacheKey)) {
    cb(userSearchCache.value.get(cacheKey)!)
    return
  }

  try {
    const data = await getJSON<{ users: any[] }>('/api/users/search', { q: queryString, ps: 10 })
    const results = (data.users || []).map((user) => ({
      value: user.login,
      login: user.login,
      name: user.name,
    }))
    userSearchCache.value.set(cacheKey, results)
    cb(results)
  } catch (error) {
    console.error('Failed to search users:', error)
    cb([])
  }
}

function handleUserSelect(item: any) {
  assignForm.value.assignee = item.login
}

function formatFieldName(field: string): string {
  return t(`issueDetails.fieldNames.${field}`) || field
}
</script>

<style scoped>
.issue-details {
  padding: 20px;
}

.issue-info-card,
.issue-actions-card,
.issue-activity-card {
  margin-bottom: 20px;
}

.issue-info-card h3,
.issue-actions-card h3,
.issue-activity-card h3 {
  margin: 0;
  font-size: 16px;
}

.actions-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.comments-section {
  padding: 10px 0;
}

.comment-item {
  padding: 15px;
  border-bottom: 1px solid #ebeef5;
  margin-bottom: 10px;
}

.comment-item:last-child {
  border-bottom: none;
}

.comment-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.comment-actions {
  display: flex;
  gap: 5px;
  margin-left: auto;
}

.comment-edit-form {
  margin-top: 10px;
}

.comment-edit-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 10px;
}

.comment-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.comment-date {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.comment-content {
  margin-top: 10px;
  line-height: 1.6;
}

.history-item {
  padding: 10px 0;
}

.empty-state {
  padding: 40px 0;
  text-align: center;
}

.user-option {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-login {
  font-weight: 500;
}

.user-name {
  color: #909399;
  font-size: 12px;
}

.form-hint {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}

.history-item-card {
  margin-bottom: 10px;
}

.history-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.history-user {
  flex: 1;
}

.history-diffs {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 10px;
}

.history-diff-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  background: #f5f7fa;
  border-radius: 4px;
}

.diff-field {
  font-weight: 500;
  min-width: 80px;
}

.diff-old {
  color: #f56c6c;
  text-decoration: line-through;
}

.diff-new {
  color: #67c23a;
  font-weight: 500;
}

.history-comment {
  margin-top: 10px;
  padding: 10px;
  background: #f5f7fa;
  border-radius: 4px;
}
</style>
