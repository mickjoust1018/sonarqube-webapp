<template>
  <div class="quality-gates">
    <el-container>
      <el-header>
        <div class="header">
          <h2>质量门</h2>
          <el-button type="primary" @click="create">创建质量门</el-button>
        </div>
      </el-header>
      <el-main>
        <el-table :data="qualityGates" v-loading="loading">
          <el-table-column prop="name" label="名称" />
          <el-table-column prop="isDefault" label="默认" />
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
import { ElMessage, ElMessageBox } from 'element-plus'
import { getJSON, del } from '@/libs/shared/utils/request'

const qualityGates = ref([])
const loading = ref(false)

onMounted(() => {
  loadQualityGates()
})

async function loadQualityGates() {
  loading.value = true
  try {
    const data = await getJSON('/api/qualitygates/list')
    qualityGates.value = data.qualitygates || []
  } catch (error) {
    ElMessage.error('加载质量门列表失败')
  } finally {
    loading.value = false
  }
}

function create() {
  console.log('Create quality gate')
}

function edit(key: string) {
  console.log('Edit quality gate:', key)
}

async function remove(key: string) {
  try {
    await ElMessageBox.confirm('确定要删除该质量门吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    await del(`/api/qualitygates/destroy?id=${key}`)
    ElMessage.success('删除成功')
    loadQualityGates()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}
</script>

<style scoped>
.quality-gates {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
