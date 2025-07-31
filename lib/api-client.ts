'use client'

// API响应类型
interface ApiResponse<T = any> {
    data?: T
    error?: string
    message?: string
}

// 错误处理函数
const handleApiError = (status: number, data: any, url: string) => {
    let message = data?.error || data?.message || '请求失败'

    switch (status) {
        case 400:
            message = data?.error || '请求参数错误'
            break
        case 401:
            message = '未授权访问，请重新登录'
            // 清除本地存储的用户信息
            if (typeof window !== 'undefined') {
                localStorage.removeItem('user')
                // 跳转到登录页面
                window.location.href = `/auth/login?redirect=${encodeURIComponent(window.location.pathname)}`
            }
            return
        case 403:
            message = data?.error || '权限不足'
            break
        case 404:
            message = data?.error || '请求的资源不存在'
            break
        case 409:
            message = data?.error || '数据冲突'
            break
        case 429:
            message = data?.error || '请求过于频繁，请稍后重试'
            break
        case 500:
            message = data?.error || '服务器内部错误'
            break
        case 502:
            message = '服务暂时不可用'
            break
        case 503:
            message = '服务维护中'
            break
        default:
            message = data?.error || data?.message || `请求失败 (${status})`
    }

    // 显示错误提示
    showErrorToast(message)
}

// 错误提示函数
const showErrorToast = (message: string) => {
    // 创建或获取toast容器
    let toastContainer = document.getElementById('api-toast-container')
    if (!toastContainer) {
        toastContainer = document.createElement('div')
        toastContainer.id = 'api-toast-container'
        toastContainer.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      pointer-events: none;
    `
        document.body.appendChild(toastContainer)
    }

    // 创建toast元素
    const toast = document.createElement('div')
    toast.style.cssText = `
    background: rgba(239, 68, 68, 0.9);
    color: white;
    padding: 12px 16px;
    border-radius: 8px;
    margin-bottom: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    backdrop-filter: blur(8px);
    pointer-events: auto;
    transform: translateX(100%);
    transition: transform 0.3s ease-out;
    max-width: 400px;
    word-break: break-word;
  `

    toast.textContent = message
    toastContainer.appendChild(toast)

    // 动画显示
    setTimeout(() => {
        toast.style.transform = 'translateX(0)'
    }, 10)

    // 自动隐藏
    setTimeout(() => {
        toast.style.transform = 'translateX(100%)'
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast)
            }
        }, 300)
    }, 4000)
}

// 成功提示函数
const showSuccessToast = (message: string) => {
    // 创建或获取toast容器
    let toastContainer = document.getElementById('api-toast-container')
    if (!toastContainer) {
        toastContainer = document.createElement('div')
        toastContainer.id = 'api-toast-container'
        toastContainer.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      pointer-events: none;
    `
        document.body.appendChild(toastContainer)
    }

    // 创建toast元素
    const toast = document.createElement('div')
    toast.style.cssText = `
    background: rgba(34, 197, 94, 0.9);
    color: white;
    padding: 12px 16px;
    border-radius: 8px;
    margin-bottom: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    backdrop-filter: blur(8px);
    pointer-events: auto;
    transform: translateX(100%);
    transition: transform 0.3s ease-out;
    max-width: 400px;
    word-break: break-word;
  `

    toast.textContent = message
    toastContainer.appendChild(toast)

    // 动画显示
    setTimeout(() => {
        toast.style.transform = 'translateX(0)'
    }, 10)

    // 自动隐藏
    setTimeout(() => {
        toast.style.transform = 'translateX(100%)'
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast)
            }
        }, 300)
    }, 3000)
}

// API客户端类
class ApiClient {
    private baseURL: string

    constructor(baseURL: string = '') {
        this.baseURL = baseURL
    }

    private async handleResponse<T>(response: Response, url: string): Promise<T> {
        const contentType = response.headers.get('content-type')
        let data: any

        try {
            if (contentType && contentType.includes('application/json')) {
                data = await response.json()
            } else {
                data = await response.text()
            }
        } catch (error) {
            data = null
        }

        if (!response.ok) {
            handleApiError(response.status, data, url)
            throw new Error(data?.error || data?.message || `HTTP ${response.status}`)
        }

        return data
    }

    async get<T = any>(url: string, options: RequestInit = {}): Promise<T> {
        const response = await fetch(`${this.baseURL}${url}`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        })

        return this.handleResponse<T>(response, url)
    }

    async post<T = any>(url: string, body?: any, options: RequestInit = {}): Promise<T> {
        const response = await fetch(`${this.baseURL}${url}`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            body: body ? JSON.stringify(body) : undefined,
            ...options,
        })

        return this.handleResponse<T>(response, url)
    }

    async put<T = any>(url: string, body?: any, options: RequestInit = {}): Promise<T> {
        const response = await fetch(`${this.baseURL}${url}`, {
            method: 'PUT',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            body: body ? JSON.stringify(body) : undefined,
            ...options,
        })

        return this.handleResponse<T>(response, url)
    }

    async delete<T = any>(url: string, options: RequestInit = {}): Promise<T> {
        const response = await fetch(`${this.baseURL}${url}`, {
            method: 'DELETE',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        })

        return this.handleResponse<T>(response, url)
    }

    async patch<T = any>(url: string, body?: any, options: RequestInit = {}): Promise<T> {
        const response = await fetch(`${this.baseURL}${url}`, {
            method: 'PATCH',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            body: body ? JSON.stringify(body) : undefined,
            ...options,
        })

        return this.handleResponse<T>(response, url)
    }

    // 文件上传
    async upload<T = any>(url: string, formData: FormData, options: RequestInit = {}): Promise<T> {
        const response = await fetch(`${this.baseURL}${url}`, {
            method: 'POST',
            credentials: 'include',
            body: formData,
            ...options,
        })

        return this.handleResponse<T>(response, url)
    }

    // 下载文件
    async download(url: string, filename?: string, options: RequestInit = {}): Promise<void> {
        const response = await fetch(`${this.baseURL}${url}`, {
            method: 'GET',
            credentials: 'include',
            ...options,
        })

        if (!response.ok) {
            const data = await response.text()
            handleApiError(response.status, { error: data }, url)
            throw new Error(`HTTP ${response.status}`)
        }

        const blob = await response.blob()
        const downloadUrl = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = downloadUrl
        a.download = filename || 'download'
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(downloadUrl)
        document.body.removeChild(a)
    }
}

// 创建默认的API客户端实例
export const apiClient = new ApiClient()

// 导出类供自定义使用
export { ApiClient, showSuccessToast, showErrorToast }

// 便捷的请求方法
export const api = {
    get: <T = any>(url: string, options?: RequestInit) => apiClient.get<T>(url, options),
    post: <T = any>(url: string, body?: any, options?: RequestInit) => apiClient.post<T>(url, body, options),
    put: <T = any>(url: string, body?: any, options?: RequestInit) => apiClient.put<T>(url, body, options),
    delete: <T = any>(url: string, options?: RequestInit) => apiClient.delete<T>(url, options),
    patch: <T = any>(url: string, body?: any, options?: RequestInit) => apiClient.patch<T>(url, body, options),
    upload: <T = any>(url: string, formData: FormData, options?: RequestInit) => apiClient.upload<T>(url, formData, options),
    download: (url: string, filename?: string, options?: RequestInit) => apiClient.download(url, filename, options),
}

export default api