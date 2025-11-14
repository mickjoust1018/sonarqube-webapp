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

          <!-- 演示数据说明 -->
          <el-card class="demo-data-card" shadow="never">
            <template #header>
              <div class="card-header">
                <el-icon :size="20" color="#409eff"><InfoFilled /></el-icon>
                <span>演示数据说明</span>
              </div>
            </template>
            <el-alert type="success" :closable="false" show-icon>
              <p><strong>所有功能都配置了完整的 Mock 测试数据，可以直接体验：</strong></p>
              <ul class="demo-data-list">
                <li><strong>项目数据：</strong>my-project、web-app、api-service（3个示例项目）</li>
                <li><strong>问题数据：</strong>包含评论、历史记录、标签的完整问题数据</li>
                <li><strong>分支数据：</strong>main、develop、feature/new-feature 等分支</li>
                <li><strong>代码数据：</strong>文件树和源代码数据，支持代码高亮</li>
                <li><strong>度量数据：</strong>覆盖率、重复率、问题趋势等历史数据</li>
                <li><strong>质量门数据：</strong>质量门状态和条件数据</li>
              </ul>
              <p style="margin-top: 12px">
                <strong>建议访问路径：</strong>点击"查看项目" → 选择项目 → 查看项目概览 →
                使用快速导航访问各个功能
              </p>
            </el-alert>
          </el-card>
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Folder, Star, Plus, InfoFilled } from '@element-plus/icons-vue'

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

.demo-data-card {
  margin-top: 40px;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
}

.demo-data-list {
  margin: 12px 0;
  padding-left: 20px;
  line-height: 1.8;
}

.demo-data-list li {
  margin: 4px 0;
}
</style>
