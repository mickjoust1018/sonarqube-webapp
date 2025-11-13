import type { Issue } from '@/libs/commons/types/issues'
import { IssueStatus, IssueSeverity, IssueType } from '@/libs/commons/types/issues'
import type { Project } from '@/libs/commons/types/projects'

// 生成日期范围
function generateDateRange(days: number): string[] {
  const dates: string[] = []
  const now = new Date()
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    dates.push(date.toISOString().split('T')[0])
  }
  return dates
}

// Mock 用户数据
export const mockUsers = [
  { login: 'admin', name: 'Administrator', email: 'admin@example.com', active: true },
  { login: 'john.doe', name: 'John Doe', email: 'john.doe@example.com', active: true },
  { login: 'jane.smith', name: 'Jane Smith', email: 'jane.smith@example.com', active: true },
  { login: 'bob.wilson', name: 'Bob Wilson', email: 'bob.wilson@example.com', active: true },
  { login: 'alice.brown', name: 'Alice Brown', email: 'alice.brown@example.com', active: true },
]

// Mock 项目数据
export const mockProjects: Project[] = [
  {
    key: 'my-project',
    name: 'My Project',
    qualifier: 'TRK',
    visibility: 'private',
    lastAnalysisDate: '2024-01-15T10:30:00Z',
  },
  {
    key: 'web-app',
    name: 'Web Application',
    qualifier: 'TRK',
    visibility: 'public',
    lastAnalysisDate: '2024-01-14T15:20:00Z',
  },
  {
    key: 'api-service',
    name: 'API Service',
    qualifier: 'TRK',
    visibility: 'private',
    lastAnalysisDate: '2024-01-13T09:15:00Z',
  },
]

// Mock 问题数据
export const mockIssues: Issue[] = [
  {
    key: 'AX123456789',
    component: 'src/main/java/com/example/Service.java',
    project: 'my-project',
    rule: 'java:S1067',
    status: IssueStatus.Open,
    severity: IssueSeverity.MAJOR,
    message: 'Expressions should not be too complex',
    line: 45,
    creationDate: '2024-01-10T08:30:00Z',
    type: IssueType.CodeSmell,
    assignee: 'john.doe',
    actions: ['assign', 'comment', 'set_severity', 'set_type', 'do_transition'],
    comments: [
      {
        key: 'comment-1',
        login: 'john.doe',
        htmlText: '<p>This is a complex expression that should be refactored.</p>',
        markdown: 'This is a complex expression that should be refactored.',
        createdAt: '2024-01-11T10:00:00Z',
        updatable: true,
      },
      {
        key: 'comment-2',
        login: 'jane.smith',
        htmlText: '<p>I agree, let\'s break it down into smaller methods.</p>',
        markdown: "I agree, let's break it down into smaller methods.",
        createdAt: '2024-01-11T14:30:00Z',
        updatable: false,
      },
    ],
  },
  {
    key: 'AX987654321',
    component: 'src/main/java/com/example/Controller.java',
    project: 'my-project',
    rule: 'java:S2259',
    status: IssueStatus.Confirmed,
    severity: IssueSeverity.CRITICAL,
    message: 'Null pointers should not be dereferenced',
    line: 123,
    creationDate: '2024-01-09T12:15:00Z',
    type: IssueType.Bug,
    assignee: 'jane.smith',
    actions: ['assign', 'comment', 'set_severity', 'set_type', 'do_transition'],
    comments: [],
  },
  {
    key: 'AX111222333',
    component: 'src/main/java/com/example/Utils.java',
    project: 'web-app',
    rule: 'java:S2083',
    status: IssueStatus.Fixed,
    severity: IssueSeverity.MINOR,
    message: 'HTTP connections should be reused',
    line: 67,
    creationDate: '2024-01-08T16:45:00Z',
    type: IssueType.CodeSmell,
    actions: ['comment'],
    comments: [],
  },
  {
    key: 'AX444555666',
    component: 'src/main/java/com/example/Security.java',
    project: 'api-service',
    rule: 'java:S5131',
    status: IssueStatus.Open,
    severity: IssueSeverity.BLOCKER,
    message: 'Endpoints should not be vulnerable to reflected XSS attacks',
    line: 89,
    creationDate: '2024-01-12T11:20:00Z',
    type: IssueType.Vulnerability,
    assignee: 'bob.wilson',
    actions: ['assign', 'comment', 'set_severity', 'set_type', 'do_transition'],
    comments: [
      {
        key: 'comment-3',
        login: 'bob.wilson',
        htmlText: '<p>This is a security vulnerability that needs immediate attention.</p>',
        markdown: 'This is a security vulnerability that needs immediate attention.',
        createdAt: '2024-01-12T13:00:00Z',
        updatable: true,
      },
    ],
  },
]

// Mock 问题变更历史
export const mockChangelog: Record<string, any[]> = {
  'AX123456789': [
    {
      creationDate: '2024-01-11T10:00:00Z',
      user: 'john.doe',
      action: 'COMMENT',
      comment: 'This is a complex expression that should be refactored.',
    },
    {
      creationDate: '2024-01-10T09:00:00Z',
      user: 'admin',
      action: 'ASSIGN',
      diffs: [{ field: 'assignee', oldValue: '', newValue: 'john.doe' }],
    },
  ],
  'AX987654321': [
    {
      creationDate: '2024-01-09T13:00:00Z',
      user: 'jane.smith',
      action: 'CONFIRM',
      diffs: [{ field: 'status', oldValue: 'OPEN', newValue: 'CONFIRMED' }],
    },
    {
      creationDate: '2024-01-09T12:30:00Z',
      user: 'admin',
      action: 'ASSIGN',
      diffs: [{ field: 'assignee', oldValue: '', newValue: 'jane.smith' }],
    },
  ],
  'AX111222333': [
    {
      creationDate: '2024-01-08T17:00:00Z',
      user: 'john.doe',
      action: 'RESOLVE',
      diffs: [
        { field: 'status', oldValue: 'OPEN', newValue: 'FIXED' },
        { field: 'resolution', oldValue: '', newValue: 'FIXED' },
      ],
    },
  ],
  'AX444555666': [
    {
      creationDate: '2024-01-12T13:00:00Z',
      user: 'bob.wilson',
      action: 'COMMENT',
      comment: 'This is a security vulnerability that needs immediate attention.',
    },
    {
      creationDate: '2024-01-12T12:00:00Z',
      user: 'admin',
      action: 'ASSIGN',
      diffs: [{ field: 'assignee', oldValue: '', newValue: 'bob.wilson' }],
    },
  ],
}

// Mock 度量数据
export const mockMeasures = {
  'my-project': {
    component: {
      key: 'my-project',
      name: 'My Project',
      measures: [
        { metric: 'issues', value: '25' },
        { metric: 'coverage', value: '85.5' },
        { metric: 'duplicated_lines_density', value: '3.2' },
        { metric: 'security_hotspots', value: '5' },
        { metric: 'bugs', value: '3' },
        { metric: 'vulnerabilities', value: '2' },
        { metric: 'code_smells', value: '20' },
        { metric: 'ncloc', value: '12500' },
        { metric: 'lines', value: '15000' },
      ],
    },
  },
  'web-app': {
    component: {
      key: 'web-app',
      name: 'Web Application',
      measures: [
        { metric: 'issues', value: '18' },
        { metric: 'coverage', value: '92.3' },
        { metric: 'duplicated_lines_density', value: '1.5' },
        { metric: 'security_hotspots', value: '3' },
        { metric: 'bugs', value: '2' },
        { metric: 'vulnerabilities', value: '1' },
        { metric: 'code_smells', value: '15' },
        { metric: 'ncloc', value: '9800' },
        { metric: 'lines', value: '12000' },
      ],
    },
  },
  'api-service': {
    component: {
      key: 'api-service',
      name: 'API Service',
      measures: [
        { metric: 'issues', value: '12' },
        { metric: 'coverage', value: '78.9' },
        { metric: 'duplicated_lines_density', value: '5.8' },
        { metric: 'security_hotspots', value: '2' },
        { metric: 'bugs', value: '1' },
        { metric: 'vulnerabilities', value: '1' },
        { metric: 'code_smells', value: '10' },
        { metric: 'ncloc', value: '6500' },
        { metric: 'lines', value: '8000' },
      ],
    },
  },
}

// Mock 历史数据
const dates = generateDateRange(30)
export const mockHistoryData: Record<string, Record<string, any[]>> = {
  'my-project': {
    issues: dates.map((date, index) => ({
      date,
      value: String(30 - index + Math.floor(Math.random() * 10)),
    })),
    coverage: dates.map((date, index) => ({
      date,
      value: String(80 + index * 0.2 + Math.random() * 2),
    })),
  },
  'web-app': {
    issues: dates.map((date, index) => ({
      date,
      value: String(25 - index + Math.floor(Math.random() * 8)),
    })),
    coverage: dates.map((date, index) => ({
      date,
      value: String(85 + index * 0.25 + Math.random() * 2),
    })),
  },
  'api-service': {
    issues: dates.map((date, index) => ({
      date,
      value: String(20 - index + Math.floor(Math.random() * 6)),
    })),
    coverage: dates.map((date, index) => ({
      date,
      value: String(75 + index * 0.15 + Math.random() * 2),
    })),
  },
}

// Mock 质量门数据
export const mockQualityGates: Record<string, any> = {
  'my-project': {
    status: 'OK',
    name: 'Sonar way',
    conditions: [
      { metric: 'coverage', status: 'OK', actualValue: '85.5%', operator: 'GT', errorThreshold: '80%' },
      { metric: 'duplicated_lines_density', status: 'OK', actualValue: '3.2%', operator: 'LT', errorThreshold: '5%' },
      { metric: 'bugs', status: 'OK', actualValue: '3', operator: 'LT', errorThreshold: '5' },
      { metric: 'vulnerabilities', status: 'OK', actualValue: '2', operator: 'LT', errorThreshold: '3' },
    ],
  },
  'web-app': {
    status: 'OK',
    name: 'Sonar way',
    conditions: [
      { metric: 'coverage', status: 'OK', actualValue: '92.3%', operator: 'GT', errorThreshold: '80%' },
      { metric: 'duplicated_lines_density', status: 'OK', actualValue: '1.5%', operator: 'LT', errorThreshold: '5%' },
      { metric: 'bugs', status: 'OK', actualValue: '2', operator: 'LT', errorThreshold: '5' },
      { metric: 'vulnerabilities', status: 'OK', actualValue: '1', operator: 'LT', errorThreshold: '3' },
    ],
  },
  'api-service': {
    status: 'ERROR',
    name: 'Sonar way',
    conditions: [
      { metric: 'coverage', status: 'ERROR', actualValue: '78.9%', operator: 'GT', errorThreshold: '80%' },
      { metric: 'duplicated_lines_density', status: 'OK', actualValue: '5.8%', operator: 'LT', errorThreshold: '6%' },
      { metric: 'bugs', status: 'OK', actualValue: '1', operator: 'LT', errorThreshold: '5' },
      { metric: 'vulnerabilities', status: 'OK', actualValue: '1', operator: 'LT', errorThreshold: '3' },
    ],
  },
}

// Mock 项目活动数据
export const mockActivities: Record<string, any[]> = {
  'my-project': [
    { date: '2024-01-15T10:30:00Z', category: '分析', description: '代码分析完成' },
    { date: '2024-01-14T09:15:00Z', category: '分析', description: '代码分析完成' },
    { date: '2024-01-13T08:00:00Z', category: '分析', description: '代码分析完成' },
  ],
  'web-app': [
    { date: '2024-01-14T15:20:00Z', category: '分析', description: '代码分析完成' },
    { date: '2024-01-13T14:10:00Z', category: '分析', description: '代码分析完成' },
  ],
  'api-service': [
    { date: '2024-01-13T09:15:00Z', category: '分析', description: '代码分析完成' },
    { date: '2024-01-12T08:30:00Z', category: '分析', description: '代码分析完成' },
  ],
}

// Mock ALM 设置
export const mockAlmSettings: Record<string, any[]> = {
  github: [
    { key: 'github-1', name: 'GitHub Enterprise', url: 'https://github.enterprise.com' },
  ],
  gitlab: [
    { key: 'gitlab-1', name: 'GitLab Instance', url: 'https://gitlab.example.com' },
  ],
  bitbucket: [],
  azure: [],
}

// Mock 仓库数据
export const mockRepositories: Record<string, any[]> = {
  'github-1': [
    { key: 'repo-1', name: 'my-awesome-project', url: 'https://github.com/org/my-awesome-project' },
    { key: 'repo-2', name: 'web-frontend', url: 'https://github.com/org/web-frontend' },
    { key: 'repo-3', name: 'api-backend', url: 'https://github.com/org/api-backend' },
  ],
  'gitlab-1': [
    { key: 'repo-4', name: 'mobile-app', url: 'https://gitlab.com/group/mobile-app' },
    { key: 'repo-5', name: 'devops-tools', url: 'https://gitlab.com/group/devops-tools' },
  ],
}

// Mock 分支数据
export const mockBranches: Record<string, any[]> = {
  'my-project': [
    {
      name: 'main',
      isMain: true,
      type: 'BRANCH',
      status: { qualityGateStatus: 'OK' },
      analysisDate: '2024-01-15T10:30:00Z',
      excludedFromPurge: true,
    },
    {
      name: 'develop',
      isMain: false,
      type: 'BRANCH',
      status: { qualityGateStatus: 'OK' },
      analysisDate: '2024-01-14T15:20:00Z',
      excludedFromPurge: false,
    },
    {
      name: 'feature/new-feature',
      isMain: false,
      type: 'BRANCH',
      status: { qualityGateStatus: 'ERROR' },
      analysisDate: '2024-01-13T09:15:00Z',
      excludedFromPurge: false,
    },
  ],
  'web-app': [
    {
      name: 'main',
      isMain: true,
      type: 'BRANCH',
      status: { qualityGateStatus: 'OK' },
      analysisDate: '2024-01-14T15:20:00Z',
      excludedFromPurge: true,
    },
  ],
  'api-service': [
    {
      name: 'main',
      isMain: true,
      type: 'BRANCH',
      status: { qualityGateStatus: 'ERROR' },
      analysisDate: '2024-01-13T09:15:00Z',
      excludedFromPurge: true,
    },
  ],
}

// Mock 文件树数据
export const mockComponentTree: Record<string, any> = {
  'my-project': {
    baseComponent: {
      key: 'my-project',
      name: 'My Project',
      qualifier: 'TRK',
      path: '',
    },
    components: [
      {
        key: 'my-project:src',
        name: 'src',
        qualifier: 'DIR',
        path: 'src',
        measures: [],
      },
      {
        key: 'my-project:src/main',
        name: 'main',
        qualifier: 'DIR',
        path: 'src/main',
        measures: [],
      },
      {
        key: 'my-project:src/main/java',
        name: 'java',
        qualifier: 'DIR',
        path: 'src/main/java',
        measures: [],
      },
      {
        key: 'my-project:src/main/java/com/example',
        name: 'com',
        qualifier: 'DIR',
        path: 'src/main/java/com/example',
        measures: [],
      },
      {
        key: 'my-project:src/main/java/com/example/Service.java',
        name: 'Service.java',
        qualifier: 'FIL',
        path: 'src/main/java/com/example/Service.java',
        measures: [
          { metric: 'coverage', value: '85.5' },
          { metric: 'ncloc', value: '250' },
          { metric: 'complexity', value: '15' },
        ],
      },
      {
        key: 'my-project:src/main/java/com/example/Controller.java',
        name: 'Controller.java',
        qualifier: 'FIL',
        path: 'src/main/java/com/example/Controller.java',
        measures: [
          { metric: 'coverage', value: '92.3' },
          { metric: 'ncloc', value: '180' },
          { metric: 'complexity', value: '8' },
        ],
      },
      {
        key: 'my-project:src/main/java/com/example/Utils.java',
        name: 'Utils.java',
        qualifier: 'FIL',
        path: 'src/main/java/com/example/Utils.java',
        measures: [
          { metric: 'coverage', value: '78.9' },
          { metric: 'ncloc', value: '120' },
          { metric: 'complexity', value: '5' },
        ],
      },
    ],
  },
}

// Mock 源代码数据
export const mockSources: Record<string, any> = {
  'my-project:src/main/java/com/example/Service.java': {
    sources: [
      { line: 1, code: 'package com.example;' },
      { line: 2, code: '' },
      { line: 3, code: 'import java.util.List;' },
      { line: 4, code: 'import java.util.ArrayList;' },
      { line: 5, code: '' },
      { line: 6, code: 'public class Service {' },
      { line: 7, code: '    private List<String> items;' },
      { line: 8, code: '' },
      { line: 9, code: '    public Service() {' },
      { line: 10, code: '        this.items = new ArrayList<>();' },
      { line: 11, code: '    }' },
      { line: 12, code: '' },
      { line: 13, code: '    public void addItem(String item) {' },
      { line: 14, code: '        if (item == null || item.isEmpty()) {' },
      { line: 15, code: '            throw new IllegalArgumentException("Item cannot be null or empty");' },
      { line: 16, code: '        }' },
      { line: 17, code: '        items.add(item);' },
      { line: 18, code: '    }' },
      { line: 19, code: '' },
      { line: 20, code: '    public List<String> getItems() {' },
      { line: 21, code: '        return new ArrayList<>(items);' },
      { line: 22, code: '    }' },
      { line: 23, code: '' },
      { line: 24, code: '    public void processItems() {' },
      { line: 25, code: '        for (int i = 0; i < items.size(); i++) {' },
      { line: 26, code: '            String item = items.get(i);' },
      { line: 27, code: '            if (item != null && !item.isEmpty()) {' },
      { line: 28, code: '                System.out.println("Processing: " + item);' },
      { line: 29, code: '            }' },
      { line: 30, code: '        }' },
      { line: 31, code: '    }' },
      { line: 32, code: '}' },
    ],
    issues: [
      { line: 25, key: 'AX123456789', severity: 'MAJOR' },
      { line: 27, key: 'AX987654321', severity: 'CRITICAL' },
    ],
  },
  'my-project:src/main/java/com/example/Controller.java': {
    sources: [
      { line: 1, code: 'package com.example;' },
      { line: 2, code: '' },
      { line: 3, code: 'import org.springframework.web.bind.annotation.*;' },
      { line: 4, code: '' },
      { line: 5, code: '@RestController' },
      { line: 6, code: '@RequestMapping("/api")' },
      { line: 7, code: 'public class Controller {' },
      { line: 8, code: '    private Service service;' },
      { line: 9, code: '' },
      { line: 10, code: '    @GetMapping("/items")' },
      { line: 11, code: '    public List<String> getItems() {' },
      { line: 12, code: '        return service.getItems();' },
      { line: 13, code: '    }' },
      { line: 14, code: '}' },
    ],
    issues: [
      { line: 123, key: 'AX987654321', severity: 'CRITICAL' },
    ],
  },
}

// Mock 问题流数据
export const mockIssueFlows: Record<string, any[]> = {
  'AX123456789': [
    {
      locations: [
        { component: 'my-project:src/main/java/com/example/Service.java', textRange: { startLine: 25, endLine: 25 } },
        { component: 'my-project:src/main/java/com/example/Service.java', textRange: { startLine: 27, endLine: 27 } },
        { component: 'my-project:src/main/java/com/example/Service.java', textRange: { startLine: 30, endLine: 30 } },
      ],
    },
  ],
  'AX987654321': [
    {
      locations: [
        { component: 'my-project:src/main/java/com/example/Controller.java', textRange: { startLine: 123, endLine: 123 } },
      ],
    },
  ],
}

// Mock 规则详情数据
export const mockRuleDetails: Record<string, any> = {
  'java:S1067': {
    key: 'java:S1067',
    name: 'Expressions should not be too complex',
    severity: 'MAJOR',
    type: 'CODE_SMELL',
    htmlDescription: '<p>Complex expressions are hard to read and understand.</p>',
    htmlNote: '<p>Consider breaking down complex expressions into smaller, more manageable parts.</p>',
    tags: ['complexity', 'brain-overload'],
  },
  'java:S2259': {
    key: 'java:S2259',
    name: 'Null pointers should not be dereferenced',
    severity: 'CRITICAL',
    type: 'BUG',
    htmlDescription: '<p>A null pointer dereference can lead to a NullPointerException.</p>',
    htmlNote: '<p>Always check for null before dereferencing.</p>',
    tags: ['bug', 'null'],
  },
}
