# SonarQube WebApp - Vue3 版本

这是 SonarQube WebApp 的 Vue3 + Element Plus + Vite 实现版本，完全参考原始 React 版本的架构和功能模块。

## 技术栈

- **Vue 3.5.13**: 渐进式 JavaScript 框架
- **TypeScript 5.6.3**: 类型系统
- **Element Plus 2.8.8**: Vue 3 UI 组件库
- **Vite 6.0.5**: 构建工具和开发服务器
- **Vue Router 4.5.0**: 路由管理
- **Pinia 2.2.6**: 状态管理
- **@tanstack/vue-query 5.56.2**: 服务端状态管理和数据获取
- **Vue I18n 10.0.4**: 国际化
- **Axios 1.12.0**: HTTP 客户端

## 项目结构

```
sonarqube-webapp-vue/
├── src/
│   ├── main.ts                 # 应用入口
│   ├── App.vue                 # 根组件
│   ├── router/                 # 路由配置
│   │   └── index.ts
│   ├── stores/                 # Pinia 状态管理
│   │   └── app.ts
│   ├── layouts/                # 布局组件
│   │   ├── GlobalContainer.vue
│   │   ├── AdminContainer.vue
│   │   ├── ComponentContainer.vue
│   │   └── SimpleContainer.vue
│   ├── components/             # 通用组件
│   │   └── layout/
│   │       ├── GlobalHeader.vue
│   │       └── GlobalFooter.vue
│   ├── views/                  # 页面视图
│   │   ├── account/           # 账户管理
│   │   ├── issues/             # 问题管理
│   │   ├── projects/           # 项目管理
│   │   ├── quality-gates/      # 质量门
│   │   ├── quality-profiles/   # 质量配置
│   │   ├── security-hotspots/  # 安全热点
│   │   ├── users/              # 用户管理
│   │   ├── groups/             # 组管理
│   │   ├── permissions/         # 权限管理
│   │   ├── settings/           # 设置
│   │   ├── system/             # 系统管理
│   │   ├── marketplace/        # 市场
│   │   ├── web-api/            # Web API
│   │   ├── webhooks/           # Webhooks
│   │   ├── background-tasks/   # 后台任务
│   │   ├── audit-logs/         # 审计日志
│   │   └── ...                 # 其他功能模块
│   ├── libs/                   # 共享库
│   │   ├── shared/             # 共享工具和组件
│   │   │   └── utils/
│   │   │       ├── request.ts  # HTTP 请求封装
│   │   │       ├── browser.ts  # 浏览器工具
│   │   │       ├── types.ts   # 类型定义
│   │   │       └── i18n.ts     # 国际化工具
│   │   └── commons/            # 业务共享库
│   │       ├── api/            # API 客户端
│   │       ├── types/          # 类型定义
│   │       └── components/     # 业务组件
│   └── styles/                 # 样式文件
│       └── main.css
├── package.json
├── vite.config.ts
├── tsconfig.json
└── README.md
```

## 功能模块

本项目包含以下所有功能模块（除 sq-cloud 外）：

1. **账户管理** (`/account`)
   - 个人资料
   - 安全设置
   - 项目列表
   - 通知设置

2. **问题管理** (`/issues`, `/project/:projectKey/issues`)
   - 问题列表和搜索
   - 问题详情
   - 问题操作

3. **代码查看** (`/code`)
   - 源代码查看器
   - 代码高亮

4. **编码规则** (`/coding_rules`)
   - 规则列表
   - 规则详情

5. **组件度量** (`/component_measures`)
   - 代码度量指标

6. **项目概览** (`/dashboard`, `/project/:projectKey`)
   - 项目仪表板
   - 项目活动

7. **质量门** (`/quality_gates`)
   - 质量门配置
   - 质量门条件设置

8. **质量配置** (`/quality_profiles`)
   - 质量配置管理
   - 规则激活

9. **安全热点** (`/security_hotspots`)
   - 安全热点列表
   - 安全热点审查

10. **项目管理** (`/projects`)
    - 项目列表
    - 项目创建
    - 项目设置

11. **用户管理** (`/users`)
    - 用户列表
    - 用户创建/编辑

12. **组管理** (`/groups`)
    - 用户组管理

13. **权限管理** (`/permissions`)
    - 全局权限
    - 项目权限

14. **权限模板** (`/permission_templates`)
    - 权限模板管理

15. **设置** (`/settings`)
    - 系统设置
    - 项目设置

16. **系统管理** (`/system`)
    - 系统信息
    - 系统维护

17. **市场** (`/marketplace`)
    - 插件市场
    - 插件安装

18. **Web API** (`/web_api`, `/web_api_v2`)
    - API 文档

19. **Webhooks** (`/webhooks`)
    - Webhook 配置

20. **后台任务** (`/background_tasks`)
    - 任务列表
    - 任务状态

21. **审计日志** (`/audit_logs`)
    - 审计日志查看

22. **项目相关功能**
    - 项目活动 (`/project/:projectKey/activity`)
    - 项目信息 (`/project/:projectKey/information`)
    - 项目链接 (`/project/:projectKey/links`)
    - 项目新代码定义 (`/project/:projectKey/new_code`)
    - 项目质量门 (`/project/:projectKey/quality_gate`)
    - 项目质量配置 (`/project/:projectKey/quality_profiles`)
    - 项目删除 (`/project/:projectKey/deletion`)
    - 项目导出 (`/project/:projectKey/dump`)
    - 项目 Key (`/project/:projectKey/key`)

23. **其他功能**
    - 项目管理 (`/projects_management`)
    - 教程 (`/tutorials`)
    - 更改管理员密码 (`/change_admin_password`)

## 开发指南

### 安装依赖

```bash
npm install
# 或
yarn install
```

### 启动开发服务器

```bash
npm run dev
# 或
yarn dev
```

开发服务器默认运行在 `http://localhost:3000`，会自动代理 `/api` 和 `/static` 请求到后端服务器（默认 `http://localhost:9000`）。

### 构建生产版本

```bash
npm run build
# 或
yarn build
```

构建输出在 `dist/` 目录。

### 代码检查

```bash
npm run lint
# 或
yarn lint
```

### 类型检查

```bash
npm run type-check
# 或
yarn type-check
```

## 配置

### 环境变量

可以通过环境变量配置：

- `PROXY`: 后端服务器地址（默认: `http://localhost:9000`）
- `PORT`: 开发服务器端口（默认: `3000`）

### Vite 配置

Vite 配置文件位于 `vite.config.ts`，包含：
- 路径别名配置
- 代理配置
- 构建优化配置
- 代码分割策略

## 架构说明

### 路由系统

使用 Vue Router 4 进行路由管理，路由配置在 `src/router/index.ts` 中。

### 状态管理

使用 Pinia 进行状态管理，应用状态存储在 `src/stores/app.ts`。

### API 封装

所有 API 调用都通过 `src/libs/shared/utils/request.ts` 中的封装函数进行，使用 Axios 作为 HTTP 客户端。

### 组件库

使用 Element Plus 作为 UI 组件库，所有图标来自 `@element-plus/icons-vue`。

### 数据获取

使用 `@tanstack/vue-query` 进行服务端状态管理和数据缓存。

## 与后端集成

构建后的前端文件需要集成到 SonarQube 后端：

```bash
# 在后端项目中指定前端构建路径
WEBAPP_BUILD_PATH=/path/to/sonarqube-webapp-vue/dist ./gradlew build
```

## 许可证

LGPL-3.0

## 贡献

本项目完全参考原始 React 版本的架构和功能，使用 Vue3 技术栈重新实现。
