import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { getBaseUrl } from '@/libs/shared/utils/browser'

// 布局组件
const GlobalContainer = () => import('@/layouts/GlobalContainer.vue')
const AdminContainer = () => import('@/layouts/AdminContainer.vue')
const ComponentContainer = () => import('@/layouts/ComponentContainer.vue')
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
      {
        path: 'project/:projectKey/issues',
        name: 'ProjectIssues',
        component: () => import('@/views/issues/Issues.vue'),
      },
      // 代码查看
      {
        path: 'code',
        name: 'Code',
        component: () => import('@/views/code/Code.vue'),
      },
      {
        path: 'project/:projectKey/code',
        name: 'ProjectCode',
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
      {
        path: 'project/:projectKey',
        component: ComponentContainer,
        children: [
          {
            path: '',
            name: 'ProjectOverview',
            component: () => import('@/views/overview/ProjectOverview.vue'),
          },
        ],
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
      {
        path: 'project/:projectKey/security_hotspots',
        name: 'ProjectSecurityHotspots',
        component: () => import('@/views/security-hotspots/SecurityHotspots.vue'),
      },
      // 项目管理
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
      {
        path: 'project/:projectKey/permissions',
        name: 'ProjectPermissions',
        component: () => import('@/views/permissions/ProjectPermissions.vue'),
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
      {
        path: 'project/:projectKey/webhooks',
        name: 'ProjectWebhooks',
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
      // 项目活动
      {
        path: 'project/:projectKey/activity',
        name: 'ProjectActivity',
        component: () => import('@/views/project-activity/ProjectActivity.vue'),
      },
      // 项目信息
      {
        path: 'project/:projectKey/information',
        name: 'ProjectInformation',
        component: () => import('@/views/project-information/ProjectInformation.vue'),
      },
      // 项目链接
      {
        path: 'project/:projectKey/links',
        name: 'ProjectLinks',
        component: () => import('@/views/project-links/ProjectLinks.vue'),
      },
      // 项目新代码定义
      {
        path: 'project/:projectKey/new_code',
        name: 'ProjectNewCode',
        component: () => import('@/views/project-new-code/ProjectNewCode.vue'),
      },
      // 项目质量门
      {
        path: 'project/:projectKey/quality_gate',
        name: 'ProjectQualityGate',
        component: () => import('@/views/project-quality-gate/ProjectQualityGate.vue'),
      },
      // 项目质量配置
      {
        path: 'project/:projectKey/quality_profiles',
        name: 'ProjectQualityProfiles',
        component: () => import('@/views/project-quality-profiles/ProjectQualityProfiles.vue'),
      },
      // 项目删除
      {
        path: 'project/:projectKey/deletion',
        name: 'ProjectDeletion',
        component: () => import('@/views/project-deletion/ProjectDeletion.vue'),
      },
      // 项目导出
      {
        path: 'project/:projectKey/dump',
        name: 'ProjectDump',
        component: () => import('@/views/project-dump/ProjectDump.vue'),
      },
      // 项目分支管理
      {
        path: 'project/:projectKey/branches',
        name: 'ProjectBranches',
        component: () => import('@/views/projects/Branches.vue'),
      },
      // 项目 Key
      {
        path: 'project/:projectKey/key',
        name: 'ProjectKey',
        component: () => import('@/views/project-key/ProjectKey.vue'),
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
    path: '/project/:projectKey/admin',
    component: AdminContainer,
    children: [
      {
        path: '',
        name: 'ProjectAdmin',
        component: () => import('@/views/admin/ProjectAdmin.vue'),
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
