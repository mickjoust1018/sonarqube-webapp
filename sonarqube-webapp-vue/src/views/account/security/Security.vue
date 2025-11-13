<template>
  <div class="security">
    <el-card>
      <template #header>
        <h3>安全设置</h3>
      </template>
      <el-form :model="form" label-width="120px">
        <el-form-item label="当前密码">
          <el-input v-model="form.currentPassword" type="password" show-password />
        </el-form-item>
        <el-form-item label="新密码">
          <el-input v-model="form.newPassword" type="password" show-password />
        </el-form-item>
        <el-form-item label="确认密码">
          <el-input v-model="form.confirmPassword" type="password" show-password />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="changePassword">修改密码</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { postJSON } from '@/libs/shared/utils/request'

const form = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

async function changePassword() {
  if (form.newPassword !== form.confirmPassword) {
    ElMessage.error('两次输入的密码不一致')
    return
  }
  try {
    await postJSON('/api/users/change_password', {
      password: form.currentPassword,
      newPassword: form.newPassword,
    })
    ElMessage.success('密码修改成功')
    form.currentPassword = ''
    form.newPassword = ''
    form.confirmPassword = ''
  } catch (error) {
    ElMessage.error('密码修改失败')
  }
}
</script>

<style scoped>
.security {
  padding: 20px;
}
</style>
