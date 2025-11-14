export interface ComponentBase {
  key: string
  name: string
  qualifier: string
  analysisDate?: string
  breadcrumbs: Array<{
    key: string
    name: string
    qualifier: string
  }>
  description?: string
  isFavorite?: boolean
  leakPeriodDate?: string
  path?: string
  project?: string
  pullRequest?: string
  refKey?: string
  tags?: string[]
  visibility?: string
}

export interface ComponentConfiguration {
  showSettings?: boolean
  showQualityProfiles?: boolean
  showQualityGates?: boolean
  showLinks?: boolean
  showPermissions?: boolean
  showHistory?: boolean
  showUpdateKey?: boolean
  showBackgroundTasks?: boolean
  showNewCodeDefinition?: boolean
  showBranches?: boolean
  showCode?: boolean
  showDelete?: boolean
  extensions?: Array<{
    key: string
    name: string
  }>
}

export interface Component extends ComponentBase {
  branch?: string
  canBrowseAllChildProjects?: boolean
  configuration?: ComponentConfiguration
  extensions?: Array<{
    key: string
    name: string
  }>
  isAiCodeFixEnabled?: boolean
  needIssueSync?: boolean
}

export interface ComponentContextShape {
  component?: Component
  currentTask?: Task
  isInProgress: boolean
  isPending: boolean
  onComponentChange: (changes: Partial<Component>) => void
  fetchComponent: (branchName?: string) => Promise<void>
}

export interface Task {
  id: string
  type: string
  componentId: string
  componentKey: string
  componentName: string
  componentQualifier: string
  status: 'PENDING' | 'IN_PROGRESS' | 'SUCCESS' | 'FAILED' | 'CANCELED'
  submittedAt: string
  startedAt?: string
  executedAt?: string
  executionTimeMs?: number
  submitterLogin?: string
  errorMessage?: string
  errorStacktrace?: string
  branch?: string
  pullRequest?: string
  warningCount?: number
}

export enum TaskStatuses {
  Pending = 'PENDING',
  InProgress = 'IN_PROGRESS',
  Success = 'SUCCESS',
  Failed = 'FAILED',
  Canceled = 'CANCELED',
}

export enum TaskTypes {
  Report = 'REPORT',
  IssueSync = 'ISSUE_SYNC',
  AppRefresh = 'APP_REFRESH',
  ViewRefresh = 'VIEW_REFRESH',
  ProjectExport = 'PROJECT_EXPORT',
  ProjectImport = 'PROJECT_IMPORT',
}
