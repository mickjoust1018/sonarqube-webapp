<template>
  <div class="quality-profiles">
    <el-container>
      <el-header>
        <h2>质量配置</h2>
      </el-header>
      <el-main>
        <el-table :data="profiles" v-loading="loading">
          <el-table-column prop="name" label="名称" />
          <el-table-column prop="language" label="语言" />
          <el-table-column prop="isDefault" label="默认" />
          <el-table-column label="操作">
            <template #default="{ row }">
              <el-button link type="primary" @click="view(row.key)">查看</el-button>
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

const profiles = ref([])
const loading = ref(false)

onMounted(() => {
  loadProfiles()
})

async function loadProfiles() {
  loading.value = true
  try {
    const data = await getJSON('/api/qualityprofiles/search')
    profiles.value = data.profiles || []
  } catch (error) {
    ElMessage.error('加载质量配置列表失败')
  } finally {
    loading.value = false
  }
}

function view(key: string) {
  console.log('View profile:', key)
}
</script>

<style scoped>
.quality-profiles {
  padding: 20px;
}
</style>
