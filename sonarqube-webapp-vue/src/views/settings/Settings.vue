<template>
  <div class="settings">
    <el-container>
      <el-aside width="200px">
        <el-menu :default-active="activeMenu" @select="handleMenuSelect">
          <el-menu-item index="general">常规</el-menu-item>
          <el-menu-item index="security">安全</el-menu-item>
          <el-menu-item index="email">邮件</el-menu-item>
        </el-menu>
      </el-aside>
      <el-main>
        <el-card>
          <p>设置内容</p>
        </el-card>
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const activeMenu = ref('general')

function handleMenuSelect(key: string) {
  activeMenu.value = key
}
</script>

<style scoped>
.settings {
  padding: 20px;
}
</style>
