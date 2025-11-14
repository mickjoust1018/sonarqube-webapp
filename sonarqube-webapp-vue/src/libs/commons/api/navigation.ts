import { getJSON } from '@/libs/shared/utils/request'
import type { AppState } from '../types/appstate'
import type { Component } from '../types/components'

export interface NavigationComponent
  extends Omit<Component, 'alm' | 'qualifier' | 'leakPeriodDate' | 'path' | 'tags'> {}

export interface Extension {
  key: string
  name: string
}

export function getGlobalNavigation(): Promise<AppState> {
  return getJSON<AppState>('/api/navigation/global')
}

export function getComponentNavigation(params: {
  component: string
  branch?: string
  pullRequest?: string
}): Promise<NavigationComponent> {
  return getJSON<NavigationComponent>('/api/navigation/component', params)
}

export function getSettingsNavigation(): Promise<{
  extensions: Extension[]
  showUpdateCenter: boolean
}> {
  return getJSON('/api/navigation/settings')
}
