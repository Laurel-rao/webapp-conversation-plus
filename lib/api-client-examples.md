# API客户端使用示例

## 基本用法

```typescript
import { api, showSuccessToast, showErrorToast } from '@/lib/api-client'

// GET 请求
const users = await api.get('/api/users')

// POST 请求
const newUser = await api.post('/api/users', {
  name: 'John Doe',
  email: 'john@example.com'
})

// PUT 请求
const updatedUser = await api.put('/api/users/123', {
  name: 'Jane Doe'
})

// DELETE 请求
await api.delete('/api/users/123')

// 文件上传
const formData = new FormData()
formData.append('file', file)
const result = await api.upload('/api/upload', formData)

// 文件下载
await api.download('/api/files/export', 'export.csv')
```

## 错误处理

API客户端会自动处理所有HTTP错误状态码：

- **400**: 请求参数错误
- **401**: 自动跳转到登录页面
- **403**: 权限不足
- **404**: 资源不存在
- **409**: 数据冲突
- **429**: 请求过于频繁
- **500**: 服务器错误
- **502/503**: 服务不可用

## 成功/错误提示

```typescript
// 手动显示成功提示
showSuccessToast('操作成功')

// 手动显示错误提示
showErrorToast('操作失败')
```

## 自定义配置

```typescript
import { ApiClient } from '@/lib/api-client'

// 创建自定义API客户端
const customApi = new ApiClient('https://api.example.com')

// 使用自定义headers
const response = await api.get('/api/data', {
  headers: {
    'Custom-Header': 'value'
  }
})
```

## 类型安全

```typescript
interface User {
  id: string
  name: string
  email: string
}

// 带类型的请求
const user = await api.get<User>('/api/users/123')
const users = await api.get<User[]>('/api/users')
```

## 注意事项

1. 所有请求自动包含 `credentials: 'include'` 用于Cookie认证
2. 401错误会自动清除本地存储并跳转到登录页
3. 错误信息会自动显示Toast提示
4. 支持文件上传和下载
5. 自动处理JSON响应和错误