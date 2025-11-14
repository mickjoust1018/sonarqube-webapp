import { getJSON } from '@/libs/shared/utils/request'
import type { Task } from '../types/components'

export interface TasksResponse {
  current?: Task
  queue: Task[]
}

export function getTasksForComponent(component: string): Promise<TasksResponse> {
  return getJSON<TasksResponse>(`/api/ce/component?component=${component}`)
}
