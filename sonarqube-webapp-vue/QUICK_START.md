# 快速开始指南

## 启动项目

```bash
# 安装依赖
yarn install

# 启动开发服务器
yarn dev
```

项目将在 `http://localhost:3000` 启动。

## 功能演示

### 1. 问题管理

访问 `/issues` 查看问题列表，包含：
- 问题筛选（严重程度、状态、类型）
- 问题详情侧边栏（评论、历史、操作）
- 批量操作

**测试数据：**
- 点击任意问题行的"查看"按钮打开详情侧边栏
- 尝试添加评论、分配问题、修改状态等操作

### 2. 项目概览

访问 `/project/my-project` 查看项目概览，包含：
- 度量指标卡片（问题总数、覆盖率、重复率、安全热点）
- 问题趋势图（柱状图）
- 覆盖率趋势图（折线图）
- 质量门状态
- 最近活动

**可用项目 Key：**
- `my-project`
- `web-app`
- `api-service`

### 3. 项目创建

访问 `/projects/create` 创建新项目，包含：
- 手动创建表单（带完整验证）
- ALM 集成创建（GitHub、GitLab、Bitbucket、Azure DevOps）

**测试步骤：**
1. 选择"手动创建"
2. 输入项目名称（会自动生成 Key）
3. 选择可见性
4. 点击"创建项目"

### 4. 项目列表

访问 `/projects` 查看项目列表，包含：
- 项目搜索
- 项目筛选
- 项目卡片展示

## Mock 数据说明

所有功能都使用 Mock 数据，无需后端服务器即可运行。

Mock 数据包括：
- ✅ 3 个示例项目
- ✅ 4 个示例问题（包含评论和历史）
- ✅ 5 个示例用户
- ✅ 完整的度量数据
- ✅ 质量门数据
- ✅ 历史趋势数据

详细说明请查看 [MOCK_DATA_README.md](./MOCK_DATA_README.md)

## 注意事项

1. **数据持久化**：Mock 数据修改后仅在当前会话有效，刷新页面会重置
2. **网络延迟**：Mock 请求会模拟 200-500ms 的网络延迟
3. **开发环境**：Mock 数据仅在开发环境生效，生产环境会使用真实 API

## 常见问题

### Q: 如何禁用 Mock 数据？
A: 设置环境变量 `VITE_ENABLE_MOCK=false` 或修改 `src/libs/shared/utils/request.ts`

### Q: 如何修改 Mock 数据？
A: 编辑 `src/libs/shared/mocks/mockData.ts` 文件

### Q: 某些功能不工作？
A: 检查浏览器控制台是否有错误，确保 Mock 数据已正确配置

## 下一步

- 查看 [MOCK_DATA_README.md](./MOCK_DATA_README.md) 了解 Mock 数据详情
- 查看代码了解实现细节
- 根据需要扩展 Mock 数据
