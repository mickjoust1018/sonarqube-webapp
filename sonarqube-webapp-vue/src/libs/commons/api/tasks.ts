import { getJSON, postJSON, putJSON, del } from '@/libs/shared/utils/request'
import type {
  TasksResponse,
  TasksQuery,
  ScanTask,
  CreateTaskParams,
  UpdateTaskParams,
} from '../types/tasks'

// 获取任务列表
export function getTasks(query?: TasksQuery): Promise<TasksResponse> {
  return getJSON<TasksResponse>('/api/tasks/search', query)
}

// 获取任务详情
export function getTask(taskId: string): Promise<ScanTask> {
  return getJSON<ScanTask>(`/api/tasks/${taskId}`)
}

// 创建任务
export function createTask(params: CreateTaskParams): Promise<ScanTask> {
  return postJSON<ScanTask>('/api/tasks/create', params)
}

// 更新任务
export function updateTask(taskId: string, params: UpdateTaskParams): Promise<ScanTask> {
  return putJSON<ScanTask>(`/api/tasks/${taskId}`, params)
}

// 删除任务
export function deleteTask(taskId: string): Promise<void> {
  return del(`/api/tasks/${taskId}`)
}

// 取消任务
export function cancelTask(taskId: string): Promise<ScanTask> {
  return postJSON<ScanTask>(`/api/tasks/${taskId}/cancel`)
}

// 重新执行任务
export function retryTask(taskId: string): Promise<ScanTask> {
  return postJSON<ScanTask>(`/api/tasks/${taskId}/retry`)
}

// 获取项目的任务列表
export function getProjectTasks(
  projectKey: string,
  query?: Omit<TasksQuery, 'projectKey'>
): Promise<TasksResponse> {
  return getJSON<TasksResponse>(`/api/projects/${projectKey}/tasks`, query)
}
