// 扫描任务状态
export enum TaskStatus {
  Pending = 'PENDING', // 待执行
  Running = 'RUNNING', // 执行中
  Success = 'SUCCESS', // 成功
  Failed = 'FAILED', // 失败
  Cancelled = 'CANCELLED', // 已取消
}

// 扫描任务
export interface ScanTask {
  id: string
  name: string
  gitUrl: string // Git仓库地址
  appCode: string // 应用代码标识
  branch: string // 分支名称
  projectKey?: string // 关联的项目Key（可选，可能还未创建项目）
  status: TaskStatus
  createdAt: string // 创建时间
  startedAt?: string // 开始时间
  finishedAt?: string // 完成时间
  duration?: number // 执行时长（秒）
  progress?: number // 进度（0-100）
  errorMessage?: string // 错误信息
  scanResult?: {
    issuesCount: number // 问题数量
    coverage: number // 覆盖率
    duplicatedLines: number // 重复行数
    bugs: number // Bug数量
    vulnerabilities: number // 漏洞数量
    codeSmells: number // 代码异味数量
  }
  metadata?: {
    commitHash?: string // 提交哈希
    commitMessage?: string // 提交信息
    author?: string // 提交作者
    scannerVersion?: string // 扫描器版本
    [key: string]: any // 其他元数据
  }
}

// 任务查询参数
export interface TasksQuery {
  projectKey?: string // 按项目筛选
  gitUrl?: string // 按Git地址筛选
  appCode?: string // 按应用代码筛选
  branch?: string // 按分支筛选
  status?: TaskStatus | TaskStatus[] // 按状态筛选
  createdAfter?: string // 创建时间之后
  createdBefore?: string // 创建时间之前
  sort?: string // 排序字段
  p?: number // 页码
  ps?: number // 每页数量
}

// 任务列表响应
export interface TasksResponse {
  tasks: ScanTask[]
  paging: {
    pageIndex: number
    pageSize: number
    total: number
  }
}

// 任务创建参数
export interface CreateTaskParams {
  name: string
  gitUrl: string
  appCode: string
  branch: string
  projectKey?: string
  metadata?: Record<string, any>
}

// 任务更新参数
export interface UpdateTaskParams {
  name?: string
  projectKey?: string
  status?: TaskStatus
  metadata?: Record<string, any>
}
