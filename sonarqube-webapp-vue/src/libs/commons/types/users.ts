export interface CurrentUser {
  login: string
  name: string
  email?: string
  avatar?: string
  scmAccounts?: string[]
  groups?: string[]
  local?: boolean
  externalIdentity?: string
  externalProvider?: string
  personalOrganization?: string
  sonarLintAdSeen?: boolean
  sonarQubeCommercial?: boolean
  homepage?: {
    type: string
    component?: string
  }
}
