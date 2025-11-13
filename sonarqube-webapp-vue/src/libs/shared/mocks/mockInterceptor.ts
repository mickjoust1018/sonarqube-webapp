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
} from './mockData'

// 根据 URL 返回对应的 mock 数据
export function getMockResponse(
  url: string,
  method: string,
  params: Record<string, any>,
  data: Record<string, any>
): any {
  // 用户相关 API
  if (url.includes('/users/search')) {
    const query = params.q || ''
    const filtered = mockUsers.filter(
      (user) =>
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
    const query = params.q || ''
    const filtered = mockProjects.filter(
      (project) =>
        project.key.toLowerCase().includes(query.toLowerCase()) ||
        project.name.toLowerCase().includes(query.toLowerCase())
    )
    return {
      components: filtered,
      paging: {
        pageIndex: params.p || 1,
        pageSize: params.ps || 50,
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
    }
    mockProjects.push(newProject as any)
    return newProject
  }

  // 问题相关 API
  if (url.includes('/issues/search')) {
    let filtered = [...mockIssues]

    // 根据项目过滤
    if (params.componentKeys) {
      const components = params.componentKeys.split(',')
      filtered = filtered.filter((issue) => components.includes(issue.project))
    }

    // 根据状态过滤
    if (params.statuses) {
      const statuses = params.statuses.split(',')
      filtered = filtered.filter((issue) => statuses.includes(issue.status))
    }

    // 根据严重程度过滤
    if (params.severities) {
      const severities = params.severities.split(',')
      filtered = filtered.filter((issue) => severities.includes(issue.severity))
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
    const issue = mockIssues.find((i) => i.key === data.issue)
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
    const issue = mockIssues.find((i) => i.key === data.issue)
    if (issue) {
      issue.assignee = data.assignee || undefined
      if (!mockChangelog[data.issue]) {
        mockChangelog[data.issue] = []
      }
      mockChangelog[data.issue].unshift({
        creationDate: new Date().toISOString(),
        user: 'current-user',
        action: 'ASSIGN',
        diffs: [{ field: 'assignee', oldValue: issue.assignee || '', newValue: data.assignee || '' }],
      })
    }
    return issue
  }

  if (url.includes('/issues/set_severity')) {
    const issue = mockIssues.find((i) => i.key === data.issue)
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
    const issue = mockIssues.find((i) => i.key === data.issue)
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
    const issue = mockIssues.find((i) => i.key === data.issue)
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
    const history = mockHistoryData[component]?.[metric] || []
    return {
      measures: [
        {
          metric,
          history: history.slice(-(params.ps || 30)),
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
      mockBranches[project] = mockBranches[project].filter((b) => b.name !== branchName)
    }
    return undefined
  }

  if (url.includes('/project_branches/set_automatic_deletion_protection')) {
    const project = data.project
    const branchName = data.branch
    const excluded = data.value
    if (mockBranches[project]) {
      const branch = mockBranches[project].find((b) => b.name === branchName)
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
      mockBranches[project].forEach((b) => {
        b.isMain = b.name === branchName
      })
    }
    return undefined
  }

  // 组件树相关 API
  if (url.includes('/measures/component_tree')) {
    const component = params.component
    return mockComponentTree[component] || mockComponentTree['my-project']
  }

  if (url.includes('/components/show')) {
    const component = params.component
    const tree = mockComponentTree['my-project']
    if (tree) {
      const comp = tree.components.find((c: any) => c.key === component) || tree.baseComponent
      const ancestors = tree.components.filter((c: any) =>
        component.startsWith(c.key + ':')
      )
      return { component: comp, ancestors }
    }
    return { component: { key: component, name: component }, ancestors: [] }
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

  // 源代码相关 API
  if (url.includes('/sources/lines')) {
    const key = params.key
    const from = params.from || 1
    const to = params.to || 1000
    const sourceData = mockSources[key]
    if (sourceData) {
      return {
        sources: sourceData.sources.slice(from - 1, to),
      }
    }
    // 生成示例源代码
    const sources = []
    for (let i = from; i <= to; i++) {
      sources.push({ line: i, code: `// Line ${i}` })
    }
    return { sources }
  }

  // 规则详情 API
  if (url.includes('/rules/show')) {
    const ruleKey = params.key
    return mockRuleDetails[ruleKey] || {
      key: ruleKey,
      name: 'Unknown Rule',
      severity: 'MAJOR',
      type: 'CODE_SMELL',
      htmlDescription: '<p>Rule description</p>',
    }
  }

  // 问题流 API
  if (url.includes('/issues/flow')) {
    const issue = params.issue
    return { flows: mockIssueFlows[issue] || [] }
  }

  // 默认返回 null，使用真实 API
  return null
}
