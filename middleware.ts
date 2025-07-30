import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { apiPermissionMiddleware, authMiddleware } from './lib/middleware'
import { verifyToken } from './lib/auth'

export const runtime = 'nodejs'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 静态资源和公开路径不需要认证
  if (
    pathname.startsWith('/_next')
    || pathname.startsWith('/static')
    || pathname.startsWith('/favicon')
    || pathname.endsWith('.js')
    || pathname.endsWith('.css')
    || pathname.endsWith('.png')
    || pathname.endsWith('.jpg')
    || pathname.endsWith('.jpeg')
    || pathname.endsWith('.gif')
    || pathname.endsWith('.svg')
  )
    return NextResponse.next()

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
    console.log('🌐 [主中间件] API路由处理:', pathname)
    console.log('🌐 [主中间件] 是否为公开API:', isPublicApi)

    const response = NextResponse.next()

    // 如果不是公开 API，需要认证
    if (!isPublicApi) {
      console.log('🌐 [主中间件] 非公开API，开始认证检查')
      // 认证检查
      const authResult = await authMiddleware(request)
      if (authResult) {
        console.log('🌐 [主中间件] 认证失败，返回认证错误')
        return authResult
      }

      console.log('🌐 [主中间件] 认证成功，开始权限检查')
      // API 权限检查
      const permissionResult = await apiPermissionMiddleware(request)
      if (permissionResult) {
        console.log('🌐 [主中间件] 权限检查失败')
        return permissionResult
      }

      console.log('🌐 [主中间件] 权限检查通过')
    }
    else {
      console.log('🌐 [主中间件] 公开API，跳过认证检查')
    }

    // 记录审计日志（在响应后异步执行）
    response.headers.set('x-audit-log', 'true')

    console.log('🌐 [主中间件] API请求处理完成')
    return response
  }

  // 页面路由处理
  if (!isPublicPage) {
    // 检查是否已登录
    const token = request.cookies.get('token')?.value
      || request.headers.get('authorization')?.replace('Bearer ', '')

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
    }
    catch (error) {
      const loginUrl = new URL('/auth/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  // 管理员页面权限检查
  if (pathname.startsWith('/admin')) {
    const token = request.cookies.get('token')?.value
      || request.headers.get('authorization')?.replace('Bearer ', '')

    if (!token)
      return NextResponse.redirect(new URL('/auth/login', request.url))

    // 验证 token 并检查管理员权限
    try {
      const payload = await verifyToken(token)
      if (!payload) {
        const loginUrl = new URL('/auth/login', request.url)
        loginUrl.searchParams.set('redirect', pathname)
        return NextResponse.redirect(loginUrl)
      }

      // 检查是否有管理员角色
      const hasAdminRole = payload.roles.some(role =>
        role === 'admin' || role === 'super_admin',
      )

      if (!hasAdminRole) {
        // 没有管理员权限，重定向到首页并显示错误信息
        const homeUrl = new URL('/', request.url)
        homeUrl.searchParams.set('error', 'access_denied')
        return NextResponse.redirect(homeUrl)
      }
    }
    catch (error) {
      const loginUrl = new URL('/auth/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
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
