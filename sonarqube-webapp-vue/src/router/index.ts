import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { getBaseUrl } from '@/libs/shared/utils/browser'

// 布局组件
const GlobalContainer = () => import('@/layouts/GlobalContainer.vue')
const AdminContainer = () => import('@/layouts/AdminContainer.vue')
const ComponentContainer = () => import('@/layouts/ComponentContainer.vue')
const ProjectAdminContainer = () => import('@/layouts/ProjectAdminContainer.vue')
const SimpleContainer = () => import('@/layouts/SimpleContainer.vue')

// 功能模块
const routes: RouteRecordRaw[] = [
  {
    path: '/sessions',
    component: SimpleContainer,
    children: [
      {
        path: 'new',
        name: 'Login',
        component: () => import('@/views/sessions/Login.vue'),
      },
      {
        path: 'logout',
        name: 'Logout',
        component: () => import('@/views/sessions/Logout.vue'),
      },
      {
        path: 'unauthorized',
        name: 'Unauthorized',
        component: () => import('@/views/sessions/Unauthorized.vue'),
      },
    ],
  },
  {
    path: '/maintenance',
    component: SimpleContainer,
    children: [
      {
        path: '',
        name: 'Maintenance',
        component: () => import('@/views/maintenance/Maintenance.vue'),
      },
    ],
  },
  {
    path: '/',
    component: GlobalContainer,
    children: [
      {
        path: '',
        name: 'Landing',
        component: () => import('@/views/Landing.vue'),
      },
      {
        path: 'feature-demo',
        name: 'FeatureDemo',
        component: () => import('@/views/FeatureDemo.vue'),
      },
      // 账户管理
      {
        path: 'account',
        component: () => import('@/views/account/Account.vue'),
        children: [
          {
            path: '',
            name: 'AccountProfile',
            component: () => import('@/views/account/profile/Profile.vue'),
          },
          {
            path: 'security',
            name: 'AccountSecurity',
            component: () => import('@/views/account/security/Security.vue'),
          },
          {
            path: 'projects',
            name: 'AccountProjects',
            component: () => import('@/views/account/projects/Projects.vue'),
          },
          {
            path: 'notifications',
            name: 'AccountNotifications',
            component: () => import('@/views/account/notifications/Notifications.vue'),
          },
        ],
      },
      // 问题管理
      {
        path: 'issues',
        name: 'Issues',
        component: () => import('@/views/issues/Issues.vue'),
      },
      // 代码查看（全局）
      {
        path: 'code',
        name: 'Code',
        component: () => import('@/views/code/Code.vue'),
      },
      // 编码规则
      {
        path: 'coding_rules',
        name: 'CodingRules',
        component: () => import('@/views/coding-rules/CodingRules.vue'),
      },
      // 组件度量
      {
        path: 'component_measures',
        name: 'ComponentMeasures',
        component: () => import('@/views/component-measures/ComponentMeasures.vue'),
      },
      // 项目概览
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/overview/Dashboard.vue'),
      },
      // 项目相关路由（使用 ComponentContainer）
      {
        path: 'project/:id',
        component: ComponentContainer,
        children: [
          {
            path: '',
            name: 'ProjectOverview',
            component: () => import('@/views/overview/ProjectOverview.vue'),
          },
          {
            path: 'issues',
            name: 'ProjectIssues',
            component: () => import('@/views/issues/Issues.vue'),
          },
          {
            path: 'code',
            name: 'ProjectCode',
            component: () => import('@/views/code/Code.vue'),
          },
          {
            path: 'security_hotspots',
            name: 'ProjectSecurityHotspots',
            component: () => import('@/views/security-hotspots/SecurityHotspots.vue'),
          },
          {
            path: 'activity',
            name: 'ProjectActivity',
            component: () => import('@/views/project-activity/ProjectActivity.vue'),
          },
          {
            path: 'information',
            name: 'ProjectInformation',
            component: () => import('@/views/project-information/ProjectInformation.vue'),
          },
          {
            path: 'quality_gate',
            name: 'ProjectQualityGate',
            component: () => import('@/views/project-quality-gate/ProjectQualityGate.vue'),
          },
          {
            path: 'quality_profiles',
            name: 'ProjectQualityProfiles',
            component: () => import('@/views/project-quality-profiles/ProjectQualityProfiles.vue'),
          },
          // 项目设置路由（使用 ProjectAdminContainer）
          {
            path: 'admin',
            component: ProjectAdminContainer,
            children: [
              {
                path: '',
                name: 'ProjectAdmin',
                component: () => import('@/views/admin/ProjectAdmin.vue'),
              },
              {
                path: 'links',
                name: 'ProjectLinks',
                component: () => import('@/views/project-links/ProjectLinks.vue'),
              },
              {
                path: 'new_code',
                name: 'ProjectNewCode',
                component: () => import('@/views/project-new-code/ProjectNewCode.vue'),
              },
              {
                path: 'branches',
                name: 'ProjectBranches',
                component: () => import('@/views/projects/Branches.vue'),
              },
              {
                path: 'deletion',
                name: 'ProjectDeletion',
                component: () => import('@/views/project-deletion/ProjectDeletion.vue'),
              },
              {
                path: 'dump',
                name: 'ProjectDump',
                component: () => import('@/views/project-dump/ProjectDump.vue'),
              },
              {
                path: 'key',
                name: 'ProjectKey',
                component: () => import('@/views/project-key/ProjectKey.vue'),
              },
              {
                path: 'webhooks',
                name: 'ProjectWebhooks',
                component: () => import('@/views/webhooks/Webhooks.vue'),
              },
            ],
          },
          {
            path: 'permissions',
            name: 'ProjectPermissions',
            component: () => import('@/views/permissions/ProjectPermissions.vue'),
          },
        ],
      },
      // 兼容旧的路由格式（project/:projectKey）
      {
        path: 'project/:projectKey',
        redirect: to => {
          return { path: `/project/${to.params.projectKey}`, query: to.query }
        },
      },
      // 质量门
      {
        path: 'quality_gates',
        name: 'QualityGates',
        component: () => import('@/views/quality-gates/QualityGates.vue'),
      },
      // 质量配置
      {
        path: 'quality_profiles',
        name: 'QualityProfiles',
        component: () => import('@/views/quality-profiles/QualityProfiles.vue'),
      },
      // 安全热点
      {
        path: 'security_hotspots',
        name: 'SecurityHotspots',
        component: () => import('@/views/security-hotspots/SecurityHotspots.vue'),
      },
      // 任务管理
      {
        path: 'tasks',
        name: 'Tasks',
        component: () => import('@/views/tasks/Tasks.vue'),
      },
      {
        path: 'tasks/:taskId',
        name: 'TaskDetail',
        component: () => import('@/views/tasks/TaskDetail.vue'),
      },
      // 特殊处理：/extension/tasks 重定向到 /tasks（必须在通用路由之前）
      {
        path: 'extension/tasks',
        redirect: '/tasks',
      },
      // 全局扩展页面
      {
        path: 'extension/:pluginKey/:extensionKey',
        name: 'GlobalPageExtension',
        component: () => import('@/views/extensions/GlobalPageExtension.vue'),
      },
      {
        path: 'projects',
        name: 'Projects',
        component: () => import('@/views/projects/Projects.vue'),
      },
      {
        path: 'projects/create',
        name: 'CreateProject',
        component: () => import('@/views/projects/CreateProject.vue'),
      },
      {
        path: 'projects/favorite',
        name: 'FavoriteProjects',
        component: () => import('@/views/projects/Projects.vue'),
      },
      // 用户管理
      {
        path: 'users',
        name: 'Users',
        component: () => import('@/views/users/Users.vue'),
      },
      // 组管理
      {
        path: 'groups',
        name: 'Groups',
        component: () => import('@/views/groups/Groups.vue'),
      },
      // 权限管理
      {
        path: 'permissions',
        name: 'GlobalPermissions',
        component: () => import('@/views/permissions/GlobalPermissions.vue'),
      },
      // 权限模板
      {
        path: 'permission_templates',
        name: 'PermissionTemplates',
        component: () => import('@/views/permission-templates/PermissionTemplates.vue'),
      },
      // 设置
      {
        path: 'settings',
        name: 'Settings',
        component: () => import('@/views/settings/Settings.vue'),
      },
      // 系统管理
      {
        path: 'system',
        name: 'System',
        component: () => import('@/views/system/System.vue'),
      },
      // 市场
      {
        path: 'marketplace',
        name: 'Marketplace',
        component: () => import('@/views/marketplace/Marketplace.vue'),
      },
      // Web API
      {
        path: 'web_api',
        name: 'WebAPI',
        component: () => import('@/views/web-api/WebAPI.vue'),
      },
      {
        path: 'web_api_v2',
        name: 'WebAPIV2',
        component: () => import('@/views/web-api-v2/WebAPIV2.vue'),
      },
      // Webhooks
      {
        path: 'webhooks',
        name: 'Webhooks',
        component: () => import('@/views/webhooks/Webhooks.vue'),
      },
      // 后台任务
      {
        path: 'background_tasks',
        name: 'BackgroundTasks',
        component: () => import('@/views/background-tasks/BackgroundTasks.vue'),
      },
      // 审计日志
      {
        path: 'audit_logs',
        name: 'AuditLogs',
        component: () => import('@/views/audit-logs/AuditLogs.vue'),
      },
      // 项目管理
      {
        path: 'projects_management',
        name: 'ProjectsManagement',
        component: () => import('@/views/projects-management/ProjectsManagement.vue'),
      },
      // 教程
      {
        path: 'tutorials',
        name: 'Tutorials',
        component: () => import('@/views/tutorials/Tutorials.vue'),
      },
      // 更改管理员密码
      {
        path: 'change_admin_password',
        name: 'ChangeAdminPassword',
        component: () => import('@/views/change-admin-password/ChangeAdminPassword.vue'),
      },
    ],
  },
  {
    path: '/admin',
    component: AdminContainer,
    children: [
      {
        path: '',
        name: 'Admin',
        component: () => import('@/views/admin/Admin.vue'),
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(getBaseUrl()),
  routes,
})

export default router
