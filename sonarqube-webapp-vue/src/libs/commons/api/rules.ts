import { getJSON } from '@/libs/shared/utils/request'

export interface Rule {
  key: string
  name: string
  severity: string
  type: string
  htmlDescription?: string
  htmlNote?: string
  tags?: string[]
  lang?: string
  langName?: string
}

export function getRuleDetails(ruleKey: string, actives?: string): Promise<Rule> {
  return getJSON<Rule>('/api/rules/show', { key: ruleKey, actives })
}

export function searchRules(data: {
  languages?: string
  q?: string
  p?: number
  ps?: number
  repositories?: string
  severities?: string
  statuses?: string
  tags?: string
  types?: string
}): Promise<{
  rules: Rule[]
  total: number
  p: number
  ps: number
}> {
  return getJSON('/api/rules/search', data)
}
