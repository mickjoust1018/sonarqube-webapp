import { getJSON } from '@/libs/shared/utils/request'

export interface SettingValue {
  key: string
  value: string
}

export function getValue(params: { key: string }): Promise<SettingValue> {
  return getJSON<SettingValue>('/api/settings/values', params)
}
