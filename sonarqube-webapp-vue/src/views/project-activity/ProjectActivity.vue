<template>
  <div class="project-activity">
    <el-container>
      <el-header>
        <h2>项目活动 - {{ projectKey }}</h2>
      </el-header>
      <el-main>
        <el-card>
          <p>项目活动内容</p>
        </el-card>
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const projectKey = computed(() => (route.params.id || route.params.projectKey) as string)
</script>

<style scoped>
.project-activity {
  padding: 20px;
}
</style>
