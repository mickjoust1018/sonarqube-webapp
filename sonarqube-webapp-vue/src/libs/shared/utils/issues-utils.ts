import type { IssuesQuery } from '@/libs/commons/types/issues'

export function serializeQuery(query: IssuesQuery): Record<string, string | undefined> {
  const params: Record<string, string | undefined> = {}

  if (query.assigned !== undefined) {
    params.assigned = query.assigned ? 'true' : 'false'
  }
  if (query.assignees && query.assignees.length > 0) {
    params.assignees = query.assignees.join(',')
  }
  if (query.author && query.author.length > 0) {
    params.author = query.author.join(',')
  }
  if (query.componentKeys && query.componentKeys.length > 0) {
    params.componentKeys = query.componentKeys.join(',')
  }
  if (query.createdAfter) {
    params.createdAfter = query.createdAfter
  }
  if (query.createdBefore) {
    params.createdBefore = query.createdBefore
  }
  if (query.createdInLast) {
    params.createdInLast = query.createdInLast
  }
  if (query.cwe && query.cwe.length > 0) {
    params.cwe = query.cwe.join(',')
  }
  if (query.facets && query.facets.length > 0) {
    params.facets = query.facets.join(',')
  }
  if (query.issues && query.issues.length > 0) {
    params.issues = query.issues.join(',')
  }
  if (query.languages && query.languages.length > 0) {
    params.languages = query.languages.join(',')
  }
  if (query.owaspTop10 && query.owaspTop10.length > 0) {
    params.owaspTop10 = query.owaspTop10.join(',')
  }
  if (query.projects && query.projects.length > 0) {
    params.projects = query.projects.join(',')
  }
  if (query.resolutions && query.resolutions.length > 0) {
    params.resolutions = query.resolutions.join(',')
  }
  if (query.rules && query.rules.length > 0) {
    params.rules = query.rules.join(',')
  }
  if (query.severities && query.severities.length > 0) {
    params.severities = query.severities.join(',')
  }
  if (query.sonarsourceSecurity && query.sonarsourceSecurity.length > 0) {
    params.sonarsourceSecurity = query.sonarsourceSecurity.join(',')
  }
  if (query.statuses && query.statuses.length > 0) {
    params.statuses = query.statuses.join(',')
  }
  if (query.tags && query.tags.length > 0) {
    params.tags = query.tags.join(',')
  }
  if (query.types && query.types.length > 0) {
    params.types = query.types.join(',')
  }
  if (query.sort) {
    params.s = query.sort
  }

  return params
}

export function parseQuery(params: Record<string, string | string[]>): IssuesQuery {
  const query: IssuesQuery = {}

  if (params.assigned) {
    query.assigned = params.assigned === 'true'
  }
  if (params.assignees) {
    query.assignees = Array.isArray(params.assignees) ? params.assignees : params.assignees.split(',')
  }
  if (params.author) {
    query.author = Array.isArray(params.author) ? params.author : params.author.split(',')
  }
  if (params.componentKeys) {
    query.componentKeys = Array.isArray(params.componentKeys)
      ? params.componentKeys
      : params.componentKeys.split(',')
  }
  if (params.createdAfter) {
    query.createdAfter = Array.isArray(params.createdAfter) ? params.createdAfter[0] : params.createdAfter
  }
  if (params.createdBefore) {
    query.createdBefore = Array.isArray(params.createdBefore) ? params.createdBefore[0] : params.createdBefore
  }
  if (params.createdInLast) {
    query.createdInLast = Array.isArray(params.createdInLast) ? params.createdInLast[0] : params.createdInLast
  }
  if (params.cwe) {
    query.cwe = Array.isArray(params.cwe) ? params.cwe : params.cwe.split(',')
  }
  if (params.facets) {
    query.facets = Array.isArray(params.facets) ? params.facets : params.facets.split(',')
  }
  if (params.issues) {
    query.issues = Array.isArray(params.issues) ? params.issues : params.issues.split(',')
  }
  if (params.languages) {
    query.languages = Array.isArray(params.languages) ? params.languages : params.languages.split(',')
  }
  if (params.owaspTop10) {
    query.owaspTop10 = Array.isArray(params.owaspTop10) ? params.owaspTop10 : params.owaspTop10.split(',')
  }
  if (params.projects) {
    query.projects = Array.isArray(params.projects) ? params.projects : params.projects.split(',')
  }
  if (params.resolutions) {
    query.resolutions = Array.isArray(params.resolutions) ? params.resolutions : params.resolutions.split(',')
  }
  if (params.rules) {
    query.rules = Array.isArray(params.rules) ? params.rules : params.rules.split(',')
  }
  if (params.severities) {
    query.severities = Array.isArray(params.severities) ? params.severities : params.severities.split(',')
  }
  if (params.sonarsourceSecurity) {
    query.sonarsourceSecurity = Array.isArray(params.sonarsourceSecurity)
      ? params.sonarsourceSecurity
      : params.sonarsourceSecurity.split(',')
  }
  if (params.statuses) {
    query.statuses = Array.isArray(params.statuses) ? params.statuses : params.statuses.split(',')
  }
  if (params.tags) {
    query.tags = Array.isArray(params.tags) ? params.tags : params.tags.split(',')
  }
  if (params.types) {
    query.types = Array.isArray(params.types) ? params.types : params.types.split(',')
  }
  if (params.s) {
    query.sort = Array.isArray(params.s) ? params.s[0] : params.s
  }

  return query
}
