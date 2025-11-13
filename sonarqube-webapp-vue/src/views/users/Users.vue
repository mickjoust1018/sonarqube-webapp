<template>
  <div class="users">
    <el-container>
      <el-header>
        <div class="header">
          <h2>用户管理</h2>
          <el-button type="primary" @click="create">创建用户</el-button>
        </div>
      </el-header>
      <el-main>
        <el-table :data="users" v-loading="loading">
          <el-table-column prop="login" label="用户名" />
          <el-table-column prop="name" label="姓名" />
          <el-table-column prop="email" label="邮箱" />
          <el-table-column label="操作">
            <template #default="{ row }">
              <el-button link type="primary" @click="edit(row.login)">编辑</el-button>
              <el-button link type="danger" @click="remove(row.login)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getJSON, del } from '@/libs/shared/utils/request'

const users = ref([])
const loading = ref(false)

onMounted(() => {
  loadUsers()
})

async function loadUsers() {
  loading.value = true
  try {
    const data = await getJSON('/api/users/search')
    users.value = data.users || []
  } catch (error) {
    ElMessage.error('加载用户列表失败')
  } finally {
    loading.value = false
  }
}

function create() {
  console.log('Create user')
}

function edit(login: string) {
  console.log('Edit user:', login)
}

async function remove(login: string) {
  try {
    await ElMessageBox.confirm('确定要删除该用户吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    await del(`/api/users/deactivate?login=${login}`)
    ElMessage.success('删除成功')
    loadUsers()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}
</script>

<style scoped>
.users {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
