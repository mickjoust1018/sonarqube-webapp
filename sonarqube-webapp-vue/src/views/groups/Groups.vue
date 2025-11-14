<template>
  <div class="groups-page">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span class="card-title">组管理</span>
          <el-button type="primary" :icon="Plus" @click="handleCreate">创建组</el-button>
        </div>
      </template>

      <div class="toolbar">
        <el-input
          v-model="searchText"
          placeholder="搜索组..."
          :prefix-icon="Search"
          clearable
          style="width: 300px"
        />
      </div>

      <el-table :data="filteredGroups" v-loading="loading" stripe style="margin-top: 16px">
        <el-table-column prop="name" label="组名" width="250" sortable>
          <template #default="{ row }">
            <el-link type="primary" :underline="false" @click="handleEdit(row.name)">
              {{ row.name }}
            </el-link>
            <el-tag v-if="row.default" size="small" type="info" style="margin-left: 8px">
              默认
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" min-width="300" />
        <el-table-column label="成员数" width="120" sortable>
          <template #default="{ row }">
            <el-tag size="small">{{ row.membersCount || 0 }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleEdit(row.name)">
              编辑
            </el-button>
            <el-button
              link
              type="danger"
              size="small"
              :disabled="row.default"
              @click="handleRemove(row.name)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 创建/编辑组对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="500px"
      @close="handleDialogClose"
    >
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="组名" prop="name">
          <el-input v-model="form.name" :disabled="isEdit" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="form.description" type="textarea" :rows="3" />
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
import { mockGroups } from '@/libs/shared/mocks/mockData'

const groups = ref<any[]>([])
const loading = ref(false)
const searchText = ref('')
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref()
const form = ref({
  name: '',
  description: '',
})

const dialogTitle = computed(() => (isEdit.value ? '编辑组' : '创建组'))

const rules = {
  name: [{ required: true, message: '请输入组名', trigger: 'blur' }],
  description: [{ required: true, message: '请输入描述', trigger: 'blur' }],
}

const filteredGroups = computed(() => {
  if (!searchText.value) return groups.value
  const search = searchText.value.toLowerCase()
  return groups.value.filter(
    g => g.name.toLowerCase().includes(search) || g.description.toLowerCase().includes(search)
  )
})

onMounted(() => {
  loadGroups()
})

async function loadGroups() {
  loading.value = true
  try {
    groups.value = mockGroups
  } catch (error) {
    ElMessage.error('加载组列表失败')
  } finally {
    loading.value = false
  }
}

function handleCreate() {
  isEdit.value = false
  form.value = {
    name: '',
    description: '',
  }
  dialogVisible.value = true
}

function handleEdit(name: string) {
  const group = groups.value.find(g => g.name === name)
  if (group) {
    isEdit.value = true
    form.value = {
      name: group.name,
      description: group.description,
    }
    dialogVisible.value = true
  }
}

function handleRemove(name: string) {
  ElMessageBox.confirm('确定要删除该组吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      groups.value = groups.value.filter(g => g.name !== name)
      ElMessage.success('删除成功')
    })
    .catch(() => {})
}

function handleSubmit() {
  formRef.value?.validate(valid => {
    if (valid) {
      if (isEdit.value) {
        const index = groups.value.findIndex(g => g.name === form.value.name)
        if (index !== -1) {
          groups.value[index] = { ...groups.value[index], ...form.value }
        }
        ElMessage.success('更新成功')
      } else {
        groups.value.push({
          ...form.value,
          membersCount: 0,
          default: false,
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
.groups-page {
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
</style>
