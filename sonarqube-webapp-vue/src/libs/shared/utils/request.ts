import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router'
import { getMockResponse } from '../mocks/mockInterceptor'

// 扩展 Window 接口
declare global {
  interface Window {
    baseUrl?: string
    serverStatus?: string
  }
}

// 是否启用 mock（可以通过环境变量控制）
const ENABLE_MOCK = import.meta.env.DEV && import.meta.env.VITE_ENABLE_MOCK !== 'false'

// 延迟函数，模拟网络延迟
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// 创建 axios 实例
const apiClient: AxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器
apiClient.interceptors.request.use(
  async (config) => {
    // Mock 数据拦截
    if (ENABLE_MOCK && config.url) {
      const url = config.url
      const method = config.method?.toLowerCase() || 'get'
      const mockResponse = getMockResponse(url, method, config.params || {}, config.data || {})

      if (mockResponse !== null) {
        // 模拟网络延迟
        await delay(200 + Math.random() * 300)
        // 返回一个特殊的错误，在响应拦截器中处理
        return Promise.reject({
          __isMock: true,
          mockData: mockResponse,
          originalConfig: config,
        })
      }
    }

    // 可以在这里添加 token 等认证信息
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  (error) => {
    // 处理 Mock 数据
    if (error.__isMock) {
      return Promise.resolve({
        data: error.mockData,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: error.originalConfig,
      })
    }

    if (error.response) {
      const { status, data } = error.response

      switch (status) {
        case 401:
          // 未授权，跳转到登录页
          router.push('/sessions/new')
          break
        case 403:
          ElMessage.error('没有权限访问该资源')
          break
        case 404:
          ElMessage.error('请求的资源不存在')
          break
        case 500:
          ElMessage.error('服务器内部错误')
          break
        default:
          ElMessage.error(data?.message || '请求失败')
      }
    } else {
      ElMessage.error('网络错误，请检查网络连接')
    }

    return Promise.reject(error)
  }
)

export default apiClient

export function get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
  return apiClient.get(url, config).then((res) => res.data)
}

export function post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
  return apiClient.post(url, data, config).then((res) => res.data)
}

export function put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
  return apiClient.put(url, data, config).then((res) => res.data)
}

export function del<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
  return apiClient.delete(url, config).then((res) => res.data)
}

export function getJSON<T = any>(url: string, params?: any): Promise<T> {
  return apiClient.get(url, { params }).then((res) => res.data)
}

export function postJSON<T = any>(url: string, data?: any): Promise<T> {
  return apiClient.post(url, data).then((res) => res.data)
}
