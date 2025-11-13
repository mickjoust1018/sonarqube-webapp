<template>
  <router-view />
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useAppStore } from '@/stores/app'
import { initAppVariables } from '@/libs/shared/utils/browser'

const appStore = useAppStore()

onMounted(async () => {
  initAppVariables()
  await appStore.initApp()
})
</script>

<style>
#app {
  width: 100%;
  height: 100%;
}
</style>
