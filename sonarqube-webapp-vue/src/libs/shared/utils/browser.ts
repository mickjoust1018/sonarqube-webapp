/**
 * 浏览器相关工具函数
 */

export function initAppVariables() {
  // 设置滚动条宽度
  const outer = document.createElement('div')
  outer.style.visibility = 'hidden'
  outer.style.width = '100px'
  outer.style.setProperty('msOverflowStyle', 'scrollbar')

  document.body.appendChild(outer)

  const widthNoScroll = outer.offsetWidth
  outer.style.overflow = 'scroll'

  const inner = document.createElement('div')
  inner.style.width = '100%'
  outer.appendChild(inner)

  const widthWithScroll = inner.offsetWidth

  if (outer.parentNode) {
    outer.parentNode.removeChild(outer)
  }

  document.documentElement.style.setProperty('--sbw', `${widthNoScroll - widthWithScroll}px`)
}

export function getBaseUrl(): string {
  return window.baseUrl || ''
}

export function getSystemStatus(): string {
  return window.serverStatus || 'UP'
}
