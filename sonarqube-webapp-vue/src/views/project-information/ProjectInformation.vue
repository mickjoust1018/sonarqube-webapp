<template>
  <div class="project-information">
    <el-container>
      <el-header>
        <h2>项目信息 - {{ projectKey }}</h2>
      </el-header>
      <el-main>
        <el-card>
          <p>项目信息内容</p>
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
.project-information {
  padding: 20px;
}
</style>
