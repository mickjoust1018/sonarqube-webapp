<template>
  <div class="component-measures">
    <el-container>
      <el-header>
        <h2>组件度量</h2>
      </el-header>
      <el-main>
        <el-card>
          <div class="measures-grid">
            <el-statistic title="代码行数" :value="measures.lines" />
            <el-statistic title="覆盖率" :value="measures.coverage" suffix="%" />
            <el-statistic title="重复率" :value="measures.duplications" suffix="%" />
          </div>
        </el-card>
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

const measures = ref({
  lines: 0,
  coverage: 0,
  duplications: 0,
})

onMounted(() => {
  loadMeasures()
})

async function loadMeasures() {
  try {
    const component = route.query.component as string
    if (!component) return

    const data = await getJSON('/api/measures/component', { component })
    measures.value = {
      lines: data.component?.measures?.find((m: any) => m.metric === 'lines')?.value || 0,
      coverage: data.component?.measures?.find((m: any) => m.metric === 'coverage')?.value || 0,
      duplications:
        data.component?.measures?.find((m: any) => m.metric === 'duplicated_lines_density')
          ?.value || 0,
    }
  } catch (error) {
    ElMessage.error('加载度量数据失败')
  }
}
</script>

<style scoped>
.component-measures {
  padding: 20px;
}

.measures-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}
</style>
