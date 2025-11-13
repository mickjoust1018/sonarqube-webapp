<template>
  <div class="login-container">
    <el-card class="login-card">
      <template #header>
        <div class="card-header">
          <h2>登录 SonarQube</h2>
        </div>
      </template>
      <el-form :model="form" :rules="rules" ref="formRef" @submit.prevent="handleLogin">
        <el-form-item label="用户名" prop="login">
          <el-input v-model="form.login" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="请输入密码"
            show-password
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" native-type="submit" :loading="loading" style="width: 100%">
            登录
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { postJSON } from '@/libs/shared/utils/request'

const router = useRouter()
const formRef = ref()
const loading = ref(false)

const form = reactive({
  login: '',
  password: '',
})

const rules = {
  login: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
}

async function handleLogin() {
  if (!formRef.value) return

  await formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      loading.value = true
      try {
        await postJSON('/api/authentication/login', form)
        ElMessage.success('登录成功')
        router.push('/')
      } catch (error) {
        ElMessage.error('登录失败，请检查用户名和密码')
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

<style scoped>
.login-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #f5f7fa;
}

.login-card {
  width: 400px;
}

.card-header {
  text-align: center;
}

.card-header h2 {
  margin: 0;
  color: #303133;
}
</style>
