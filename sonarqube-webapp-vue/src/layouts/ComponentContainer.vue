<template>
  <div class="component-container">
    <GlobalHeader />
    <div class="component-content">
      <router-view />
    </div>
  </div>
</template>

<script setup lang="ts">
import GlobalHeader from '@/components/layout/GlobalHeader.vue'
</script>

<style scoped>
.component-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.component-content {
  flex: 1;
  overflow: auto;
}
</style>
