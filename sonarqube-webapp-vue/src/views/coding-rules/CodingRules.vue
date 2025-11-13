<template>
  <div class="coding-rules">
    <el-container>
      <el-header>
        <h2>编码规则</h2>
      </el-header>
      <el-main>
        <el-table :data="rules" v-loading="loading">
          <el-table-column prop="name" label="规则名称" />
          <el-table-column prop="key" label="规则 Key" />
          <el-table-column prop="severity" label="严重程度" />
          <el-table-column prop="status" label="状态" />
          <el-table-column label="操作">
            <template #default="{ row }">
              <el-button link type="primary" @click="viewRule(row.key)">查看</el-button>
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

const rules = ref([])
const loading = ref(false)

onMounted(() => {
  loadRules()
})

async function loadRules() {
  loading.value = true
  try {
    const data = await getJSON('/api/rules/search')
    rules.value = data.rules || []
  } catch (error) {
    ElMessage.error('加载规则列表失败')
  } finally {
    loading.value = false
  }
}

function viewRule(key: string) {
  console.log('View rule:', key)
}
</script>

<style scoped>
.coding-rules {
  padding: 20px;
}
</style>
