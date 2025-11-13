import { getJSON } from '@/libs/shared/utils/request'
import type { AppState } from '../types/appstate'

export function getGlobalNavigation(): Promise<AppState> {
  return getJSON<AppState>('/api/navigation/global')
}
