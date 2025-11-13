<template>
  <div class="project-deletion">
    <el-container>
      <el-header>
        <h2>删除项目 - {{ projectKey }}</h2>
      </el-header>
      <el-main>
        <el-card>
          <p>删除项目内容</p>
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
.project-deletion {
  padding: 20px;
}
</style>
