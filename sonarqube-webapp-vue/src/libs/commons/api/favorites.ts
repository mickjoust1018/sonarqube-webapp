import { postJSON, del } from '@/libs/shared/utils/request'

export function addFavorite(data: { component: string }): Promise<void> {
  return postJSON<void>('/api/favorites/add', data)
}

export function removeFavorite(data: { component: string }): Promise<void> {
  return postJSON<void>('/api/favorites/remove', data)
}
