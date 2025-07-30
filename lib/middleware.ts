import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, getUserWithPermissions } from './auth'
import { API_PERMISSIONS } from './permissions'
import { prisma } from './prisma'

export interface AuthenticatedRequest extends NextRequest {
    user?: {
        id: string
        email: string
        roles: string[]
        permissions: string[]
    }
}

// 认证中间件
export async function authMiddleware(request: NextRequest): Promise<NextResponse | null> {
    const token = getTokenFromRequest(request)

    if (!token) {
        return NextResponse.json(
            { error: 'Unauthorized', message: 'No token provided' },
            { status: 401 }
        )
    }

    const payload = verifyToken(token)
    if (!payload) {
        return NextResponse.json(
            { error: 'Unauthorized', message: 'Invalid token' },
            { status: 401 }
        )
    }

    // 获取用户详细信息
    const user = await getUserWithPermissions(payload.userId)
    if (!user) {
        return NextResponse.json(
            { error: 'Unauthorized', message: 'User not found' },
            { status: 401 }
        )
    }

    // 将用户信息添加到请求中
    ; (request as AuthenticatedRequest).user = user

    return null // 继续执行
}

// 权限检查中间件
export async function permissionMiddleware(
    request: NextRequest,
    requiredPermission?: string
): Promise<NextResponse | null> {
    if (!requiredPermission) return null

    const user = (request as AuthenticatedRequest).user
    if (!user) {
        return NextResponse.json(
            { error: 'Unauthorized', message: 'User not authenticated' },
            { status: 401 }
        )
    }

    // 超级管理员拥有所有权限
    if (user.roles.includes('super_admin')) {
        return null
    }

    if (!user.permissions.includes(requiredPermission)) {
        return NextResponse.json(
            { error: 'Forbidden', message: 'Insufficient permissions' },
            { status: 403 }
        )
    }

    return null
}

// 角色检查中间件
export async function roleMiddleware(
    request: NextRequest,
    requiredRoles: string[]
): Promise<NextResponse | null> {
    const user = (request as AuthenticatedRequest).user
    if (!user) {
        return NextResponse.json(
            { error: 'Unauthorized', message: 'User not authenticated' },
            { status: 401 }
        )
    }

    const hasRole = requiredRoles.some(role => user.roles.includes(role))
    if (!hasRole) {
        return NextResponse.json(
            { error: 'Forbidden', message: 'Insufficient role permissions' },
            { status: 403 }
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
    if (!requiredPermission) return null

    return permissionMiddleware(request, requiredPermission)
}

// 审计日志中间件
export async function auditLogMiddleware(
    request: NextRequest,
    response: NextResponse
): Promise<void> {
    const user = (request as AuthenticatedRequest).user
    const { pathname, search } = new URL(request.url)
    const method = request.method

    // 获取客户端 IP
    const ip = getClientIP(request)
    const userAgent = request.headers.get('user-agent') || ''

    try {
        // 记录 API 调用日志
        await prisma.apiLog.create({
            data: {
                userId: user?.id,
                path: pathname + search,
                method,
                statusCode: response.status,
                ip,
                userAgent,
                // 注意：在生产环境中，可能不想记录敏感的请求/响应体
                requestBody: method !== 'GET' ? await getRequestBody(request) : undefined,
                responseBody: response.status >= 400 ? await getResponseBody(response) : undefined,
                errorMessage: response.status >= 400 ? 'API Error' : undefined,
            }
        })

        // 记录重要操作的系统日志
        if (isImportantAction(method, pathname)) {
            await prisma.systemLog.create({
                data: {
                    userId: user?.id,
                    action: `${method} ${pathname}`,
                    resource: extractResourceFromPath(pathname),
                    method,
                    path: pathname,
                    ip,
                    userAgent,
                    status: response.status >= 400 ? 'ERROR' : 'SUCCESS',
                    errorMessage: response.status >= 400 ? 'Operation failed' : undefined,
                }
            })
        }
    } catch (error) {
        console.error('Failed to log audit trail:', error)
    }
}

// 工具函数：从请求中获取 token
function getTokenFromRequest(request: NextRequest): string | null {
    // 从 Authorization header 获取
    const authHeader = request.headers.get('authorization')
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.substring(7)
    }

    // 从 cookie 获取
    const tokenCookie = request.cookies.get('token')
    if (tokenCookie) {
        return tokenCookie.value
    }

    return null
}

// 工具函数：获取客户端 IP
function getClientIP(request: NextRequest): string {
    return (
        request.headers.get('x-forwarded-for')?.split(',')[0] ||
        request.headers.get('x-real-ip') ||
        request.headers.get('cf-connecting-ip') ||
        '127.0.0.1'
    )
}

// 工具函数：获取请求体
async function getRequestBody(request: NextRequest): Promise<any> {
    try {
        return await request.json()
    } catch {
        return null
    }
}

// 工具函数：获取响应体
async function getResponseBody(response: NextResponse): Promise<any> {
    try {
        return await response.json()
    } catch {
        return null
    }
}

// 工具函数：判断是否为重要操作
function isImportantAction(method: string, pathname: string): boolean {
    // POST, PUT, DELETE 操作都被认为是重要操作
    if (['POST', 'PUT', 'DELETE'].includes(method)) return true

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
    requiredRoles?: string[]
) {
    return async (request: NextRequest): Promise<NextResponse | null> => {
        // 1. 认证检查
        const authResult = await authMiddleware(request)
        if (authResult) return authResult

        // 2. 权限检查
        if (requiredPermission) {
            const permResult = await permissionMiddleware(request, requiredPermission)
            if (permResult) return permResult
        }

        // 3. 角色检查
        if (requiredRoles && requiredRoles.length > 0) {
            const roleResult = await roleMiddleware(request, requiredRoles)
            if (roleResult) return roleResult
        }

        return null // 所有检查通过
    }
}