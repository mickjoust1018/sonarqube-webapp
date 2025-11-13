<template>
  <div class="notifications">
    <el-card>
      <template #header>
        <h3>通知设置</h3>
      </template>
      <el-form :model="form" label-width="200px">
        <el-form-item label="邮件通知">
          <el-switch v-model="form.emailNotifications" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="save">保存</el-button>
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
  emailNotifications: false,
})

async function save() {
  try {
    await postJSON('/api/notifications/add', form)
    ElMessage.success('保存成功')
  } catch (error) {
    ElMessage.error('保存失败')
  }
}
</script>

<style scoped>
.notifications {
  padding: 20px;
}
</style>
