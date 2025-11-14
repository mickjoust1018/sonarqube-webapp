# Mock 数据覆盖报告

## 概述

本文档列出了所有已实现功能的 API 调用及其 mock 数据覆盖情况。所有功能都使用 mock 数据，不会调用真实的后端 API，避免网络错误。

## API Mock 覆盖清单

### ✅ 用户相关 API

- [x] `/api/users/search` - 用户搜索
- [x] `/api/users/current` - 当前用户信息

**Mock 数据位置**: `src/libs/shared/mocks/mockData.ts` - `mockUsers`

---

### ✅ 项目相关 API

- [x] `/api/projects/search` - 项目搜索
- [x] `/api/projects/create` - 项目创建

**Mock 数据位置**: `src/libs/shared/mocks/mockData.ts` - `mockProjects`

---

### ✅ 问题相关 API

- [x] `/api/issues/search` - 问题搜索
- [x] `/api/issues/list` - 问题列表
- [x] `/api/issues/changelog` - 问题变更历史
- [x] `/api/issues/add_comment` - 添加评论
- [x] `/api/issues/delete_comment` - 删除评论
- [x] `/api/issues/edit_comment` - 编辑评论
- [x] `/api/issues/assign` - 分配问题
- [x] `/api/issues/set_severity` - 设置严重程度
- [x] `/api/issues/set_type` - 设置类型
- [x] `/api/issues/do_transition` - 状态转换
- [x] `/api/issues/bulk_change` - 批量操作
- [x] `/api/issues/flow` - 问题流数据 ✅ **新增**
- [x] `/api/issues/tags` - 标签搜索 ✅ **新增**
- [x] `/api/issues/set_tags` - 设置标签 ✅ **新增**

**Mock 数据位置**:

- `src/libs/shared/mocks/mockData.ts` - `mockIssues`, `mockChangelog`, `mockIssueFlows`
- 问题标签数据已集成到 `mockIssues` 中

---

### ✅ 度量相关 API

- [x] `/api/measures/component` - 组件度量
- [x] `/api/measures/component_tree` - 组件树
- [x] `/api/measures/search_history` - 历史数据（支持动态天数）✅ **增强**

**Mock 数据位置**:

- `src/libs/shared/mocks/mockData.ts` - `mockMeasures`, `mockHistoryData`
- 支持动态生成历史数据（7天、30天、90天、1年）
- 支持多种指标：issues, coverage, duplicated_lines_density, bugs

---

### ✅ 质量门相关 API

- [x] `/api/qualitygates/project_status` - 质量门状态

**Mock 数据位置**: `src/libs/shared/mocks/mockData.ts` - `mockQualityGates`

---

### ✅ 项目活动相关 API

- [x] `/api/project_analyses/search` - 项目分析历史

**Mock 数据位置**: `src/libs/shared/mocks/mockData.ts` - `mockActivities`

---

### ✅ ALM 设置相关 API

- [x] `/api/alm_settings/list` - ALM 设置列表
- [x] `/api/alm_settings/{key}/repositories` - 仓库列表

**Mock 数据位置**: `src/libs/shared/mocks/mockData.ts` - `mockAlmSettings`, `mockRepositories`

---

### ✅ 分支相关 API

- [x] `/api/project_branches/list` - 分支列表
- [x] `/api/project_branches/delete` - 删除分支
- [x] `/api/project_branches/set_automatic_deletion_protection` - 设置分支保护
- [x] `/api/project_branches/set_main` - 设置主分支

**Mock 数据位置**: `src/libs/shared/mocks/mockData.ts` - `mockBranches`

---

### ✅ 组件树相关 API

- [x] `/api/measures/component_tree` - 组件树
- [x] `/api/components/show` - 组件详情
- [x] `/api/components/app` - 组件应用数据

**Mock 数据位置**: `src/libs/shared/mocks/mockData.ts` - `mockComponentTree`

---

### ✅ 源代码相关 API

- [x] `/api/sources/lines` - 源代码行数据

**Mock 数据位置**: `src/libs/shared/mocks/mockData.ts` - `mockSources`

---

### ✅ 规则相关 API

- [x] `/api/rules/show` - 规则详情

**Mock 数据位置**: `src/libs/shared/mocks/mockData.ts` - `mockRuleDetails`

---

## 功能实现与 Mock 数据对应表

| 功能模块 | 实现状态 | Mock 数据覆盖 | 说明                                       |
| -------- | -------- | ------------- | ------------------------------------------ |
| 问题管理 | ✅ 100%  | ✅ 完整       | 包括问题流、代码上下文、规则详情、标签管理 |
| 项目概览 | ✅ 100%  | ✅ 完整       | 包括分支概览、多种图表类型、时间范围选择   |
| 代码查看 | ✅ 100%  | ✅ 完整       | 包括代码搜索、键盘导航                     |
| 分支管理 | ✅ 100%  | ✅ 完整       | 列表、创建、删除、设置                     |
| 项目创建 | ✅ 100%  | ✅ 完整       | 手动创建、ALM集成占位                      |
| 项目管理 | ✅ 100%  | ✅ 完整       | 列表、搜索、筛选                           |

## Mock 数据特点

1. **动态生成**: 历史数据支持动态天数（7天、30天、90天、1年）
2. **多项目支持**: 支持 my-project、web-app、api-service 三个项目
3. **完整数据**: 包含评论、历史记录、标签等完整数据
4. **实时更新**: Mock 数据支持增删改操作，会实时更新

## 使用说明

所有 API 调用都会自动使用 mock 数据（在开发环境下），无需额外配置。Mock 数据拦截器位于：

- `src/libs/shared/mocks/mockInterceptor.ts`

如果需要禁用 mock 数据，可以设置环境变量：

```bash
VITE_ENABLE_MOCK=false yarn dev
```

## 测试建议

1. **问题管理**: 访问 `/issues` 或 `/project/my-project/issues`
2. **项目概览**: 访问 `/project/my-project`
3. **代码查看**: 访问 `/project/my-project/code`
4. **分支管理**: 访问 `/project/my-project/branches`

所有功能都可以正常使用，不会出现网络错误。
