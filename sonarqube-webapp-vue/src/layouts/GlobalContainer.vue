<template>
  <div class="global-container">
    <GlobalHeader />
    <div class="main-content">
      <router-view />
    </div>
    <GlobalFooter />
  </div>
</template>

<script setup lang="ts">
import GlobalHeader from '@/components/layout/GlobalHeader.vue'
import GlobalFooter from '@/components/layout/GlobalFooter.vue'
</script>

<style scoped>
.global-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.main-content {
  flex: 1;
  overflow: auto;
}
</style>
