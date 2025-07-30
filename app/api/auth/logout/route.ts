import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    // 获取 token
    const token = request.cookies.get('token')?.value
            || request.headers.get('authorization')?.replace('Bearer ', '')

    let userId: string | undefined

    if (token) {
      const payload = await verifyToken(token)
      userId = payload?.userId
    }

    // 记录登出日志
    if (userId) {
      await prisma.systemLog.create({
        data: {
          userId,
          action: 'LOGOUT',
          resource: 'auth',
          method: 'POST',
          path: '/api/auth/logout',
          status: 'SUCCESS',
        },
      })
    }

    // 创建响应
    const response = NextResponse.json({
      message: 'Logged out successfully',
    })

    // 清除 cookie
    response.cookies.set('token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
    })

    return response
  }
  catch (error) {
    console.error('Logout error:', error)

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
