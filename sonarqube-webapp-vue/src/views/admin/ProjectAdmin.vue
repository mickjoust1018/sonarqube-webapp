<template>
  <div class="project-admin">
    <el-container>
      <el-header>
        <h2>项目管理 - {{ projectKey }}</h2>
      </el-header>
      <el-main>
        <el-card>
          <p>项目管理内容</p>
        </el-card>
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const projectKey = computed(() => route.params.projectKey as string)
</script>

<style scoped>
.project-admin {
  padding: 20px;
}
</style>
