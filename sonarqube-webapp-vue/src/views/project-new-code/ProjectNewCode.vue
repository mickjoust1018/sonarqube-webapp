<template>
  <div class="project-new-code">
    <el-container>
      <el-header>
        <h2>新代码定义 - {{ projectKey }}</h2>
      </el-header>
      <el-main>
        <el-card>
          <p>新代码定义内容</p>
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
.project-new-code {
  padding: 20px;
}
</style>
