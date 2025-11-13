<template>
  <div class="project-quality-gate">
    <el-container>
      <el-header>
        <h2>项目质量门 - {{ projectKey }}</h2>
      </el-header>
      <el-main>
        <el-card>
          <p>项目质量门内容</p>
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
.project-quality-gate {
  padding: 20px;
}
</style>
