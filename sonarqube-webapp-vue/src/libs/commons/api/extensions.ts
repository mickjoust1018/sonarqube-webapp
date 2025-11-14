// 扩展 API - 从 sq-server-commons 导入
import { getExtensionStart as getExtensionStartFromCommons } from '~sq-server-commons/helpers/extensions'
import type { ExtensionStartMethod } from '~sq-server-commons/types/extension'

export function getExtensionStart(key: string): Promise<ExtensionStartMethod | undefined> {
  return getExtensionStartFromCommons(key)
}

export type { ExtensionStartMethod } from '~sq-server-commons/types/extension'
