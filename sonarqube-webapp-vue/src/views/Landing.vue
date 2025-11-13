<template>
  <div class="landing">
    <el-container>
      <el-main>
        <div class="landing-content">
          <h1>欢迎使用 SonarQube</h1>
          <p>代码质量管理和持续集成平台</p>
          <div class="action-buttons">
            <el-button type="primary" size="large" @click="goToProjects">
              <el-icon><Folder /></el-icon>
              查看项目
            </el-button>
            <el-button type="success" size="large" @click="goToFeatureDemo">
              <el-icon><Star /></el-icon>
              功能演示
            </el-button>
            <el-button type="info" size="large" @click="goToCreateProject">
              <el-icon><Plus /></el-icon>
              创建项目
            </el-button>
          </div>
          <div class="quick-links">
            <h3>快速访问</h3>
            <el-space wrap>
              <el-link type="primary" @click="goToIssues">问题管理</el-link>
              <el-link type="primary" @click="goToProjectOverview">项目概览</el-link>
              <el-link type="primary" @click="goToCode">代码查看</el-link>
              <el-link type="primary" @click="goToBranches">分支管理</el-link>
            </el-space>
          </div>
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Folder, Star, Plus } from '@element-plus/icons-vue'

const router = useRouter()

function goToProjects() {
  router.push('/projects')
}

function goToFeatureDemo() {
  router.push('/feature-demo')
}

function goToCreateProject() {
  router.push('/projects/create')
}

function goToIssues() {
  router.push('/issues')
}

function goToProjectOverview() {
  router.push('/project/my-project')
}

function goToCode() {
  router.push('/project/my-project/code')
}

function goToBranches() {
  router.push('/project/my-project/branches')
}
</script>

<style scoped>
.landing {
  height: 100%;
}

.landing-content {
  text-align: center;
  padding: 100px 20px;
}

.landing-content h1 {
  font-size: 48px;
  margin-bottom: 20px;
  color: #303133;
}

.landing-content p {
  font-size: 20px;
  color: #909399;
  margin-bottom: 40px;
}

.action-buttons {
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-bottom: 40px;
}

.quick-links {
  margin-top: 40px;
  padding-top: 40px;
  border-top: 1px solid #e4e7ed;
}

.quick-links h3 {
  margin: 0 0 16px 0;
  color: #606266;
  font-size: 16px;
}
</style>
