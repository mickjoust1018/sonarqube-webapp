<template>
  <div class="permission-templates">
    <el-container>
      <el-header>
        <h2>权限模板</h2>
      </el-header>
      <el-main>
        <el-table :data="templates" v-loading="loading">
          <el-table-column prop="name" label="模板名称" />
          <el-table-column prop="description" label="描述" />
          <el-table-column label="操作">
            <template #default="{ row }">
              <el-button link type="primary" @click="edit(row.id)">编辑</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getJSON } from '@/libs/shared/utils/request'

const templates = ref([])
const loading = ref(false)

onMounted(() => {
  loadTemplates()
})

async function loadTemplates() {
  loading.value = true
  try {
    const data = await getJSON('/api/permission_templates/search')
    templates.value = data.permissionTemplates || []
  } catch (error) {
    ElMessage.error('加载权限模板列表失败')
  } finally {
    loading.value = false
  }
}

function edit(id: string) {
  console.log('Edit template:', id)
}
</script>

<style scoped>
.permission-templates {
  padding: 20px;
}
</style>
