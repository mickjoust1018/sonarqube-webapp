<template>
  <div class="admin-container">
    <GlobalHeader />
    <div class="admin-content">
      <router-view />
    </div>
  </div>
</template>

<script setup lang="ts">
import GlobalHeader from '@/components/layout/GlobalHeader.vue'
</script>

<style scoped>
.admin-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.admin-content {
  flex: 1;
  overflow: auto;
  padding: 20px;
}
</style>
