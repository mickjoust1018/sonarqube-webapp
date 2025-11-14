/**
 * 国际化工具函数
 */

export async function loadL10nBundle(_appState?: any): Promise<Record<string, string>> {
  // 这里应该从后端加载翻译文件
  // 暂时返回空对象，实际应该调用 API
  return {}
}

export function translate(key: string, _values?: Record<string, any>): string {
  // 这里应该从 i18n store 获取翻译
  // 暂时返回 key
  return key
}
