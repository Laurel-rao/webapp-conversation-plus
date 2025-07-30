import { NextRequest, NextResponse } from 'next/server'
import { authMiddleware, apiPermissionMiddleware, auditLogMiddleware } from './lib/middleware'

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // 静态资源和公开路径不需要认证
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/static') ||
        pathname.startsWith('/favicon') ||
        pathname.endsWith('.js') ||
        pathname.endsWith('.css') ||
        pathname.endsWith('.png') ||
        pathname.endsWith('.jpg') ||
        pathname.endsWith('.jpeg') ||
        pathname.endsWith('.gif') ||
        pathname.endsWith('.svg')
    ) {
        return NextResponse.next()
    }

    // 公开的 API 路径
    const publicApiPaths = [
        '/api/auth/login',
        '/api/auth/register',
        '/api/auth/refresh',
        '/api/chat-messages',
        '/api/conversations',
        '/api/messages',
        '/api/parameters',
    ]

    // 公开的页面路径
    const publicPagePaths = [
        '/auth/login',
        '/auth/register',
        '/', // 首页允许未登录访问
    ]

    const isPublicApi = publicApiPaths.some(path => pathname.startsWith(path))
    const isPublicPage = publicPagePaths.includes(pathname)
    const isApiRoute = pathname.startsWith('/api')

    // API 路由处理
    if (isApiRoute) {
        let response = NextResponse.next()

        // 如果不是公开 API，需要认证
        if (!isPublicApi) {
            // 认证检查
            const authResult = await authMiddleware(request)
            if (authResult) return authResult

            // API 权限检查
            const permissionResult = await apiPermissionMiddleware(request)
            if (permissionResult) return permissionResult
        }

        // 记录审计日志（在响应后异步执行）
        response.headers.set('x-audit-log', 'true')

        return response
    }

    // 页面路由处理
    if (!isPublicPage) {
        // 检查是否已登录
        const token = request.cookies.get('token')?.value ||
            request.headers.get('authorization')?.replace('Bearer ', '')

        if (!token) {
            // 重定向到登录页
            const loginUrl = new URL('/auth/login', request.url)
            loginUrl.searchParams.set('redirect', pathname)
            return NextResponse.redirect(loginUrl)
        }

        // 验证 token（简化版，实际应用中可以更复杂）
        try {
            // 这里可以添加 token 验证逻辑
            // 如果 token 无效，重定向到登录页
        } catch (error) {
            const loginUrl = new URL('/auth/login', request.url)
            loginUrl.searchParams.set('redirect', pathname)
            return NextResponse.redirect(loginUrl)
        }
    }

    // 管理员页面权限检查
    if (pathname.startsWith('/admin')) {
        const token = request.cookies.get('token')?.value ||
            request.headers.get('authorization')?.replace('Bearer ', '')

        if (!token) {
            return NextResponse.redirect(new URL('/auth/login', request.url))
        }

        // 这里可以添加管理员权限检查
        // 如果不是管理员，重定向或返回 403
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
}