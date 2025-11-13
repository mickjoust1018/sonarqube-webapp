# Mock 数据使用说明

本项目已集成完整的 Mock 数据系统，可以在没有后端服务器的情况下预览所有功能。

## 功能特性

- ✅ 自动拦截 API 请求并返回 Mock 数据
- ✅ 模拟网络延迟（200-500ms）
- ✅ 支持数据修改（评论、分配、状态转换等）
- ✅ 完整的测试数据覆盖

## 启用方式

Mock 数据在开发环境下**默认自动启用**。如果需要禁用，可以：

1. 设置环境变量 `VITE_ENABLE_MOCK=false`
2. 或者在 `src/libs/shared/utils/request.ts` 中修改 `ENABLE_MOCK` 常量

## Mock 数据覆盖的 API

### 用户相关
- `GET /api/users/search` - 搜索用户
- `GET /api/users/current` - 获取当前用户

### 项目相关
- `GET /api/projects/search` - 搜索项目
- `POST /api/projects/create` - 创建项目

### 问题相关
- `GET /api/issues/search` - 搜索问题
- `GET /api/issues/list` - 列出问题
- `GET /api/issues/changelog` - 获取问题变更历史
- `POST /api/issues/add_comment` - 添加评论
- `POST /api/issues/delete_comment` - 删除评论
- `POST /api/issues/edit_comment` - 编辑评论
- `POST /api/issues/assign` - 分配问题
- `POST /api/issues/set_severity` - 设置严重程度
- `POST /api/issues/set_type` - 设置类型
- `POST /api/issues/do_transition` - 状态转换

### 度量相关
- `GET /api/measures/component` - 获取组件度量
- `GET /api/measures/search_history` - 获取历史度量数据

### 质量门相关
- `GET /api/qualitygates/project_status` - 获取项目质量门状态

### 项目活动相关
- `GET /api/project_analyses/search` - 搜索项目分析

### ALM 集成相关
- `GET /api/alm_settings/list` - 列出 ALM 设置
- `GET /api/alm_settings/{key}/repositories` - 获取仓库列表

## 测试数据说明

### 项目数据
- `my-project` - 我的项目（私有）
- `web-app` - Web 应用（公开）
- `api-service` - API 服务（私有）

### 问题数据
包含 4 个示例问题：
- `AX123456789` - 代码复杂度问题（MAJOR，已分配，有评论）
- `AX987654321` - 空指针问题（CRITICAL，已确认）
- `AX111222333` - HTTP 连接问题（MINOR，已解决）
- `AX444555666` - XSS 漏洞（BLOCKER，安全漏洞）

### 用户数据
包含 5 个示例用户：
- `admin` - 管理员
- `john.doe` - John Doe
- `jane.smith` - Jane Smith
- `bob.wilson` - Bob Wilson
- `alice.brown` - Alice Brown

## 数据修改说明

Mock 数据支持修改操作，修改后的数据会保存在内存中，刷新页面后会重置。

支持的操作：
- ✅ 添加/编辑/删除评论
- ✅ 分配/取消分配问题
- ✅ 修改问题严重程度
- ✅ 修改问题类型
- ✅ 状态转换
- ✅ 创建新项目

## 查看效果

1. 启动开发服务器：
```bash
npm run dev
# 或
yarn dev
```

2. 访问以下页面查看效果：
   - `/issues` - 问题列表
   - `/projects` - 项目列表
   - `/project/my-project` - 项目概览（使用 `my-project` 作为示例）
   - `/projects/create` - 创建项目

3. 测试功能：
   - 在问题列表中点击"查看"打开问题详情侧边栏
   - 尝试添加评论、分配问题、修改状态等
   - 查看项目概览页面的图表和数据
   - 尝试创建新项目

## 自定义 Mock 数据

如果需要修改 Mock 数据，请编辑 `src/libs/shared/mocks/mockData.ts` 文件。

## 注意事项

1. Mock 数据仅在开发环境生效
2. 刷新页面后，修改的数据会重置
3. 某些复杂查询可能不完全支持，但基本功能都已覆盖
4. 如果遇到 API 请求失败，请检查控制台是否有错误信息
