import {
  mockUsers,
  mockProjects,
  mockIssues,
  mockChangelog,
  mockMeasures,
  mockHistoryData,
  mockQualityGates,
  mockActivities,
  mockAlmSettings,
  mockRepositories,
  mockBranches,
  mockComponentTree,
  mockSources,
  mockIssueFlows,
  mockRuleDetails,
  mockTasks,
  generateDateRange,
} from './mockData'
import type { ScanTask } from '@/libs/commons/types/tasks'
import { TaskStatus } from '@/libs/commons/types/tasks'

// 根据 URL 返回对应的 mock 数据
export function getMockResponse(
  url: string,
  method: string,
  params: Record<string, any>,
  data: Record<string, any>
): any {
  // 全局导航 API
  if (url.includes('/navigation/global')) {
    return {
      globalPages: [
        { key: 'projects', name: '项目' },
        { key: 'issues', name: '问题' },
        { key: 'quality_gates', name: '质量门' },
        { key: 'quality_profiles', name: '质量配置' },
        { key: 'users', name: '用户' },
        { key: 'tasks', name: '任务中心' },
      ],
      qualifiers: ['TRK', 'APP', 'VW'],
      settings: {},
      version: '10.0.0',
      versionEOL: false,
      productionDatabase: true,
      canAdmin: true,
      instance: 'SonarQube',
      edition: 'community',
      standalone: true,
      defaultProjectVisibility: 'private',
    }
  }

  // 功能特性 API
  if (url.includes('/navigation/features')) {
    return ['scim', 'sonarcloud', 'github-actions', 'bitbucket-pipelines']
  }

  // 组件导航 API
  if (url.includes('/navigation/component')) {
    const componentKey = params.component
    const project = mockProjects.find(p => p.key === componentKey)
    if (project) {
      return {
        key: project.key,
        name: project.name,
        qualifier: project.qualifier,
        breadcrumbs: [
          {
            key: project.key,
            name: project.name,
            qualifier: project.qualifier,
          },
        ],
        configuration: {
          showSettings: true,
        },
      }
    }
    // 如果找不到项目，返回默认数据
    return {
      key: componentKey,
      name: componentKey,
      qualifier: 'TRK',
      breadcrumbs: [
        {
          key: componentKey,
          name: componentKey,
          qualifier: 'TRK',
        },
      ],
      configuration: {
        showSettings: true,
      },
    }
  }

  // 设置值 API
  if (url.includes('/settings/values')) {
    const key = params.key
    const settingsMap: Record<string, string> = {
      'sonar.designAndArchitecture.enabled': 'true',
      'sonar.forceAuthentication': 'false',
      'sonar.core.serverBaseURL': 'http://localhost:9000',
    }
    return {
      key,
      value: settingsMap[key] || '',
    }
  }

  // 用户相关 API
  if (url.includes('/users/search')) {
    const query = params.q || ''
    const filtered = mockUsers.filter(
      user =>
        user.login.toLowerCase().includes(query.toLowerCase()) ||
        user.name.toLowerCase().includes(query.toLowerCase())
    )
    return { users: filtered.slice(0, params.ps || 10) }
  }

  if (url.includes('/users/current')) {
    return mockUsers[0]
  }

  // 项目相关 API
  if (url.includes('/projects/search')) {
    const query = params.q || params.search || ''
    let filtered = [...mockProjects]

    // 搜索过滤
    if (query) {
      filtered = filtered.filter(
        project =>
          project.key.toLowerCase().includes(query.toLowerCase()) ||
          project.name.toLowerCase().includes(query.toLowerCase())
      )
    }

    // 类型过滤
    if (params.qualifiers) {
      const qualifiers = Array.isArray(params.qualifiers)
        ? params.qualifiers
        : params.qualifiers.split(',')
      filtered = filtered.filter(project => qualifiers.includes(project.qualifier))
    }

    // 标签过滤
    if (params.tags) {
      const tags = Array.isArray(params.tags) ? params.tags : params.tags.split(',')
      filtered = filtered.filter(project => {
        const projectTags = (project as any).tags || []
        return tags.some((tag: string) => projectTags.includes(tag))
      })
    }

    // 收藏过滤
    if (params.filter === 'isFavorite') {
      filtered = filtered.filter((project: any) => project.isFavorite === true)
    }

    // 分页
    const pageIndex = params.p || 1
    const pageSize = params.ps || 50
    const start = (pageIndex - 1) * pageSize
    const end = start + pageSize
    const paginated = filtered.slice(start, end)

    return {
      components: paginated,
      paging: {
        pageIndex,
        pageSize,
        total: filtered.length,
      },
    }
  }

  if (url.includes('/projects/create')) {
    const newProject = {
      key: data.project,
      name: data.name,
      qualifier: 'TRK',
      visibility: data.visibility || 'private',
      lastAnalysisDate: new Date().toISOString(),
      gitUrl: data.gitUrl || '',
      appCode: data.appCode || '',
      taskIds: [],
      branches: [],
      branchTasksCount: {},
    }
    mockProjects.push(newProject as any)
    return newProject
  }

  // 根据gitUrl和appCode查找项目
  if (url.includes('/projects/find_by_git')) {
    const project = mockProjects.find(
      p => p.gitUrl === params.gitUrl && p.appCode === params.appCode
    )
    return project || null
  }

  // 根据gitUrl和appCode创建或获取项目
  if (url.includes('/projects/create_or_get')) {
    // 先查找是否已存在
    let project = mockProjects.find(p => p.gitUrl === data.gitUrl && p.appCode === data.appCode)

    if (!project) {
      // 创建新项目
      const projectKey = data.appCode.toLowerCase().replace(/_/g, '-')
      project = {
        key: projectKey,
        name: data.name || data.appCode,
        qualifier: 'TRK',
        visibility: 'private',
        lastAnalysisDate: new Date().toISOString(),
        gitUrl: data.gitUrl,
        appCode: data.appCode,
        taskIds: [],
        branches: [],
        branchTasksCount: {},
      } as any
      if (project) {
        mockProjects.push(project)
      }
    }

    return project
  }

  if (url.includes('/projects/delete')) {
    const projectKey = params.project
    const index = mockProjects.findIndex(p => p.key === projectKey)
    if (index !== -1) {
      mockProjects.splice(index, 1)
    }
    return undefined
  }

  if (url.includes('/projects/update_visibility')) {
    const project = mockProjects.find(p => p.key === data.project)
    if (project) {
      project.visibility = data.visibility
    }
    return undefined
  }

  if (url.includes('/projects/update_key')) {
    const project = mockProjects.find(p => p.key === data.from)
    if (project) {
      project.key = data.to
      // 更新所有相关的问题、分支等数据中的项目 key
      mockIssues.forEach(issue => {
        if (issue.project === data.from) {
          issue.project = data.to
        }
      })
    }
    return undefined
  }

  // 项目标签相关 API
  if (url.includes('/project_tags/search')) {
    const allTags = new Set<string>()
    mockProjects.forEach((project: any) => {
      if (project.tags) {
        project.tags.forEach((tag: string) => allTags.add(tag))
      }
    })
    const tags = Array.from(allTags)
    const query = params.q || ''
    const filtered = tags.filter(tag => tag.toLowerCase().includes(query.toLowerCase()))
    return { tags: filtered.slice(0, params.ps || 50) }
  }

  if (url.includes('/project_tags/set')) {
    const project = mockProjects.find(p => p.key === data.project)
    if (project) {
      if (!(project as any).tags) {
        ;(project as any).tags = []
      }
      if (!(project as any).tags.includes(data.tag)) {
        ;(project as any).tags.push(data.tag)
      }
    }
    return undefined
  }

  if (url.includes('/project_tags/remove')) {
    const project = mockProjects.find(p => p.key === data.project)
    if (project && (project as any).tags) {
      ;(project as any).tags = (project as any).tags.filter((tag: string) => tag !== data.tag)
    }
    return undefined
  }

  // 收藏相关 API
  if (url.includes('/favorites/add')) {
    const project = mockProjects.find(p => p.key === data.component)
    if (project) {
      ;(project as any).isFavorite = true
    }
    return undefined
  }

  if (url.includes('/favorites/remove')) {
    const project = mockProjects.find(p => p.key === data.component)
    if (project) {
      ;(project as any).isFavorite = false
    }
    return undefined
  }

  // 问题相关 API
  if (url.includes('/issues/search')) {
    let filtered = [...mockIssues]

    // 根据项目过滤
    if (params.componentKeys) {
      const components = params.componentKeys.split(',')
      filtered = filtered.filter(issue => components.includes(issue.project))
    }

    // 根据状态过滤
    if (params.statuses) {
      const statuses = params.statuses.split(',')
      filtered = filtered.filter(issue => statuses.includes(issue.status))
    }

    // 根据严重程度过滤
    if (params.severities) {
      const severities = params.severities.split(',')
      filtered = filtered.filter(issue => severities.includes(issue.severity))
    }

    return {
      issues: filtered,
      total: filtered.length,
      p: params.p || 1,
      ps: params.ps || 50,
    }
  }

  if (url.includes('/issues/list')) {
    return { issues: mockIssues }
  }

  if (url.includes('/issues/changelog')) {
    const issueKey = params.issue
    return { changelog: mockChangelog[issueKey] || [] }
  }

  if (url.includes('/issues/add_comment')) {
    const issue = mockIssues.find(i => i.key === data.issue)
    if (issue) {
      const newComment = {
        key: `comment-${Date.now()}`,
        login: 'current-user',
        htmlText: `<p>${data.text}</p>`,
        markdown: data.text,
        createdAt: new Date().toISOString(),
        updatable: true,
      }
      if (!issue.comments) {
        issue.comments = []
      }
      issue.comments.push(newComment)
      if (!mockChangelog[data.issue]) {
        mockChangelog[data.issue] = []
      }
      mockChangelog[data.issue].unshift({
        creationDate: new Date().toISOString(),
        user: 'current-user',
        action: 'COMMENT',
        comment: data.text,
      })
    }
    return issue
  }

  if (url.includes('/issues/delete_comment')) {
    const commentKey = data.comment
    for (const issue of mockIssues) {
      if (issue.comments) {
        const index = issue.comments.findIndex((c: any) => c.key === commentKey)
        if (index !== -1) {
          issue.comments.splice(index, 1)
          return issue
        }
      }
    }
    return mockIssues[0]
  }

  if (url.includes('/issues/edit_comment')) {
    const commentKey = data.comment
    for (const issue of mockIssues) {
      if (issue.comments) {
        const comment = issue.comments.find((c: any) => c.key === commentKey)
        if (comment) {
          comment.htmlText = `<p>${data.text}</p>`
          comment.markdown = data.text
          return issue
        }
      }
    }
    return mockIssues[0]
  }

  if (url.includes('/issues/assign')) {
    const issue = mockIssues.find(i => i.key === data.issue)
    if (issue) {
      issue.assignee = data.assignee || undefined
      if (!mockChangelog[data.issue]) {
        mockChangelog[data.issue] = []
      }
      mockChangelog[data.issue].unshift({
        creationDate: new Date().toISOString(),
        user: 'current-user',
        action: 'ASSIGN',
        diffs: [
          { field: 'assignee', oldValue: issue.assignee || '', newValue: data.assignee || '' },
        ],
      })
    }
    return issue
  }

  if (url.includes('/issues/set_severity')) {
    const issue = mockIssues.find(i => i.key === data.issue)
    if (issue) {
      const oldSeverity = issue.severity
      issue.severity = data.severity
      if (!mockChangelog[data.issue]) {
        mockChangelog[data.issue] = []
      }
      mockChangelog[data.issue].unshift({
        creationDate: new Date().toISOString(),
        user: 'current-user',
        action: 'SET_SEVERITY',
        diffs: [{ field: 'severity', oldValue: oldSeverity, newValue: data.severity }],
      })
    }
    return issue
  }

  if (url.includes('/issues/set_type')) {
    const issue = mockIssues.find(i => i.key === data.issue)
    if (issue) {
      const oldType = issue.type
      issue.type = data.type
      if (!mockChangelog[data.issue]) {
        mockChangelog[data.issue] = []
      }
      mockChangelog[data.issue].unshift({
        creationDate: new Date().toISOString(),
        user: 'current-user',
        action: 'SET_TYPE',
        diffs: [{ field: 'type', oldValue: oldType, newValue: data.type }],
      })
    }
    return issue
  }

  if (url.includes('/issues/do_transition')) {
    const issue = mockIssues.find(i => i.key === data.issue)
    if (issue) {
      const oldStatus = issue.status
      const transitionMap: Record<string, string> = {
        confirm: 'CONFIRMED',
        resolve: 'FIXED',
        falsepositive: 'FALSE_POSITIVE',
        accept: 'ACCEPTED',
        reopen: 'OPEN',
      }
      const newStatus = transitionMap[data.transition] || issue.status
      issue.status = newStatus as any
      if (!mockChangelog[data.issue]) {
        mockChangelog[data.issue] = []
      }
      mockChangelog[data.issue].unshift({
        creationDate: new Date().toISOString(),
        user: 'current-user',
        action: 'TRANSITION',
        diffs: [{ field: 'status', oldValue: oldStatus, newValue: issue.status }],
      })
    }
    return issue
  }

  // 度量相关 API
  if (url.includes('/measures/component')) {
    const component = params.component
    return mockMeasures[component as keyof typeof mockMeasures] || mockMeasures['my-project']
  }

  if (url.includes('/measures/search_history')) {
    const component = params.component
    const metric = params.metrics
    const days = params.ps || 30

    // 如果历史数据不足，生成新的数据
    let history = mockHistoryData[component]?.[metric] || []
    if (history.length < days) {
      // 生成足够的历史数据
      const dates = generateDateRange(days)
      const baseValues: Record<string, Record<string, number>> = {
        'my-project': { issues: 30, coverage: 80, duplicated_lines_density: 3.2, bugs: 3 },
        'web-app': { issues: 25, coverage: 85, duplicated_lines_density: 1.5, bugs: 2 },
        'api-service': { issues: 20, coverage: 75, duplicated_lines_density: 5.8, bugs: 1 },
      }
      const baseValue = baseValues[component]?.[metric] || 0

      history = dates.map((date, index) => {
        let value = baseValue
        if (metric === 'issues' || metric === 'bugs') {
          value = Math.max(0, baseValue - index + Math.floor(Math.random() * 5))
        } else if (metric === 'coverage') {
          value = Math.min(100, baseValue + index * 0.2 + Math.random() * 2)
        } else if (metric === 'duplicated_lines_density') {
          value = Math.max(0, baseValue - index * 0.05 + Math.random() * 0.5)
        }
        return { date, value: String(value) }
      })
    }

    return {
      measures: [
        {
          metric,
          history: history.slice(-days),
        },
      ],
    }
  }

  // 质量门相关 API
  if (url.includes('/qualitygates/project_status')) {
    const projectKey = params.projectKey
    return mockQualityGates[projectKey] || mockQualityGates['my-project']
  }

  // 项目活动相关 API
  if (url.includes('/project_analyses/search')) {
    const project = params.project
    return {
      analyses: (mockActivities[project] || mockActivities['my-project']).slice(0, params.ps || 10),
    }
  }

  // ALM 设置相关 API
  if (url.includes('/alm_settings/list')) {
    const alm = params.alm
    return { settings: mockAlmSettings[alm] || [] }
  }

  if (url.includes('/alm_settings/') && url.includes('/repositories')) {
    const settingKey = url.split('/alm_settings/')[1].split('/repositories')[0]
    return { repositories: mockRepositories[settingKey] || [] }
  }

  // 分支相关 API
  if (url.includes('/project_branches/list')) {
    const project = params.project
    return { branches: mockBranches[project] || mockBranches['my-project'] || [] }
  }

  if (url.includes('/project_branches/delete')) {
    const project = data.project
    const branchName = data.branch
    if (mockBranches[project]) {
      mockBranches[project] = mockBranches[project].filter(b => b.name !== branchName)
    }
    return undefined
  }

  if (url.includes('/project_branches/set_automatic_deletion_protection')) {
    const project = data.project
    const branchName = data.branch
    const excluded = data.value
    if (mockBranches[project]) {
      const branch = mockBranches[project].find(b => b.name === branchName)
      if (branch) {
        branch.excludedFromPurge = excluded
      }
    }
    return undefined
  }

  if (url.includes('/project_branches/set_main')) {
    const project = data.project
    const branchName = data.branch
    if (mockBranches[project]) {
      mockBranches[project].forEach(b => {
        b.isMain = b.name === branchName
      })
    }
    return undefined
  }

  // 组件树相关 API
  if (url.includes('/measures/component_tree') || url.includes('/components/tree')) {
    const component = params.component
    const tree = mockComponentTree[component] || mockComponentTree['my-project']
    if (tree) {
      return {
        baseComponent: tree.baseComponent,
        components: tree.components || [],
      }
    }
    return {
      baseComponent: {
        key: component,
        name: component,
        qualifier: 'TRK',
        path: '',
      },
      components: [],
    }
  }

  if (url.includes('/components/show')) {
    const componentKey = params.component
    // 首先尝试从项目列表中找到
    const project = mockProjects.find(p => p.key === componentKey)
    if (project) {
      return {
        component: {
          key: project.key,
          name: project.name,
          qualifier: project.qualifier,
          breadcrumbs: [
            {
              key: project.key,
              name: project.name,
              qualifier: project.qualifier,
            },
          ],
          configuration: {
            showSettings: true,
          },
          needIssueSync: false,
        },
        ancestors: [],
      }
    }
    // 然后尝试从组件树中找到
    const tree = mockComponentTree['my-project']
    if (tree) {
      const comp = tree.components.find((c: any) => c.key === componentKey) || tree.baseComponent
      const ancestors = tree.components.filter((c: any) => componentKey.startsWith(c.key + ':'))
      return {
        component: {
          ...comp,
          breadcrumbs:
            ancestors.length > 0
              ? ancestors.map((a: any) => ({
                  key: a.key,
                  name: a.name,
                  qualifier: a.qualifier,
                }))
              : [
                  {
                    key: comp.key,
                    name: comp.name,
                    qualifier: comp.qualifier,
                  },
                ],
          configuration: {
            showSettings: comp.qualifier === 'TRK',
          },
          needIssueSync: false,
        },
        ancestors: ancestors.map((a: any) => ({
          key: a.key,
          name: a.name,
          qualifier: a.qualifier,
        })),
      }
    }
    // 默认返回
    return {
      component: {
        key: componentKey,
        name: componentKey,
        qualifier: 'TRK',
        breadcrumbs: [
          {
            key: componentKey,
            name: componentKey,
            qualifier: 'TRK',
          },
        ],
        configuration: {
          showSettings: true,
        },
        needIssueSync: false,
      },
      ancestors: [],
    }
  }

  if (url.includes('/components/breadcrumbs')) {
    const componentKey = params.component
    const tree = mockComponentTree['my-project']
    if (tree) {
      const comp = tree.components.find((c: any) => c.key === componentKey) || tree.baseComponent
      if (comp) {
        // 构建面包屑路径
        const breadcrumbs: any[] = [tree.baseComponent]
        const keyParts = componentKey.split(':')
        for (let i = 1; i < keyParts.length; i++) {
          const partialKey = keyParts.slice(0, i + 1).join(':')
          const ancestor = tree.components.find((c: any) => c.key === partialKey)
          if (ancestor) {
            breadcrumbs.push(ancestor)
          }
        }
        return breadcrumbs
      }
    }
    // 默认返回项目本身
    return [
      {
        key: componentKey,
        name: componentKey,
        qualifier: 'TRK',
        path: '',
      },
    ]
  }

  if (url.includes('/components/app')) {
    const component = params.component
    const tree = mockComponentTree['my-project']
    if (tree) {
      const comp = tree.components.find((c: any) => c.key === component)
      if (comp) {
        return comp
      }
    }
    return {
      key: component,
      name: component.split(':').pop() || component,
      path: component,
      qualifier: 'FIL',
      q: 'FIL',
    }
  }

  // 源代码相关 API - 从本地文件系统读取
  if (url.includes('/sources/lines')) {
    const componentKey = params.component || params.key
    if (!componentKey) {
      return { sources: [] }
    }

    // 从 componentKey 中提取文件路径
    // componentKey 格式: "project-key:src/path/to/file.vue"
    const pathMatch = componentKey.match(/^[^:]+:(.+)$/)
    if (!pathMatch) {
      // 如果没有路径，尝试从 mockSources 获取
      const sourceData = mockSources[componentKey]
      if (sourceData) {
        const from = params.from || 1
        const to = params.to || 10000
        return {
          sources: sourceData.sources.slice(from - 1, to),
        }
      }
      return { sources: [] }
    }

    const filePath = pathMatch[1]
    const from = params.from || 1
    const to = params.to || 10000

    // 异步读取本地文件（通过 Vite 中间件）
    // 注意：getMockResponse 是同步函数，所以我们需要返回一个 Promise
    // 但实际上，由于这是在拦截器中，我们需要同步返回
    // 所以先尝试从 mockSources 获取，如果没有再尝试读取文件

    // 首先检查是否有 mock 数据
    const sourceData = mockSources[componentKey]
    if (sourceData) {
      return {
        sources: sourceData.sources.slice(from - 1, to),
      }
    }

    // 如果没有 mock 数据，返回一个标记，让请求继续到真实 API
    // 真实 API 会通过 Vite 中间件读取本地文件
    return null
  }

  // 规则详情 API
  if (url.includes('/rules/show')) {
    const ruleKey = params.key
    return (
      mockRuleDetails[ruleKey] || {
        key: ruleKey,
        name: 'Unknown Rule',
        severity: 'MAJOR',
        type: 'CODE_SMELL',
        htmlDescription: '<p>Rule description</p>',
      }
    )
  }

  // 问题流 API
  if (url.includes('/issues/flow')) {
    const issue = params.issue
    return { flows: mockIssueFlows[issue] || [] }
  }

  // 问题标签 API
  if (url.includes('/issues/tags')) {
    const allTags = new Set<string>()
    mockIssues.forEach((issue: any) => {
      if (issue.tags) {
        issue.tags.forEach((tag: string) => allTags.add(tag))
      }
    })
    const tags = Array.from(allTags)
    const query = params.q || ''
    const filtered = tags.filter(tag => tag.toLowerCase().includes(query.toLowerCase()))
    return { tags: filtered.slice(0, params.ps || 50) }
  }

  if (url.includes('/issues/set_tags')) {
    const issue = mockIssues.find(i => i.key === data.issue)
    if (issue) {
      const tags = data.tags ? data.tags.split(',').map((t: string) => t.trim()) : []
      ;(issue as any).tags = tags
    }
    return issue
  }

  // 批量操作 API
  if (url.includes('/issues/bulk_change')) {
    const issueKeys = data.issues ? data.issues.split(',') : []
    issueKeys.forEach((issueKey: string) => {
      const issue = mockIssues.find(i => i.key === issueKey.trim())
      if (issue) {
        // 分配
        if (data.assign) {
          issue.assignee = data.assign || undefined
        }
        // 状态转换
        if (data.do_transition) {
          const transitionMap: Record<string, string> = {
            confirm: 'CONFIRMED',
            resolve: 'FIXED',
            falsepositive: 'FALSE_POSITIVE',
            accept: 'ACCEPTED',
            reopen: 'OPEN',
          }
          issue.status = (transitionMap[data.do_transition] || issue.status) as any
        }
        // 设置严重程度
        if (data.set_severity) {
          issue.severity = data.set_severity as any
        }
        // 设置类型
        if (data.set_type) {
          issue.type = data.set_type as any
        }
        // 添加标签
        if (data.add_tags) {
          const tagsToAdd = data.add_tags.split(',').map((t: string) => t.trim())
          if (!(issue as any).tags) {
            ;(issue as any).tags = []
          }
          tagsToAdd.forEach((tag: string) => {
            if (!(issue as any).tags.includes(tag)) {
              ;(issue as any).tags.push(tag)
            }
          })
        }
        // 移除标签
        if (data.remove_tags) {
          const tagsToRemove = data.remove_tags.split(',').map((t: string) => t.trim())
          if ((issue as any).tags) {
            ;(issue as any).tags = (issue as any).tags.filter(
              (tag: string) => !tagsToRemove.includes(tag)
            )
          }
        }
        // 添加评论
        if (data.comment) {
          if (!issue.comments) {
            issue.comments = []
          }
          issue.comments.push({
            key: `comment-${Date.now()}-${Math.random()}`,
            login: 'current-user',
            htmlText: `<p>${data.comment}</p>`,
            markdown: data.comment,
            createdAt: new Date().toISOString(),
            updatable: true,
          })
        }
      }
    })
    return undefined
  }

  // 问题过滤器 API
  if (url.includes('/issue_filters/search')) {
    return {
      issueFilters: [
        {
          id: '1',
          name: '我的问题',
          query: 'assignedToMe=true',
        },
        {
          id: '2',
          name: '未分配的问题',
          query: 'assignedToMe=false',
        },
        {
          id: '3',
          name: '严重问题',
          query: 'severities=BLOCKER,CRITICAL',
        },
      ],
    }
  }

  // 任务相关 API
  if (url.includes('/tasks/search')) {
    let filtered = [...mockTasks]

    // 按项目筛选
    if (params.projectKey) {
      filtered = filtered.filter(task => task.projectKey === params.projectKey)
    }

    // 按Git地址筛选
    if (params.gitUrl) {
      filtered = filtered.filter(task => task.gitUrl.includes(params.gitUrl))
    }

    // 按应用代码筛选
    if (params.appCode) {
      filtered = filtered.filter(task => task.appCode === params.appCode)
    }

    // 按分支筛选
    if (params.branch) {
      filtered = filtered.filter(task => task.branch === params.branch)
    }

    // 按状态筛选
    if (params.status) {
      const statuses = Array.isArray(params.status) ? params.status : [params.status]
      filtered = filtered.filter(task => statuses.includes(task.status))
    }

    // 排序
    const sort = params.sort || '-createdAt'
    if (sort.startsWith('-')) {
      const field = sort.substring(1)
      filtered.sort((a, b) => {
        const aVal = (a as any)[field]
        const bVal = (b as any)[field]
        if (aVal < bVal) return 1
        if (aVal > bVal) return -1
        return 0
      })
    } else {
      const field = sort
      filtered.sort((a, b) => {
        const aVal = (a as any)[field]
        const bVal = (b as any)[field]
        if (aVal < bVal) return -1
        if (aVal > bVal) return 1
        return 0
      })
    }

    // 分页
    const pageIndex = params.p || 1
    const pageSize = params.ps || 20
    const start = (pageIndex - 1) * pageSize
    const end = start + pageSize
    const paginated = filtered.slice(start, end)

    return {
      tasks: paginated,
      paging: {
        pageIndex,
        pageSize,
        total: filtered.length,
      },
    }
  }

  // 获取任务详情
  if (url.includes('/tasks/') && method === 'get' && !url.includes('/tasks/search')) {
    const taskId = url.split('/tasks/')[1].split('?')[0]
    const task = mockTasks.find(t => t.id === taskId)
    if (task) {
      return task
    }
    return null
  }

  // 创建任务
  if (url.includes('/tasks/create')) {
    const newTask: ScanTask = {
      id: `task-${Date.now()}`,
      name: data.name,
      gitUrl: data.gitUrl,
      appCode: data.appCode,
      branch: data.branch,
      projectKey: data.projectKey,
      status: TaskStatus.Pending,
      createdAt: new Date().toISOString(),
      progress: 0,
      metadata: data.metadata || {},
    }
    mockTasks.unshift(newTask)
    // 如果关联了项目，更新项目的任务列表
    if (data.projectKey) {
      const project = mockProjects.find(p => p.key === data.projectKey)
      if (project) {
        if (!project.taskIds) {
          project.taskIds = []
        }
        project.taskIds.push(newTask.id)
      }
    }
    return newTask
  }

  // 更新任务
  if (url.includes('/tasks/') && method === 'put') {
    const taskId = url.split('/tasks/')[1].split('?')[0]
    const task = mockTasks.find(t => t.id === taskId)
    if (task) {
      if (data.name) task.name = data.name
      if (data.status) task.status = data.status
      if (data.projectKey !== undefined) {
        // 更新项目关联
        if (task.projectKey && task.projectKey !== data.projectKey) {
          const oldProject = mockProjects.find(p => p.key === task.projectKey)
          if (oldProject && oldProject.taskIds) {
            oldProject.taskIds = oldProject.taskIds.filter(id => id !== taskId)
          }
        }
        task.projectKey = data.projectKey
        if (data.projectKey) {
          const project = mockProjects.find(p => p.key === data.projectKey)
          if (project) {
            if (!project.taskIds) {
              project.taskIds = []
            }
            if (!project.taskIds.includes(taskId)) {
              project.taskIds.push(taskId)
            }
          }
        }
      }
      if (data.metadata) {
        task.metadata = { ...task.metadata, ...data.metadata }
      }
    }
    return task
  }

  // 删除任务
  if (url.includes('/tasks/') && method === 'delete') {
    const taskId = url.split('/tasks/')[1].split('?')[0]
    const index = mockTasks.findIndex(t => t.id === taskId)
    if (index !== -1) {
      const task = mockTasks[index]
      // 从项目的任务列表中移除
      if (task.projectKey) {
        const project = mockProjects.find(p => p.key === task.projectKey)
        if (project && project.taskIds) {
          project.taskIds = project.taskIds.filter(id => id !== taskId)
        }
      }
      mockTasks.splice(index, 1)
    }
    return undefined
  }

  // 取消任务
  if (url.includes('/tasks/') && url.includes('/cancel')) {
    const taskId = url.split('/tasks/')[1].split('/cancel')[0]
    const task = mockTasks.find(t => t.id === taskId)
    if (task) {
      task.status = TaskStatus.Cancelled
      task.finishedAt = new Date().toISOString()
    }
    return task
  }

  // 重新执行任务
  if (url.includes('/tasks/') && url.includes('/retry')) {
    const taskId = url.split('/tasks/')[1].split('/retry')[0]
    const task = mockTasks.find(t => t.id === taskId)
    if (task) {
      const newTask: ScanTask = {
        ...task,
        id: `task-${Date.now()}`,
        status: TaskStatus.Pending,
        createdAt: new Date().toISOString(),
        startedAt: undefined,
        finishedAt: undefined,
        duration: undefined,
        progress: 0,
        errorMessage: undefined,
      }
      mockTasks.unshift(newTask)
      return newTask
    }
    return null
  }

  // 获取项目的任务列表
  if (url.includes('/projects/') && url.includes('/tasks')) {
    const projectKey = url.split('/projects/')[1].split('/tasks')[0]
    let filtered = mockTasks.filter(task => task.projectKey === projectKey)

    // 应用其他筛选条件
    if (params.branch) {
      filtered = filtered.filter(task => task.branch === params.branch)
    }
    if (params.status) {
      const statuses = Array.isArray(params.status) ? params.status : [params.status]
      filtered = filtered.filter(task => statuses.includes(task.status))
    }

    // 排序
    const sort = params.sort || '-createdAt'
    if (sort.startsWith('-')) {
      const field = sort.substring(1)
      filtered.sort((a, b) => {
        const aVal = (a as any)[field]
        const bVal = (b as any)[field]
        if (aVal < bVal) return 1
        if (aVal > bVal) return -1
        return 0
      })
    }

    // 分页
    const pageIndex = params.p || 1
    const pageSize = params.ps || 20
    const start = (pageIndex - 1) * pageSize
    const end = start + pageSize
    const paginated = filtered.slice(start, end)

    return {
      tasks: paginated,
      paging: {
        pageIndex,
        pageSize,
        total: filtered.length,
      },
    }
  }

  // 设置导航 API
  if (url.includes('/navigation/settings')) {
    return {
      extensions: [
        { key: 'general', name: '常规' },
        { key: 'security', name: '安全' },
        { key: 'projects', name: '项目' },
        { key: 'quality_profiles', name: '质量配置' },
        { key: 'quality_gates', name: '质量门' },
        { key: 'users', name: '用户和组' },
        { key: 'permissions', name: '权限' },
        { key: 'webhooks', name: 'Webhooks' },
        { key: 'background_tasks', name: '后台任务' },
        { key: 'system', name: '系统' },
      ],
      showUpdateCenter: true,
    }
  }

  // 插件相关 API
  if (url.includes('/plugins/pending')) {
    return {
      installing: 0,
      removing: 0,
      updating: 0,
    }
  }

  // 系统状态 API
  if (url.includes('/system/status')) {
    return {
      status: 'UP',
    }
  }

  if (url.includes('/system/health')) {
    return {
      health: 'GREEN',
      causes: [],
    }
  }

  // 任务状态 API
  if (url.includes('/ce/component')) {
    const componentKey = params.component
    // 查找该组件的任务
    const componentTasks = mockTasks.filter(
      task => task.projectKey === componentKey && task.status !== TaskStatus.Success
    )
    const current = componentTasks.find(task => task.status === TaskStatus.Running)
    const queue = componentTasks.filter(task => task.status !== TaskStatus.Running)

    return {
      current: current || undefined,
      queue: queue,
    }
  }

  // 默认返回 null，使用真实 API
  return null
}
