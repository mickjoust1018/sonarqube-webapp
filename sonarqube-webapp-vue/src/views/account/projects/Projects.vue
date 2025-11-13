<template>
  <div class="account-projects">
    <el-card>
      <template #header>
        <h3>我的项目</h3>
      </template>
      <el-table :data="projects" v-loading="loading">
        <el-table-column prop="name" label="项目名称" />
        <el-table-column prop="key" label="项目 Key" />
        <el-table-column label="操作">
          <template #default="{ row }">
            <el-button link type="primary" @click="viewProject(row.key)">查看</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getJSON } from '@/libs/shared/utils/request'

const router = useRouter()

const projects = ref([])
const loading = ref(false)

onMounted(() => {
  loadProjects()
})

async function loadProjects() {
  loading.value = true
  try {
    const data = await getJSON('/api/users/current')
    // 这里应该获取用户的项目列表
    projects.value = []
  } catch (error) {
    ElMessage.error('加载项目列表失败')
  } finally {
    loading.value = false
  }
}

function viewProject(key: string) {
  router.push(`/project/${key}`)
}
</script>

<style scoped>
.account-projects {
  padding: 20px;
}
</style>
