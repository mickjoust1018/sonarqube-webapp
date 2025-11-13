<template>
  <div class="profile">
    <el-card>
      <template #header>
        <h3>个人资料</h3>
      </template>
      <el-form :model="form" label-width="120px">
        <el-form-item label="用户名">
          <el-input v-model="form.login" disabled />
        </el-form-item>
        <el-form-item label="姓名">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="form.email" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="save">保存</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useAppStore } from '@/stores/app'
import { postJSON } from '@/libs/shared/utils/request'

const appStore = useAppStore()

const form = reactive({
  login: '',
  name: '',
  email: '',
})

onMounted(() => {
  if (appStore.currentUser) {
    form.login = appStore.currentUser.login
    form.name = appStore.currentUser.name || ''
    form.email = appStore.currentUser.email || ''
  }
})

async function save() {
  try {
    await postJSON('/api/users/update', form)
    ElMessage.success('保存成功')
  } catch (error) {
    ElMessage.error('保存失败')
  }
}
</script>

<style scoped>
.profile {
  padding: 20px;
}
</style>
