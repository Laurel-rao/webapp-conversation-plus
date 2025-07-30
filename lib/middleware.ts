import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { verifyToken } from './auth'
import { API_PERMISSIONS } from './permissions'

export type AuthenticatedRequest = {
  user?: {
    id: string
    email: string
    roles: string[]
    permissions: string[]
  }
} & NextRequest

// 认证中间件
export async function authMiddleware(request: NextRequest): Promise<NextResponse | null> {
  console.log('🛡️ [认证中间件] 开始认证检查, 路径:', request.nextUrl.pathname)

  const token = getTokenFromRequest(request)

  if (!token) {
    console.log('🛡️ [认证中间件] 未提供token, 返回401')
    return NextResponse.json(
      { error: 'Unauthorized', message: 'No token provided' },
      { status: 401 },
    )
  }

  console.log('🛡️ [认证中间件] 开始验证token')
  const payload = await verifyToken(token)
  if (!payload) {
    console.log('🛡️ [认证中间件] Token验证失败, 返回401')
    return NextResponse.json(
      { error: 'Unauthorized', message: 'Invalid token' },
      { status: 401 },
    )
  }

  console.log('🛡️ [认证中间件] Token验证成功, 用户ID:', payload.userId)

  // 从token中提取用户信息（避免在中间件中查询数据库）
  const user = {
    id: payload.userId,
    email: payload.email,
    roles: payload.roles,
    permissions: [] // 权限在需要时由具体API路由查询
  }

  console.log('🛡️ [认证中间件] 用户信息提取成功:', {
    id: user.id,
    email: user.email,
    roles: user.roles,
  })

    // 将用户信息添加到请求中
    ; (request as AuthenticatedRequest).user = user

  console.log('🛡️ [认证中间件] 认证检查完成, 允许继续执行')
  return null // 继续执行
}

// 权限检查中间件
export async function permissionMiddleware(
  request: NextRequest,
  requiredPermission?: string,
): Promise<NextResponse | null> {
  if (!requiredPermission)
    return null

  const user = (request as AuthenticatedRequest).user
  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'User not authenticated' },
      { status: 401 },
    )
  }

  // 超级管理员拥有所有权限
  if (user.roles.includes('super_admin'))
    return null

  if (!user.permissions.includes(requiredPermission)) {
    return NextResponse.json(
      { error: 'Forbidden', message: 'Insufficient permissions' },
      { status: 403 },
    )
  }

  return null
}

// 角色检查中间件
export async function roleMiddleware(
  request: NextRequest,
  requiredRoles: string[],
): Promise<NextResponse | null> {
  const user = (request as AuthenticatedRequest).user
  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'User not authenticated' },
      { status: 401 },
    )
  }

  const hasRole = requiredRoles.some(role => user.roles.includes(role))
  if (!hasRole) {
    return NextResponse.json(
      { error: 'Forbidden', message: 'Insufficient role permissions' },
      { status: 403 },
    )
  }

  return null
}

// API 权限自动检查中间件
export async function apiPermissionMiddleware(request: NextRequest): Promise<NextResponse | null> {
  const { pathname } = new URL(request.url)
  const method = request.method

  // 构建权限键
  const permissionKey = `${method} ${pathname}` as keyof typeof API_PERMISSIONS
  const requiredPermission = API_PERMISSIONS[permissionKey]

  // 如果没有配置权限要求，则允许访问
  if (!requiredPermission)
    return null

  return permissionMiddleware(request, requiredPermission)
}

// 审计日志中间件
export async function auditLogMiddleware(
  request: NextRequest,
  response: NextResponse,
): Promise<void> {
  const user = (request as AuthenticatedRequest).user
  const { pathname, search } = new URL(request.url)
  const method = request.method

  // 获取客户端 IP
  const ip = getClientIP(request)
  const userAgent = request.headers.get('user-agent') || ''

  try {
    // 在中间件中不直接使用 Prisma，避免 Edge Runtime 兼容性问题
    // 审计日志将在各个 API 路由中单独处理
    console.log('🔍 [审计日志] API调用:', {
      userId: user?.id,
      path: pathname + search,
      method,
      status: response.status,
      ip,
      userAgent: userAgent.substring(0, 50) + '...'
    })
  }
  catch (error) {
    console.error('Failed to log audit trail:', error)
  }
}

// 工具函数：从请求中获取 token
function getTokenFromRequest(request: NextRequest): string | null {
  console.log('🍪 [Token获取] 开始从请求中获取token')

  // 从 Authorization header 获取
  const authHeader = request.headers.get('authorization')
  console.log('🍪 [Token获取] Authorization header:', authHeader ? `${authHeader.substring(0, 30)}...` : 'null')

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const headerToken = authHeader.substring(7)
    console.log('🍪 [Token获取] 从Authorization header获取到token (前30字符):', `${headerToken.substring(0, 30)}...`)
    return headerToken
  }

  // 从 cookie 获取
  const tokenCookie = request.cookies.get('token')
  console.log('🍪 [Token获取] Cookie中的token:', tokenCookie ? `${tokenCookie.value.substring(0, 30)}...` : 'null')

  if (tokenCookie) {
    console.log('🍪 [Token获取] 从Cookie获取到token (前30字符):', `${tokenCookie.value.substring(0, 30)}...`)
    return tokenCookie.value
  }

  console.log('🍪 [Token获取] 未找到token')
  return null
}

// 工具函数：获取客户端 IP
function getClientIP(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]
    || request.headers.get('x-real-ip')
    || request.headers.get('cf-connecting-ip')
    || '127.0.0.1'
  )
}

// 工具函数：获取请求体
async function getRequestBody(request: NextRequest): Promise<any> {
  try {
    return await request.json()
  }
  catch {
    return null
  }
}

// 工具函数：获取响应体
async function getResponseBody(response: NextResponse): Promise<any> {
  try {
    return await response.json()
  }
  catch {
    return null
  }
}

// 工具函数：判断是否为重要操作
function isImportantAction(method: string, pathname: string): boolean {
  // POST, PUT, DELETE 操作都被认为是重要操作
  if (['POST', 'PUT', 'DELETE'].includes(method))
    return true

  // 特定的 GET 操作也可能被认为是重要的
  const importantPaths = ['/api/auth/login', '/api/auth/logout', '/api/users/me']
  return importantPaths.some(path => pathname.includes(path))
}

// 工具函数：从路径中提取资源名称
function extractResourceFromPath(pathname: string): string {
  const parts = pathname.split('/')
  return parts[2] || 'unknown' // /api/users/123 -> users
}

// 组合中间件
export function createAuthenticatedMiddleware(
  requiredPermission?: string,
  requiredRoles?: string[],
) {
  return async (request: NextRequest): Promise<NextResponse | null> => {
    // 1. 认证检查
    const authResult = await authMiddleware(request)
    if (authResult)
      return authResult

    // 2. 权限检查
    if (requiredPermission) {
      const permResult = await permissionMiddleware(request, requiredPermission)
      if (permResult)
        return permResult
    }

    // 3. 角色检查
    if (requiredRoles && requiredRoles.length > 0) {
      const roleResult = await roleMiddleware(request, requiredRoles)
      if (roleResult)
        return roleResult
    }

    return null // 所有检查通过
  }
}
