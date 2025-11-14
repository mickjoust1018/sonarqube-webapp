<template>
  <div class="create-project">
    <el-container>
      <el-main>
        <!-- 创建方式选择 -->
        <el-card v-if="!selectedMode" class="mode-selection">
          <template #header>
            <h2>选择创建方式</h2>
          </template>
          <div class="mode-grid">
            <el-card
              v-for="mode in creationModes"
              :key="mode.value"
              class="mode-card"
              shadow="hover"
              @click="selectMode(mode.value)"
            >
              <div class="mode-icon">
                <el-icon :size="48"><component :is="mode.icon" /></el-icon>
              </div>
              <h3>{{ mode.label }}</h3>
              <p>{{ mode.description }}</p>
            </el-card>
          </div>
        </el-card>

        <!-- 手动创建表单 -->
        <el-card v-if="selectedMode === 'manual'">
          <template #header>
            <div class="card-header">
              <h3>手动创建项目</h3>
              <el-button link @click="selectedMode = null">
                <el-icon><ArrowLeft /></el-icon>
                返回
              </el-button>
            </div>
          </template>
          <el-form :model="form" :rules="rules" ref="formRef" label-width="120px">
            <el-form-item label="项目名称" prop="name">
              <el-input v-model="form.name" placeholder="例如: My Project" @blur="generateKey" />
              <div class="form-hint">项目的显示名称</div>
            </el-form-item>
            <el-form-item label="项目 Key" prop="key">
              <el-input
                v-model="form.key"
                placeholder="例如: my-project"
                :disabled="autoGenerateKey"
              />
              <div class="form-hint">
                项目的唯一标识符，只能包含字母、数字、'-'、'_'、'.'
                <el-checkbox v-model="autoGenerateKey" style="margin-left: 10px">
                  自动生成
                </el-checkbox>
              </div>
            </el-form-item>
            <el-form-item label="可见性" prop="visibility">
              <el-radio-group v-model="form.visibility">
                <el-radio label="private">
                  <el-icon><Lock /></el-icon>
                  私有 - 仅项目成员可见
                </el-radio>
                <el-radio label="public">
                  <el-icon><Unlock /></el-icon>
                  公开 - 所有用户可见
                </el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="主分支" prop="mainBranch">
              <el-input v-model="form.mainBranch" placeholder="例如: main, master" />
              <div class="form-hint">项目的主分支名称（可选）</div>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleSubmit" :loading="loading">
                创建项目
              </el-button>
              <el-button @click="goBack">取消</el-button>
            </el-form-item>
          </el-form>
        </el-card>

        <!-- ALM 集成创建 -->
        <el-card v-if="selectedMode && selectedMode !== 'manual'">
          <template #header>
            <div class="card-header">
              <h3>{{ getModeLabel(selectedMode) }}</h3>
              <el-button link @click="selectedMode = null">
                <el-icon><ArrowLeft /></el-icon>
                返回
              </el-button>
            </div>
          </template>
          <div class="alm-integration">
            <el-alert type="info" :closable="false" show-icon style="margin-bottom: 20px">
              <p>ALM 集成功能需要配置相应的 DevOps 平台连接。</p>
              <p>请先在系统设置中配置 {{ getModeLabel(selectedMode) }} 集成。</p>
            </el-alert>

            <el-form v-if="almSettings.length > 0" label-width="120px">
              <el-form-item label="选择连接">
                <el-select v-model="selectedAlmSetting" placeholder="请选择" style="width: 100%">
                  <el-option
                    v-for="setting in almSettings"
                    :key="setting.key"
                    :label="setting.name"
                    :value="setting.key"
                  />
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="loadAlmRepositories" :loading="loadingRepos">
                  加载仓库列表
                </el-button>
              </el-form-item>
            </el-form>

            <div v-if="almRepositories.length > 0" class="alm-repositories">
              <el-table :data="almRepositories" style="width: 100%">
                <el-table-column prop="name" label="仓库名称" />
                <el-table-column prop="key" label="Key" />
                <el-table-column label="操作" width="120">
                  <template #default="{ row }">
                    <el-button type="primary" link @click="importAlmProject(row)"> 导入 </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>

            <el-empty v-else-if="almSettings.length === 0" description="未配置 ALM 集成">
              <el-button type="primary" @click="goToSettings">前往设置</el-button>
            </el-empty>
          </div>
        </el-card>
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  ArrowLeft,
  Lock,
  Unlock,
  Document,
  Connection,
  // Github and Gitlab icons not available in element-plus/icons-vue
  Cloudy,
} from '@element-plus/icons-vue'
import { createProject, searchProjects } from '@/libs/commons/api/projects'
import { getJSON } from '@/libs/shared/utils/request'

const router = useRouter()
const formRef = ref()
const loading = ref(false)
const selectedMode = ref<string | null>(null)
const autoGenerateKey = ref(true)
const almSettings = ref<any[]>([])
const selectedAlmSetting = ref<string>('')
const almRepositories = ref<any[]>([])
const loadingRepos = ref(false)

const form = reactive({
  name: '',
  key: '',
  visibility: 'private',
  mainBranch: '',
})

const validateKey = (_rule: any, value: string, callback: Function) => {
  if (!value) {
    callback(new Error('请输入项目 Key'))
    return
  }
  if (!/^[a-zA-Z0-9\-_.]+$/.test(value)) {
    callback(new Error('项目 Key 只能包含字母、数字、-、_、.'))
    return
  }
  if (value.length < 1 || value.length > 400) {
    callback(new Error('项目 Key 长度必须在 1 到 400 个字符之间'))
    return
  }
  // 检查项目 Key 是否已存在
  checkProjectKeyExists(value)
    .then(exists => {
      if (exists) {
        callback(new Error('项目 Key 已存在，请使用其他 Key'))
      } else {
        callback()
      }
    })
    .catch(() => {
      callback()
    })
}

const validateName = (_rule: any, value: string, callback: Function) => {
  if (!value) {
    callback(new Error('请输入项目名称'))
    return
  }
  if (value.trim().length === 0) {
    callback(new Error('项目名称不能为空'))
    return
  }
  if (value.length > 255) {
    callback(new Error('项目名称长度不能超过 255 个字符'))
    return
  }
  callback()
}

const validateMainBranch = (_rule: any, value: string, callback: Function) => {
  if (value && !/^[a-zA-Z0-9\-_./]+$/.test(value)) {
    callback(new Error('主分支名称只能包含字母、数字、-、_、.、/'))
    return
  }
  callback()
}

const rules = {
  name: [{ validator: validateName, trigger: 'blur' }],
  key: [{ validator: validateKey, trigger: 'blur' }],
  visibility: [{ required: true, message: '请选择可见性', trigger: 'change' }],
  mainBranch: [{ validator: validateMainBranch, trigger: 'blur' }],
}

const creationModes = [
  {
    value: 'manual',
    label: '手动创建',
    description: '手动输入项目信息创建',
    icon: Document,
  },
  {
    value: 'github',
    label: 'GitHub',
    description: '从 GitHub 仓库导入',
    icon: Connection, // Using Connection as placeholder for Github
  },
  {
    value: 'gitlab',
    label: 'GitLab',
    description: '从 GitLab 仓库导入',
    icon: Connection, // Using Connection as placeholder for Gitlab
  },
  {
    value: 'bitbucket',
    label: 'Bitbucket',
    description: '从 Bitbucket 仓库导入',
    icon: Connection,
  },
  {
    value: 'azure',
    label: 'Azure DevOps',
    description: '从 Azure DevOps 导入',
    icon: Cloudy,
  },
]

watch(
  () => form.name,
  () => {
    if (autoGenerateKey.value) {
      generateKey()
    }
  }
)

function generateKey() {
  if (autoGenerateKey.value && form.name) {
    form.key = form.name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
    // 触发验证
    if (formRef.value) {
      formRef.value.validateField('key')
    }
  }
}

async function checkProjectKeyExists(key: string): Promise<boolean> {
  if (!key) return false
  try {
    const result = await searchProjects({ ps: 1 })
    return result.components.some((p: any) => p.key === key)
  } catch {
    return false
  }
}

async function selectMode(mode: string) {
  selectedMode.value = mode
  if (mode === 'manual') {
    // 重置表单
    Object.assign(form, {
      name: '',
      key: '',
      visibility: 'private',
      mainBranch: '',
    })
    autoGenerateKey.value = true
  } else {
    // 加载 ALM 设置
    await loadAlmSettings(mode)
  }
}

async function loadAlmSettings(mode: string) {
  try {
    // 这里应该调用实际的 API 来获取 ALM 设置
    // 目前使用模拟数据
    const endpoint = `/api/alm_settings/list?alm=${mode}`
    try {
      const data = await getJSON<any>(endpoint)
      almSettings.value = data.settings || []
    } catch {
      // 如果 API 不存在，使用空数组
      almSettings.value = []
    }
  } catch (error) {
    console.error('Failed to load ALM settings:', error)
    almSettings.value = []
  }
}

async function loadAlmRepositories() {
  if (!selectedAlmSetting.value) {
    ElMessage.warning('请先选择 ALM 连接')
    return
  }
  loadingRepos.value = true
  try {
    // 这里应该调用实际的 API 来获取仓库列表
    const endpoint = `/api/alm_settings/${selectedAlmSetting.value}/repositories`
    try {
      const data = await getJSON<any>(endpoint)
      almRepositories.value = data.repositories || []
    } catch {
      ElMessage.warning('无法加载仓库列表，请检查 ALM 配置')
      almRepositories.value = []
    }
  } catch (error: any) {
    ElMessage.error(error.message || '加载仓库列表失败')
  } finally {
    loadingRepos.value = false
  }
}

async function importAlmProject(repo: any) {
  loading.value = true
  try {
    const data: any = {
      almSetting: selectedAlmSetting.value,
      repositoryKey: repo.key,
    }
    await createProject(data)
    ElMessage.success('项目导入成功')
    router.push(`/project/${repo.key}`)
  } catch (error: any) {
    ElMessage.error(error.message || '项目导入失败')
  } finally {
    loading.value = false
  }
}

function goToSettings() {
  router.push('/admin/settings')
}

function getModeLabel(mode: string): string {
  const modeObj = creationModes.find(m => m.value === mode)
  return modeObj?.label || mode
}

async function handleSubmit() {
  if (!formRef.value) return

  await formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      loading.value = true
      try {
        const data: any = {
          name: form.name,
          project: form.key,
          visibility: form.visibility,
        }
        if (form.mainBranch) {
          data.mainBranch = form.mainBranch
        }

        await createProject(data)
        ElMessage.success('项目创建成功')
        router.push(`/project/${form.key}`)
      } catch (error: any) {
        ElMessage.error(error.message || '项目创建失败')
      } finally {
        loading.value = false
      }
    }
  })
}

function goBack() {
  if (selectedMode.value) {
    selectedMode.value = null
  } else {
    router.back()
  }
}
</script>

<style scoped>
.create-project {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.mode-selection {
  margin-bottom: 20px;
}

.mode-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.mode-card {
  cursor: pointer;
  text-align: center;
  transition: all 0.3s;
}

.mode-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.mode-icon {
  margin-bottom: 15px;
  color: #409eff;
}

.mode-card h3 {
  margin: 10px 0;
  font-size: 16px;
}

.mode-card p {
  color: #909399;
  font-size: 14px;
  margin: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  margin: 0;
}

.form-hint {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}
</style>
