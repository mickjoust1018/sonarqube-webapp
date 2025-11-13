import { getJSON } from '@/libs/shared/utils/request'
import type { CurrentUser } from '../types/users'

export function getCurrentUser(): Promise<CurrentUser> {
  return getJSON<CurrentUser>('/api/users/current')
}
