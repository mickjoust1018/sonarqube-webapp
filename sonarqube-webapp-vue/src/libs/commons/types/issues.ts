export enum IssueSeverity {
  BLOCKER = 'BLOCKER',
  CRITICAL = 'CRITICAL',
  MAJOR = 'MAJOR',
  MINOR = 'MINOR',
  INFO = 'INFO',
}

export enum IssueType {
  CodeSmell = 'CODE_SMELL',
  Vulnerability = 'VULNERABILITY',
  Bug = 'BUG',
  SecurityHotspot = 'SECURITY_HOTSPOT',
}

export enum IssueStatus {
  Open = 'OPEN',
  Fixed = 'FIXED',
  Confirmed = 'CONFIRMED',
  Accepted = 'ACCEPTED',
  FalsePositive = 'FALSE_POSITIVE',
  InSandbox = 'IN_SANDBOX',
}

export enum IssueResolution {
  Unresolved = '',
  FalsePositive = 'FALSE-POSITIVE',
  Fixed = 'FIXED',
  Removed = 'REMOVED',
  WontFix = 'WONTFIX',
}

export interface Issue {
  key: string
  component: string
  project: string
  rule: string
  status: IssueStatus
  resolution?: IssueResolution
  severity: IssueSeverity
  message?: string
  line?: number
  author?: string
  assignee?: string
  creationDate: string
  updateDate?: string
  type: IssueType
  flows?: Array<{
    locations?: Array<{
      component: string
      textRange: {
        startLine: number
        endLine: number
        startOffset: number
        endOffset: number
      }
    }>
  }>
  comments?: Array<{
    key: string
    login: string
    htmlText: string
    markdown: string
    createdAt: string
    updatable: boolean
  }>
  actions?: string[]
}

export interface RawIssuesResponse {
  issues: Issue[]
  total: number
  p: number
  ps: number
  facets?: Array<{
    property: string
    values: Array<{
      val: string
      count: number
    }>
  }>
}

export interface IssuesQuery {
  assigned?: boolean
  assignees?: string[]
  author?: string[]
  componentKeys?: string[]
  createdAfter?: string
  createdBefore?: string
  createdInLast?: string
  cwe?: string[]
  facets?: string[]
  issues?: string[]
  languages?: string[]
  owaspTop10?: string[]
  projects?: string[]
  resolutions?: string[]
  rules?: string[]
  severities?: string[]
  sonarsourceSecurity?: string[]
  statuses?: string[]
  tags?: string[]
  types?: string[]
  sort?: string
}

export const ASSIGNEE_ME = '__me__'
