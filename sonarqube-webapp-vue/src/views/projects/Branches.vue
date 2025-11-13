<template>
  <div class="branches-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <h3>{{ t('branches.title') }}</h3>
          <el-button type="primary" @click="showCreateDialog = true">
            <el-icon><Plus /></el-icon>
            {{ t('branches.createBranch') }}
          </el-button>
        </div>
      </template>

      <el-table :data="branches" style="width: 100%" v-loading="loading">
        <el-table-column prop="name" :label="t('branches.name')" min-width="200">
          <template #default="{ row }">
            <span>{{ row.name }}</span>
            <el-tag v-if="row.isMain" size="small" type="success" style="margin-left: 8px">
              {{ t('branches.mainBranch') }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="type" :label="t('branches.type')" width="120" />
        <el-table-column :label="t('branches.status')" width="120">
          <template #default="{ row }">
            <el-tag
              v-if="row.status"
              :type="getStatusType(row.status.qualityGateStatus)"
              size="small"
            >
              {{ row.status.qualityGateStatus }}
            </el-tag>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column :label="t('branches.analysisDate')" width="180">
          <template #default="{ row }">
            {{ formatDate(row.analysisDate) }}
          </template>
        </el-table-column>
        <el-table-column :label="t('branches.protected')" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.excludedFromPurge" type="info" size="small">
              {{ t('common.yes') }}
            </el-tag>
            <span v-else>{{ t('common.no') }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="t('common.actions')" width="200" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="!row.isMain"
              type="primary"
              link
              size="small"
              @click="handleSetMain(row)"
            >
              {{ t('branches.setAsMain') }}
            </el-button>
            <el-button
              type="primary"
              link
              size="small"
              @click="handleToggleProtection(row)"
            >
              {{ row.excludedFromPurge ? t('branches.unprotect') : t('branches.protect') }}
            </el-button>
            <el-button
              v-if="!row.isMain"
              type="danger"
              link
              size="small"
              @click="handleDelete(row)"
            >
              {{ t('common.delete') }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog
      v-model="showCreateDialog"
      :title="t('branches.createBranch')"
      width="500px"
      @close="resetCreateForm"
    >
      <el-form :model="createForm" :rules="createRules" ref="createFormRef" label-width="100px">
        <el-form-item :label="t('branches.branchName')" prop="name">
          <el-input v-model="createForm.name" :placeholder="t('branches.branchNamePlaceholder')" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateDialog = false">{{ t('common.cancel') }}</el-button>
        <el-button type="primary" @click="handleCreate" :loading="creating">
          {{ t('common.create') }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useI18n } from '@/composables/useI18n'
import {
  getBranches,
  deleteBranch,
  setMainBranch,
  excludeBranchFromPurge,
  type Branch,
} from '@/libs/commons/api/branches'

const { t } = useI18n()
const route = useRoute()

const projectKey = route.params.projectKey as string
const loading = ref(false)
const branches = ref<Branch[]>([])
const showCreateDialog = ref(false)
const creating = ref(false)
const createFormRef = ref()
const createForm = ref({
  name: '',
})

const createRules = {
  name: [
    { required: true, message: t('branches.branchNameRequired'), trigger: 'blur' },
    {
      pattern: /^[a-zA-Z0-9\-_/]+$/,
      message: t('branches.branchNameInvalid'),
      trigger: 'blur',
    },
  ],
}

onMounted(() => {
  loadBranches()
})

async function loadBranches() {
  loading.value = true
  try {
    const data = await getBranches(projectKey)
    branches.value = data
  } catch (error) {
    ElMessage.error(t('branches.loadFailed'))
  } finally {
    loading.value = false
  }
}

async function handleCreate() {
  if (!createFormRef.value) return

  await createFormRef.value.validate(async (valid: boolean) => {
    if (!valid) return

    creating.value = true
    try {
      // 在实际应用中，这里应该调用创建分支的 API
      // 目前使用模拟数据
      const newBranch: Branch = {
        name: createForm.value.name,
        isMain: false,
        type: 'BRANCH',
        status: { qualityGateStatus: 'NONE' },
        excludedFromPurge: false,
      }
      branches.value.push(newBranch)
      ElMessage.success(t('branches.createSuccess'))
      showCreateDialog.value = false
    } catch (error) {
      ElMessage.error(t('branches.createFailed'))
    } finally {
      creating.value = false
    }
  })
}

async function handleDelete(branch: Branch) {
  try {
    await ElMessageBox.confirm(
      t('branches.deleteConfirm', { name: branch.name }),
      t('common.confirm'),
      {
        type: 'warning',
      }
    )
    await deleteBranch({ branch: branch.name, project: projectKey })
    ElMessage.success(t('branches.deleteSuccess'))
    loadBranches()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(t('branches.deleteFailed'))
    }
  }
}

async function handleSetMain(branch: Branch) {
  try {
    await setMainBranch(projectKey, branch.name)
    ElMessage.success(t('branches.setMainSuccess'))
    loadBranches()
  } catch (error) {
    ElMessage.error(t('branches.setMainFailed'))
  }
}

async function handleToggleProtection(branch: Branch) {
  try {
    await excludeBranchFromPurge(projectKey, branch.name, !branch.excludedFromPurge)
    ElMessage.success(
      branch.excludedFromPurge ? t('branches.unprotectSuccess') : t('branches.protectSuccess')
    )
    loadBranches()
  } catch (error) {
    ElMessage.error(t('branches.protectFailed'))
  }
}

function resetCreateForm() {
  createForm.value.name = ''
  createFormRef.value?.resetFields()
}

function getStatusType(status: string): string {
  const typeMap: Record<string, string> = {
    OK: 'success',
    ERROR: 'danger',
    WARN: 'warning',
    NONE: 'info',
  }
  return typeMap[status] || ''
}

function formatDate(date?: string): string {
  if (!date) return '-'
  return new Date(date).toLocaleString('zh-CN')
}
</script>

<style scoped>
.branches-page {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  margin: 0;
}
</style>
