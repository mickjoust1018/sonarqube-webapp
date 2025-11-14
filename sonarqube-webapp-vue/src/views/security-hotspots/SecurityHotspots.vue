<template>
  <div class="security-hotspots">
    <el-container>
      <el-header>
        <h2>安全热点</h2>
      </el-header>
      <el-main>
        <el-table :data="hotspots" v-loading="loading">
          <el-table-column prop="key" label="Key" />
          <el-table-column prop="message" label="消息" />
          <el-table-column prop="vulnerabilityProbability" label="漏洞概率" />
          <el-table-column prop="status" label="状态" />
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
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getJSON } from '@/libs/shared/utils/request'

const route = useRoute()

const hotspots = ref([])
const loading = ref(false)

onMounted(() => {
  loadHotspots()
})

async function loadHotspots() {
  loading.value = true
  try {
    const params: any = {}
    const projectKey = route.params.id || route.params.projectKey
    if (projectKey) {
      params.projectKey = projectKey as string
    }
    const data = await getJSON('/api/hotspots/search', params)
    hotspots.value = data.hotspots || []
  } catch (error) {
    ElMessage.error('加载安全热点列表失败')
  } finally {
    loading.value = false
  }
}

function view(key: string) {
  console.log('View hotspot:', key)
}
</script>

<style scoped>
.security-hotspots {
  padding: 20px;
}
</style>
