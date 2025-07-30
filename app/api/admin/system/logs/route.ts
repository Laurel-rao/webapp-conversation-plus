import type { NextRequest } from 'next/server'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createAuthenticatedMiddleware } from '@/lib/middleware'
import { PERMISSIONS } from '@/lib/permissions'

// 获取系统日志
export async function GET(request: NextRequest) {
  try {
    // 权限检查
    const authResult = await createAuthenticatedMiddleware(PERMISSIONS.SYSTEM_LOG)(request)
    if (authResult)
      return authResult

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const action = searchParams.get('action')
    const status = searchParams.get('status')
    const userId = searchParams.get('userId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const skip = (page - 1) * limit

    // 构建查询条件
    const where: any = {}

    if (action)
      where.action = { contains: action, mode: 'insensitive' }

    if (status)
      where.status = status

    if (userId)
      where.userId = userId

    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate)
        where.createdAt.gte = new Date(startDate)

      if (endDate)
        where.createdAt.lte = new Date(endDate)
    }

    const [logs, total] = await Promise.all([
      prisma.systemLog.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              nickname: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.systemLog.count({ where }),
    ])

    return NextResponse.json({
      logs: logs.map(log => ({
        id: log.id,
        action: log.action,
        resource: log.resource,
        method: log.method,
        path: log.path,
        ip: log.ip,
        userAgent: log.userAgent,
        status: log.status,
        errorMessage: log.errorMessage,
        duration: log.duration,
        user: log.user,
        createdAt: log.createdAt,
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  }
  catch (error) {
    console.error('Get system logs error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}

// 清理系统日志
export async function DELETE(request: NextRequest) {
  try {
    // 权限检查
    const authResult = await createAuthenticatedMiddleware(PERMISSIONS.SYSTEM_LOG)(request)
    if (authResult)
      return authResult

    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '30')

    // 删除指定天数之前的日志
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)

    const deleteResult = await prisma.systemLog.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate,
        },
      },
    })

    // 记录操作日志
    const currentUser = (request as any).user
    await prisma.systemLog.create({
      data: {
        userId: currentUser.id,
        action: 'CLEANUP_SYSTEM_LOGS',
        resource: 'system_log',
        method: 'DELETE',
        path: '/api/admin/system/logs',
        status: 'SUCCESS',
        requestData: { days, deletedCount: deleteResult.count },
      },
    })

    return NextResponse.json({
      message: `Deleted ${deleteResult.count} log entries older than ${days} days`,
    })
  }
  catch (error) {
    console.error('Cleanup system logs error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
