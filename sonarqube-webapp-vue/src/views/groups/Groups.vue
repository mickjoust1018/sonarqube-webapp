<template>
  <div class="groups">
    <el-container>
      <el-header>
        <div class="header">
          <h2>组管理</h2>
          <el-button type="primary" @click="create">创建组</el-button>
        </div>
      </el-header>
      <el-main>
        <el-table :data="groups" v-loading="loading">
          <el-table-column prop="name" label="组名" />
          <el-table-column prop="description" label="描述" />
          <el-table-column label="操作">
            <template #default="{ row }">
              <el-button link type="primary" @click="edit(row.name)">编辑</el-button>
              <el-button link type="danger" @click="remove(row.name)">删除</el-button>
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

const groups = ref([])
const loading = ref(false)

onMounted(() => {
  loadGroups()
})

async function loadGroups() {
  loading.value = true
  try {
    const data = await getJSON('/api/user_groups/search')
    groups.value = data.groups || []
  } catch (error) {
    ElMessage.error('加载组列表失败')
  } finally {
    loading.value = false
  }
}

function create() {
  console.log('Create group')
}

function edit(name: string) {
  console.log('Edit group:', name)
}

async function remove(name: string) {
  try {
    await ElMessageBox.confirm('确定要删除该组吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    await del(`/api/user_groups/delete?name=${name}`)
    ElMessage.success('删除成功')
    loadGroups()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}
</script>

<style scoped>
.groups {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
