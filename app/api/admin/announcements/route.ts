import type { NextRequest } from 'next/server'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createAuthenticatedMiddleware } from '@/lib/middleware'
import { PERMISSIONS } from '@/lib/permissions'

// 获取公告列表
export async function GET(request: NextRequest) {
  try {
    // 权限检查
    const authResult = await createAuthenticatedMiddleware(PERMISSIONS.ANNOUNCEMENT_VIEW)(request)
    if (authResult)
      return authResult

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')
    const type = searchParams.get('type')

    const skip = (page - 1) * limit

    // 构建查询条件
    const where: any = {}

    if (status)
      where.status = status

    if (type)
      where.type = type

    const [announcements, total] = await Promise.all([
      prisma.announcement.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.announcement.count({ where }),
    ])

    return NextResponse.json({
      announcements,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  }
  catch (error) {
    console.error('Get announcements error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}

// 创建公告
export async function POST(request: NextRequest) {
  try {
    // 权限检查
    const authResult = await createAuthenticatedMiddleware(PERMISSIONS.ANNOUNCEMENT_CREATE)(request)
    if (authResult)
      return authResult

    const body = await request.json()
    const { title, content, type = 'INFO', startTime, endTime } = body
    const currentUser = (request as any).user

    // 验证必需字段
    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 },
      )
    }

    // 开始事务
    const result = await prisma.$transaction(async (tx) => {
      // 创建公告
      const announcement = await tx.announcement.create({
        data: {
          title,
          content,
          type,
          status: 'ACTIVE',
          startTime: startTime ? new Date(startTime) : null,
          endTime: endTime ? new Date(endTime) : null,
          createdBy: currentUser.id,
        },
      })

      // 获取所有活跃用户
      const activeUsers = await tx.user.findMany({
        where: {
          status: 'ACTIVE',
          deletedAt: null,
        },
        select: { id: true },
      })

      // 为所有用户创建通知
      if (activeUsers.length > 0) {
        await tx.userNotification.createMany({
          data: activeUsers.map(user => ({
            userId: user.id,
            announcementId: announcement.id,
            title,
            content,
            type: 'SYSTEM',
          })),
        })
      }

      return announcement
    })

    // 记录操作日志
    await prisma.systemLog.create({
      data: {
        userId: currentUser.id,
        action: 'CREATE_ANNOUNCEMENT',
        resource: 'announcement',
        method: 'POST',
        path: '/api/admin/announcements',
        status: 'SUCCESS',
      },
    })

    return NextResponse.json({
      message: 'Announcement created successfully',
      announcement: result,
    }, { status: 201 })
  }
  catch (error) {
    console.error('Create announcement error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
