<template>
  <div class="global-header" :class="{ 'with-shadow': hasShadow }">
    <div class="header-content">
      <div class="logo">
        <router-link to="/">
          <span>SonarQube</span>
        </router-link>
      </div>
      <GlobalNavMenu />
      <div class="header-actions">
        <GlobalSearch />
        <GlobalNavUser />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import GlobalNavMenu from '@/components/nav/GlobalNavMenu.vue'
import GlobalNavUser from '@/components/nav/GlobalNavUser.vue'
import GlobalSearch from '@/components/global-search/GlobalSearch.vue'
import { throttle } from 'lodash-es'

const hasShadow = ref(false)

function handleScroll() {
  hasShadow.value = document.documentElement.scrollTop > 0
}

const throttledHandleScroll = throttle(handleScroll, 100)

onMounted(() => {
  document.addEventListener('scroll', throttledHandleScroll)
  handleScroll() // 初始检查
})

onUnmounted(() => {
  document.removeEventListener('scroll', throttledHandleScroll)
  throttledHandleScroll.cancel()
})
</script>

<style scoped>
.global-header {
  height: 60px;
  background-color: #fff;
  border-bottom: 1px solid #e4e7ed;
  padding: 0;
  flex-shrink: 0;
  position: sticky;
  top: 0;
  z-index: 1000;
  transition: box-shadow 0.2s;
}

.global-header.with-shadow {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.header-content {
  display: flex;
  align-items: center;
  height: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
}

.logo {
  margin-right: 40px;
}

.logo a {
  text-decoration: none;
  color: #303133;
  font-size: 20px;
  font-weight: bold;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-left: auto;
}
</style>
