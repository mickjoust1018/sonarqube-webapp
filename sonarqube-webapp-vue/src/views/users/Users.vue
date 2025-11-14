<template>
  <div class="users-page">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span class="card-title">用户管理</span>
          <el-button type="primary" :icon="Plus" @click="handleCreate">创建用户</el-button>
        </div>
      </template>

      <div class="toolbar">
        <el-input
          v-model="searchText"
          placeholder="搜索用户..."
          :prefix-icon="Search"
          clearable
          style="width: 300px"
          @input="handleSearch"
        />
        <el-select v-model="filterActive" placeholder="状态筛选" clearable style="width: 150px">
          <el-option label="活跃" value="true" />
          <el-option label="非活跃" value="false" />
        </el-select>
      </div>

      <el-table
        :data="filteredUsers"
        v-loading="loading"
        stripe
        style="margin-top: 16px"
        @row-click="handleRowClick"
      >
        <el-table-column prop="login" label="用户名" width="180" sortable>
          <template #default="{ row }">
            <el-link type="primary" :underline="false" @click.stop="handleEdit(row.login)">
              {{ row.login }}
            </el-link>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="姓名" width="180" sortable />
        <el-table-column prop="email" label="邮箱" width="220" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.active ? 'success' : 'info'" size="small">
              {{ row.active ? '活跃' : '非活跃' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="组" min-width="200">
          <template #default="{ row }">
            <el-tag v-for="group in row.groups" :key="group" size="small" style="margin-right: 4px">
              {{ group }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="lastConnectionDate" label="最后登录" width="180" sortable>
          <template #default="{ row }">
            {{ formatDate(row.lastConnectionDate) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click.stop="handleEdit(row.login)">
              编辑
            </el-button>
            <el-button link type="danger" size="small" @click.stop="handleRemove(row.login)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="filteredUsers.length"
          layout="total, sizes, prev, pager, next, jumper"
        />
      </div>
    </el-card>

    <!-- 创建/编辑用户对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      @close="handleDialogClose"
    >
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="用户名" prop="login">
          <el-input v-model="form.login" :disabled="isEdit" />
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" type="email" />
        </el-form-item>
        <el-form-item label="密码" prop="password" v-if="!isEdit">
          <el-input v-model="form.password" type="password" show-password />
        </el-form-item>
        <el-form-item label="组">
          <el-select v-model="form.groups" multiple style="width: 100%">
            <el-option
              v-for="group in availableGroups"
              :key="group.name"
              :label="group.name"
              :value="group.name"
            />
          </el-select>
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
import { getJSON, del, postJSON, putJSON } from '@/libs/shared/utils/request'
import { mockUsers, mockGroups } from '@/libs/shared/mocks/mockData'
import { format } from 'date-fns'

const users = ref<any[]>([])
const loading = ref(false)
const searchText = ref('')
const filterActive = ref<string>('')
const currentPage = ref(1)
const pageSize = ref(10)
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref()
const form = ref({
  login: '',
  name: '',
  email: '',
  password: '',
  groups: [] as string[],
})

const availableGroups = ref(mockGroups)

const dialogTitle = computed(() => (isEdit.value ? '编辑用户' : '创建用户'))

const rules = {
  login: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' },
  ],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
}

const filteredUsers = computed(() => {
  let result = users.value

  if (searchText.value) {
    const search = searchText.value.toLowerCase()
    result = result.filter(
      u =>
        u.login.toLowerCase().includes(search) ||
        u.name.toLowerCase().includes(search) ||
        u.email.toLowerCase().includes(search)
    )
  }

  if (filterActive.value !== '') {
    const active = filterActive.value === 'true'
    result = result.filter(u => u.active === active)
  }

  return result
})

onMounted(() => {
  loadUsers()
})

async function loadUsers() {
  loading.value = true
  try {
    // 优先使用 mock 数据
    users.value = mockUsers
    // 如果 API 可用，也可以从 API 加载
    // const data = await getJSON('/api/users/search')
    // users.value = data.users || []
  } catch (error) {
    ElMessage.error('加载用户列表失败')
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  currentPage.value = 1
}

function handleCreate() {
  isEdit.value = false
  form.value = {
    login: '',
    name: '',
    email: '',
    password: '',
    groups: [],
  }
  dialogVisible.value = true
}

function handleEdit(login: string) {
  const user = users.value.find(u => u.login === login)
  if (user) {
    isEdit.value = true
    form.value = {
      login: user.login,
      name: user.name,
      email: user.email,
      password: '',
      groups: [...(user.groups || [])],
    }
    dialogVisible.value = true
  }
}

function handleRemove(login: string) {
  ElMessageBox.confirm('确定要删除该用户吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      try {
        // await del(`/api/users/deactivate?login=${login}`)
        users.value = users.value.filter(u => u.login !== login)
        ElMessage.success('删除成功')
      } catch (error) {
        ElMessage.error('删除失败')
      }
    })
    .catch(() => {})
}

function handleRowClick(row: any) {
  // 可以在这里添加行点击逻辑
}

function handleSubmit() {
  formRef.value?.validate(async valid => {
    if (valid) {
      try {
        if (isEdit.value) {
          // await putJSON(`/api/users/update?login=${form.value.login}`, form.value)
          const index = users.value.findIndex(u => u.login === form.value.login)
          if (index !== -1) {
            users.value[index] = { ...users.value[index], ...form.value }
          }
          ElMessage.success('更新成功')
        } else {
          // await postJSON('/api/users/create', form.value)
          users.value.push({
            ...form.value,
            active: true,
            lastConnectionDate: new Date().toISOString(),
          })
          ElMessage.success('创建成功')
        }
        dialogVisible.value = false
      } catch (error) {
        ElMessage.error(isEdit.value ? '更新失败' : '创建失败')
      }
    }
  })
}

function handleDialogClose() {
  formRef.value?.resetFields()
}

function formatDate(date: string | undefined): string {
  if (!date) return '-'
  try {
    return format(new Date(date), 'yyyy-MM-dd HH:mm')
  } catch {
    return date
  }
}
</script>

<style scoped>
.users-page {
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

.pagination-wrapper {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
