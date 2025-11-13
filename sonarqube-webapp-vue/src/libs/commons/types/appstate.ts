export interface AppState {
  globalPages?: Array<{
    key: string
    name: string
  }>
  qualifiers?: string[]
  settings?: Record<string, string>
  version?: string
  versionEOL?: boolean
  productionDatabase?: boolean
  canAdmin?: boolean
  instance?: string
  edition?: string
  standalone?: boolean
  defaultProjectVisibility?: string
}
