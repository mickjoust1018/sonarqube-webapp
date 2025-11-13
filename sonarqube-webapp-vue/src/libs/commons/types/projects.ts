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
