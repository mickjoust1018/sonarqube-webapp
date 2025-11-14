<template>
  <!-- 暂时移除所有跳转链接，避免布局问题 -->
  <div class="a11y-skip-links" style="display: none"></div>
</template>

<script setup lang="ts"></script>

<style scoped>
.a11y-skip-links {
  position: absolute;
  top: -100px;
  left: 0;
  z-index: 10000;
}

.skip-link {
  position: absolute;
  top: 0;
  left: 0;
  padding: 8px 16px;
  background-color: #000;
  color: #fff;
  text-decoration: none;
  z-index: 10001;
}

.skip-link:focus {
  top: 0;
  position: absolute;
}
</style>
