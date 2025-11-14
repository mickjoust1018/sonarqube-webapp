<template>
  <div class="webhooks">
    <el-container>
      <el-header>
        <div class="header">
          <h2>Webhooks</h2>
          <el-button type="primary" @click="create">创建 Webhook</el-button>
        </div>
      </el-header>
      <el-main>
        <el-table :data="webhooks" v-loading="loading">
          <el-table-column prop="name" label="名称" />
          <el-table-column prop="url" label="URL" />
          <el-table-column label="操作">
            <template #default="{ row }">
              <el-button link type="primary" @click="edit(row.key)">编辑</el-button>
              <el-button link type="danger" @click="remove(row.key)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getJSON, del } from '@/libs/shared/utils/request'

const route = useRoute()

const webhooks = ref([])
const loading = ref(false)

onMounted(() => {
  loadWebhooks()
})

async function loadWebhooks() {
  loading.value = true
  try {
    const params: any = {}
    const projectKey = route.params.id || route.params.projectKey
    if (projectKey) {
      params.projectKey = projectKey as string
    }
    const data = await getJSON('/api/webhooks/list', params)
    webhooks.value = data.webhooks || []
  } catch (error) {
    ElMessage.error('加载 Webhook 列表失败')
  } finally {
    loading.value = false
  }
}

function create() {
  console.log('Create webhook')
}

function edit(key: string) {
  console.log('Edit webhook:', key)
}

async function remove(key: string) {
  try {
    await ElMessageBox.confirm('确定要删除该 Webhook 吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    await del(`/api/webhooks/delete?webhook=${key}`)
    ElMessage.success('删除成功')
    loadWebhooks()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}
</script>

<style scoped>
.webhooks {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
