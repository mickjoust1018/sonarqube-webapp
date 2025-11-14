<template>
  <div class="workspace">
    <slot />
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
.workspace {
  width: 100%;
  min-height: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
}
</style>
