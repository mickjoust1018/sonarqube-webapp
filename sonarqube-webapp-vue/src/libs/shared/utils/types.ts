/**
 * 通用类型定义
 */

export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined
}

export function omitNil<T extends Record<string, any>>(obj: T): Partial<T> {
  const result: Partial<T> = {}
  for (const key in obj) {
    if (isDefined(obj[key])) {
      result[key] = obj[key]
    }
  }
  return result
}

export interface Paging {
  pageIndex: number
  pageSize: number
  total: number
}

export interface BaseResponse<T = any> {
  data: T
  paging?: Paging
}
