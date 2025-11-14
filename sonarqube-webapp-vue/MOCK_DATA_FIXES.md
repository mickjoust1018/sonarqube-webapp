# Mock 数据修复说明

## 问题描述

用户反馈演示项目里要么报错，要么是空的，没有演示数据。

## 修复内容

### 1. 项目搜索 API 增强

**问题：** 项目搜索 API 只支持 `q` 参数，但实际代码中使用的是 `search` 参数。

**修复：**

- 支持 `q` 和 `search` 两种参数
- 添加了类型过滤（qualifiers）
- 添加了标签过滤（tags）
- 添加了收藏过滤（filter=isFavorite）
- 实现了正确的分页逻辑

### 2. 添加缺失的 API Mock 处理

**新增的 API Mock：**

- `/api/projects/delete` - 删除项目
- `/api/projects/update_visibility` - 更新项目可见性
- `/api/projects/update_key` - 更新项目 Key
- `/api/project_tags/search` - 搜索项目标签
- `/api/project_tags/set` - 设置项目标签
- `/api/project_tags/remove` - 移除项目标签
- `/api/favorites/add` - 添加收藏
- `/api/favorites/remove` - 移除收藏
- `/api/issues/bulk_change` - 批量操作问题
- `/api/issue_filters/search` - 搜索问题过滤器

### 3. 增强项目 Mock 数据

**改进：**

- 为每个项目添加了标签（tags）
- 为每个项目添加了描述（description）
- 项目数据更加丰富和真实

**示例项目：**

- `my-project` - Java 后端项目（标签：java, backend, spring）
- `web-app` - Vue.js 前端应用（标签：javascript, frontend, vue）
- `api-service` - RESTful API 服务（标签：api, rest, microservice）

### 4. 批量操作 API 实现

**功能：**

- 批量分配问题
- 批量状态转换
- 批量设置严重程度
- 批量设置类型
- 批量添加/移除标签
- 批量添加评论

### 5. 增强 Landing 页面

**改进：**

- 添加了演示数据说明卡片
- 清晰展示可用的演示数据
- 提供访问路径建议

## 测试建议

### 1. 项目列表页面

访问 `/projects`，应该能看到 3 个示例项目：

- My Project
- Web Application
- API Service

### 2. 项目搜索

- 搜索 "my" 应该能找到 "My Project"
- 搜索 "web" 应该能找到 "Web Application"
- 使用类型过滤应该能正确筛选
- 使用标签过滤应该能正确筛选

### 3. 项目操作

- 收藏/取消收藏项目应该能正常工作
- 删除项目应该能正常工作（注意：删除后需要刷新页面才能看到效果）

### 4. 问题管理

访问 `/issues`，应该能看到多个问题，包括：

- 不同严重程度的问题
- 不同状态的问题
- 包含评论的问题
- 包含标签的问题

### 5. 批量操作

- 选择多个问题
- 点击"批量操作"
- 执行各种批量操作（分配、状态转换、设置严重程度等）

### 6. 项目概览

访问 `/project/my-project`，应该能看到：

- 度量指标卡片（问题总数、覆盖率、重复率等）
- 图表（问题趋势、覆盖率趋势等）
- 分支概览
- 质量门状态
- 最近活动

## 技术细节

### Mock 数据拦截机制

Mock 数据通过 `request.ts` 中的拦截器实现：

- 在开发环境下自动启用（除非设置 `VITE_ENABLE_MOCK=false`）
- 拦截所有 API 请求
- 如果 URL 匹配，返回 mock 数据
- 如果不匹配，转发到真实后端

### Mock 数据位置

- `src/libs/shared/mocks/mockData.ts` - Mock 数据定义
- `src/libs/shared/mocks/mockInterceptor.ts` - Mock 数据拦截逻辑

## 注意事项

1. **Mock 数据是内存中的**：刷新页面后，通过 API 修改的数据会重置
2. **开发环境专用**：Mock 数据只在开发环境启用
3. **网络错误**：如果看到网络错误，检查浏览器控制台，确认 Mock 拦截器是否正常工作

## 下一步

如果仍然遇到问题，请检查：

1. 浏览器控制台是否有错误信息
2. Network 标签页中 API 请求是否被正确拦截
3. Mock 拦截器是否返回了正确的数据格式
