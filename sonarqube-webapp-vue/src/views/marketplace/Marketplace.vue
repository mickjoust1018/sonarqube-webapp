<template>
  <div class="marketplace">
    <el-container>
      <el-header>
        <h2>市场</h2>
      </el-header>
      <el-main>
        <el-table :data="plugins" v-loading="loading">
          <el-table-column prop="name" label="插件名称" />
          <el-table-column prop="description" label="描述" />
          <el-table-column prop="version" label="版本" />
          <el-table-column label="操作">
            <template #default="{ row }">
              <el-button link type="primary" @click="install(row.key)">安装</el-button>
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

const plugins = ref([])
const loading = ref(false)

onMounted(() => {
  loadPlugins()
})

async function loadPlugins() {
  loading.value = true
  try {
    const data = await getJSON('/api/plugins/available')
    plugins.value = data.plugins || []
  } catch (error) {
    ElMessage.error('加载插件列表失败')
  } finally {
    loading.value = false
  }
}

function install(key: string) {
  console.log('Install plugin:', key)
}
</script>

<style scoped>
.marketplace {
  padding: 20px;
}
</style>
