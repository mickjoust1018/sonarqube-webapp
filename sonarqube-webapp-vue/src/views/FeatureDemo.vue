<template>
  <div class="feature-demo">
    <el-container>
      <el-header>
        <h1>功能演示</h1>
        <p>以下是已完成的功能，点击卡片可快速访问</p>
      </el-header>
      <el-main>
        <el-row :gutter="20">
          <!-- 问题管理 -->
          <el-col :xs="24" :sm="12" :md="8" :lg="6">
            <el-card class="feature-card" shadow="hover" @click="goToIssues">
              <template #header>
                <div class="card-header">
                  <el-icon :size="32" color="#e6a23c"><Warning /></el-icon>
                  <h3>问题管理</h3>
                </div>
              </template>
              <ul class="feature-list">
                <li>✅ 问题列表和筛选</li>
                <li>✅ 问题详情侧边栏</li>
                <li>✅ 评论功能</li>
                <li>✅ 历史记录</li>
                <li>✅ 批量操作</li>
                <li>✅ 问题分配</li>
                <li>✅ 状态转换</li>
              </ul>
              <el-button type="primary" style="width: 100%; margin-top: 12px"> 查看问题 </el-button>
            </el-card>
          </el-col>

          <!-- 项目概览 -->
          <el-col :xs="24" :sm="12" :md="8" :lg="6">
            <el-card class="feature-card" shadow="hover" @click="goToProjectOverview">
              <template #header>
                <div class="card-header">
                  <el-icon :size="32" color="#409eff"><TrendCharts /></el-icon>
                  <h3>项目概览</h3>
                </div>
              </template>
              <ul class="feature-list">
                <li>✅ 度量指标卡片</li>
                <li>✅ 问题趋势图</li>
                <li>✅ 覆盖率趋势图</li>
                <li>✅ 质量门状态</li>
                <li>✅ 最近活动</li>
              </ul>
              <el-button type="primary" style="width: 100%; margin-top: 12px"> 查看概览 </el-button>
            </el-card>
          </el-col>

          <!-- 代码查看 -->
          <el-col :xs="24" :sm="12" :md="8" :lg="6">
            <el-card class="feature-card" shadow="hover" @click="goToCode">
              <template #header>
                <div class="card-header">
                  <el-icon :size="32" color="#67c23a"><Document /></el-icon>
                  <h3>代码查看</h3>
                </div>
              </template>
              <ul class="feature-list">
                <li>✅ 文件树导航</li>
                <li>✅ 行号显示</li>
                <li>✅ 问题标记</li>
                <li>✅ 代码度量</li>
                <li>✅ 分支切换</li>
                <li>✅ 代码高亮</li>
              </ul>
              <el-button type="primary" style="width: 100%; margin-top: 12px"> 查看代码 </el-button>
            </el-card>
          </el-col>

          <!-- 分支管理 -->
          <el-col :xs="24" :sm="12" :md="8" :lg="6">
            <el-card class="feature-card" shadow="hover" @click="goToBranches">
              <template #header>
                <div class="card-header">
                  <el-icon :size="32" color="#f56c6c"><Connection /></el-icon>
                  <h3>分支管理</h3>
                </div>
              </template>
              <ul class="feature-list">
                <li>✅ 分支列表</li>
                <li>✅ 分支创建</li>
                <li>✅ 分支删除</li>
                <li>✅ 设为主分支</li>
                <li>✅ 保护/取消保护</li>
              </ul>
              <el-button type="primary" style="width: 100%; margin-top: 12px"> 管理分支 </el-button>
            </el-card>
          </el-col>

          <!-- 项目创建 -->
          <el-col :xs="24" :sm="12" :md="8" :lg="6">
            <el-card class="feature-card" shadow="hover" @click="goToCreateProject">
              <template #header>
                <div class="card-header">
                  <el-icon :size="32" color="#909399"><Plus /></el-icon>
                  <h3>项目创建</h3>
                </div>
              </template>
              <ul class="feature-list">
                <li>✅ 手动创建</li>
                <li>✅ 表单验证</li>
                <li>✅ Key自动生成</li>
                <li>✅ ALM集成占位</li>
              </ul>
              <el-button type="primary" style="width: 100%; margin-top: 12px"> 创建项目 </el-button>
            </el-card>
          </el-col>

          <!-- 项目管理 -->
          <el-col :xs="24" :sm="12" :md="8" :lg="6">
            <el-card class="feature-card" shadow="hover" @click="goToProjects">
              <template #header>
                <div class="card-header">
                  <el-icon :size="32" color="#606266"><Folder /></el-icon>
                  <h3>项目管理</h3>
                </div>
              </template>
              <ul class="feature-list">
                <li>✅ 项目列表</li>
                <li>✅ 项目搜索</li>
                <li>✅ 项目筛选</li>
                <li>✅ 项目详情</li>
              </ul>
              <el-button type="primary" style="width: 100%; margin-top: 12px"> 查看项目 </el-button>
            </el-card>
          </el-col>
        </el-row>

        <!-- 测试数据说明 -->
        <el-card class="info-card" style="margin-top: 30px">
          <template #header>
            <h3>📊 测试数据说明</h3>
          </template>
          <el-alert type="info" :closable="false" show-icon style="margin-bottom: 20px">
            <p>所有功能都配置了完整的 Mock 测试数据，包括：</p>
            <ul style="margin: 10px 0; padding-left: 20px">
              <li>项目数据（my-project, web-app, api-service）</li>
              <li>问题数据（含评论和历史记录）</li>
              <li>分支数据（main, develop, feature/new-feature）</li>
              <li>文件树和源代码数据</li>
              <li>度量数据和历史数据</li>
              <li>质量门和活动数据</li>
            </ul>
            <p><strong>建议访问路径：</strong></p>
            <ol style="margin: 10px 0; padding-left: 20px">
              <li>从"项目管理"开始，查看项目列表</li>
              <li>点击项目名称进入"项目概览"</li>
              <li>在概览页面使用快速导航访问各个功能</li>
            </ol>
          </el-alert>
        </el-card>
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Warning, TrendCharts, Document, Connection, Plus, Folder } from '@element-plus/icons-vue'

const router = useRouter()

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

function goToCreateProject() {
  router.push('/projects/create')
}

function goToProjects() {
  router.push('/projects')
}
</script>

<style scoped>
.feature-demo {
  padding: 20px;
  min-height: 100vh;
  background: #f5f7fa;
}

.feature-demo h1 {
  margin: 0 0 10px 0;
  color: #303133;
}

.feature-demo p {
  margin: 0;
  color: #909399;
}

.feature-card {
  margin-bottom: 20px;
  cursor: pointer;
  transition: transform 0.2s;
  height: 100%;
}

.feature-card:hover {
  transform: translateY(-4px);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.card-header h3 {
  margin: 0;
  font-size: 18px;
}

.feature-list {
  list-style: none;
  padding: 0;
  margin: 0;
  min-height: 150px;
}

.feature-list li {
  padding: 6px 0;
  color: #606266;
  font-size: 14px;
}

.info-card {
  background: #fff;
}
</style>
