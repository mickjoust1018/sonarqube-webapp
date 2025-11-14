export interface Project {
  key: string
  name: string
  qualifier: string
  visibility: string
  lastAnalysisDate?: string
  revision?: string
  description?: string
  tags?: string[]
  isFavorite?: boolean
  isScannable?: boolean
  gitUrl: string // Git仓库地址（必需，项目基于git库）
  appCode: string // 应用代码标识（必需，项目基于appCode）
  taskIds?: string[] // 关联的任务ID列表（该git库下所有分支的扫描任务）
  branches?: string[] // 已扫描的分支列表
  branchTasksCount?: Record<string, number> // 每个分支的任务数量统计
}

export interface ProjectsResponse {
  components: Project[]
  paging: {
    pageIndex: number
    pageSize: number
    total: number
  }
  facets?: Array<{
    property: string
    values: Array<{
      val: string
      count: number
    }>
  }>
}

export interface ProjectsQuery {
  filter?: string
  search?: string
  qualifiers?: string[]
  tags?: string[]
  sort?: string
  view?: string
}
