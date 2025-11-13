<template>
  <div class="logout">
    <el-result icon="success" title="已退出登录" sub-title="正在跳转...">
      <template #extra>
        <el-button type="primary" @click="goToLogin">前往登录</el-button>
      </template>
    </el-result>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { postJSON } from '@/libs/shared/utils/request'

const router = useRouter()

onMounted(async () => {
  try {
    await postJSON('/api/authentication/logout')
    setTimeout(() => {
      router.push('/sessions/new')
    }, 2000)
  } catch (error) {
    router.push('/sessions/new')
  }
})

function goToLogin() {
  router.push('/sessions/new')
}
</script>

<style scoped>
.logout {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
}
</style>
