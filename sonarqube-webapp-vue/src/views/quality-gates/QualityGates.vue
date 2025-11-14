<template>
  <div class="quality-gates-page">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span class="card-title">质量门</span>
          <el-button type="primary" :icon="Plus" @click="handleCreate">创建质量门</el-button>
        </div>
      </template>

      <div class="toolbar">
        <el-input
          v-model="searchText"
          placeholder="搜索质量门..."
          :prefix-icon="Search"
          clearable
          style="width: 300px"
        />
      </div>

      <el-table :data="filteredQualityGates" v-loading="loading" stripe style="margin-top: 16px">
        <el-table-column prop="name" label="名称" width="250" sortable>
          <template #default="{ row }">
            <el-link type="primary" :underline="false" @click="handleEdit(row.id)">
              {{ row.name }}
            </el-link>
            <el-tag v-if="row.isDefault" size="small" type="success" style="margin-left: 8px">
              默认
            </el-tag>
            <el-tag v-if="row.isBuiltIn" size="small" type="info" style="margin-left: 4px">
              内置
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="条件数" width="120">
          <template #default="{ row }">
            <el-tag size="small">{{ row.conditions?.length || 0 }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="条件详情" min-width="400">
          <template #default="{ row }">
            <div class="conditions-list">
              <el-tag
                v-for="(condition, index) in row.conditions"
                :key="index"
                size="small"
                style="margin-right: 8px; margin-bottom: 4px"
              >
                {{ formatCondition(condition) }}
              </el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleEdit(row.id)">
              编辑
            </el-button>
            <el-button
              link
              type="danger"
              size="small"
              :disabled="row.isBuiltIn"
              @click="handleRemove(row.id)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 创建/编辑质量门对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="700px"
      @close="handleDialogClose"
    >
      <el-form :model="form" :rules="rules" ref="formRef" label-width="120px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="设为默认">
          <el-switch v-model="form.isDefault" />
        </el-form-item>
        <el-form-item label="条件">
          <div class="conditions-editor">
            <el-button type="primary" size="small" :icon="Plus" @click="handleAddCondition">
              添加条件
            </el-button>
            <el-table :data="form.conditions" style="margin-top: 12px" border>
              <el-table-column prop="metric" label="指标" width="200">
                <template #default="{ row, $index }">
                  <el-select v-model="row.metric" placeholder="选择指标" style="width: 100%">
                    <el-option label="覆盖率" value="coverage" />
                    <el-option label="重复率" value="duplicated_lines_density" />
                    <el-option label="Bug数" value="bugs" />
                    <el-option label="漏洞数" value="vulnerabilities" />
                  </el-select>
                </template>
              </el-table-column>
              <el-table-column prop="op" label="操作符" width="150">
                <template #default="{ row }">
                  <el-select v-model="row.op" placeholder="选择操作符" style="width: 100%">
                    <el-option label="小于" value="LT" />
                    <el-option label="大于" value="GT" />
                    <el-option label="等于" value="EQ" />
                  </el-select>
                </template>
              </el-table-column>
              <el-table-column prop="error" label="阈值" width="150">
                <template #default="{ row }">
                  <el-input v-model="row.error" />
                </template>
              </el-table-column>
              <el-table-column label="操作" width="100">
                <template #default="{ $index }">
                  <el-button link type="danger" size="small" @click="handleRemoveCondition($index)">
                    删除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search } from '@element-plus/icons-vue'
import { mockQualityGatesList } from '@/libs/shared/mocks/mockData'

const qualityGates = ref<any[]>([])
const loading = ref(false)
const searchText = ref('')
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref()
const form = ref({
  name: '',
  isDefault: false,
  conditions: [] as Array<{ metric: string; op: string; error: string }>,
})

const dialogTitle = computed(() => (isEdit.value ? '编辑质量门' : '创建质量门'))

const rules = {
  name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
}

const filteredQualityGates = computed(() => {
  if (!searchText.value) return qualityGates.value
  const search = searchText.value.toLowerCase()
  return qualityGates.value.filter(g => g.name.toLowerCase().includes(search))
})

onMounted(() => {
  loadQualityGates()
})

async function loadQualityGates() {
  loading.value = true
  try {
    qualityGates.value = mockQualityGatesList
  } catch (error) {
    ElMessage.error('加载质量门列表失败')
  } finally {
    loading.value = false
  }
}

function formatCondition(condition: any): string {
  const metricMap: Record<string, string> = {
    coverage: '覆盖率',
    duplicated_lines_density: '重复率',
    bugs: 'Bug数',
    vulnerabilities: '漏洞数',
  }
  const opMap: Record<string, string> = {
    LT: '<',
    GT: '>',
    EQ: '=',
  }
  const metric = metricMap[condition.metric] || condition.metric
  const op = opMap[condition.op] || condition.op
  return `${metric} ${op} ${condition.error}`
}

function handleCreate() {
  isEdit.value = false
  form.value = {
    name: '',
    isDefault: false,
    conditions: [],
  }
  dialogVisible.value = true
}

function handleEdit(id: string) {
  const gate = qualityGates.value.find(g => g.id === id)
  if (gate) {
    isEdit.value = true
    form.value = {
      name: gate.name,
      isDefault: gate.isDefault,
      conditions: [...(gate.conditions || [])],
    }
    dialogVisible.value = true
  }
}

function handleRemove(id: string) {
  ElMessageBox.confirm('确定要删除该质量门吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      qualityGates.value = qualityGates.value.filter(g => g.id !== id)
      ElMessage.success('删除成功')
    })
    .catch(() => {})
}

function handleAddCondition() {
  form.value.conditions.push({
    metric: '',
    op: 'GT',
    error: '',
  })
}

function handleRemoveCondition(index: number) {
  form.value.conditions.splice(index, 1)
}

function handleSubmit() {
  formRef.value?.validate(valid => {
    if (valid) {
      if (form.value.conditions.length === 0) {
        ElMessage.warning('请至少添加一个条件')
        return
      }
      if (isEdit.value) {
        const index = qualityGates.value.findIndex(g => g.id === form.value.name)
        if (index !== -1) {
          qualityGates.value[index] = {
            ...qualityGates.value[index],
            ...form.value,
            id: form.value.name,
          }
        }
        ElMessage.success('更新成功')
      } else {
        qualityGates.value.push({
          id: String(qualityGates.value.length + 1),
          ...form.value,
          isBuiltIn: false,
        })
        ElMessage.success('创建成功')
      }
      dialogVisible.value = false
    }
  })
}

function handleDialogClose() {
  formRef.value?.resetFields()
}
</script>

<style scoped>
.quality-gates-page {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  font-size: 18px;
  font-weight: 500;
}

.toolbar {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.conditions-list {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.conditions-editor {
  width: 100%;
}
</style>
