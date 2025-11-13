import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getCurrentUser } from '@/libs/commons/api/users'
import { getAvailableFeatures } from '@/libs/commons/api/features'
import { getGlobalNavigation } from '@/libs/commons/api/navigation'
import { getValue } from '@/libs/commons/api/settings'
import { loadL10nBundle } from '@/libs/shared/utils/i18n'
import type { CurrentUser } from '@/libs/commons/types/users'
import type { AppState } from '@/libs/commons/types/appstate'
import { SettingsKey } from '@/libs/commons/types/settings'

export const useAppStore = defineStore('app', () => {
  const currentUser = ref<CurrentUser | null>(null)
  const appState = ref<AppState | null>(null)
  const availableFeatures = ref<string[]>([])
  const l10nBundle = ref<Record<string, string>>({})
  const initialized = ref(false)

  async function initApp() {
    try {
      // 检查是否是主应用
      if (!isMainApp()) {
        initialized.value = true
        return
      }

      // 获取全局导航
      const navigation = await getGlobalNavigation().catch(() => undefined)
      appState.value = navigation as AppState

      // 并行加载数据
      const [bundle, user, features, architectureOptIn] = await Promise.all([
        loadL10nBundle(appState.value),
        getCurrentUser(),
        getAvailableFeatures(),
        getValue({ key: SettingsKey.DesignAndArchitecture }),
      ])

      l10nBundle.value = bundle
      currentUser.value = user
      availableFeatures.value = features || []

      initialized.value = true
    } catch (error) {
      console.error('Application failed to start', error)
      throw error
    }
  }

  function isMainApp(): boolean {
    const { pathname } = window.location
    const baseUrl = window.baseUrl || ''

    return (
      (window.serverStatus || 'UP') === 'UP' &&
      !pathname.startsWith(`${baseUrl}/sessions`) &&
      !pathname.startsWith(`${baseUrl}/maintenance`) &&
      !pathname.startsWith(`${baseUrl}/setup`) &&
      !pathname.startsWith(`${baseUrl}/formatting/help`)
    )
  }

  return {
    currentUser,
    appState,
    availableFeatures,
    l10nBundle,
    initialized,
    initApp,
  }
})
