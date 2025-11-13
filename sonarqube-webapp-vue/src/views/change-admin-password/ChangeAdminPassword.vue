<template>
  <div class="change-admin-password">
    <el-container>
      <el-main>
        <el-card>
          <template #header>
            <h3>更改管理员密码</h3>
          </template>
          <el-form :model="form" label-width="120px">
            <el-form-item label="新密码">
              <el-input v-model="form.password" type="password" show-password />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="changePassword">更改密码</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { postJSON } from '@/libs/shared/utils/request'

const form = reactive({
  password: '',
})

async function changePassword() {
  try {
    await postJSON('/api/users/change_password', form)
    ElMessage.success('密码更改成功')
  } catch (error) {
    ElMessage.error('密码更改失败')
  }
}
</script>

<style scoped>
.change-admin-password {
  padding: 20px;
}
</style>
