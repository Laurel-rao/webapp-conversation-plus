import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateInviteCode, generateToken, hashPassword } from '@/lib/auth'
import { ROLES } from '@/lib/permissions'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, username, nickname, inviteCode } = body

    // 验证必需字段
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 },
      )
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 },
      )
    }

    // 验证密码强度
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 },
      )
    }

    // 检查邮箱是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 },
      )
    }

    // 检查用户名是否已存在（如果提供）
    if (username) {
      const existingUsername = await prisma.user.findUnique({
        where: { username },
      })

      if (existingUsername) {
        return NextResponse.json(
          { error: 'Username already taken' },
          { status: 409 },
        )
      }
    }

    // 验证邀请码（如果提供）
    let inviter = null
    if (inviteCode) {
      inviter = await prisma.user.findFirst({
        where: {
          inviteCode,
          deletedAt: null,
          status: 'ACTIVE',
        },
      })

      if (!inviter) {
        return NextResponse.json(
          { error: 'Invalid invite code' },
          { status: 400 },
        )
      }
    }

    // 开始事务
    const result = await prisma.$transaction(async (tx) => {
      // 哈希密码
      const hashedPassword = await hashPassword(password)

      // 创建用户
      const user = await tx.user.create({
        data: {
          email,
          username,
          nickname: nickname || username || email.split('@')[0],
          password: hashedPassword,
          inviteCode: generateInviteCode(),
          invitedBy: inviter?.id,
          status: 'ACTIVE',
        },
      })

      // 获取默认用户角色
      const userRole = await tx.role.findUnique({
        where: { name: ROLES.USER },
      })

      if (userRole) {
        // 分配默认角色
        await tx.userRole.create({
          data: {
            userId: user.id,
            roleId: userRole.id,
          },
        })
      }

      // 如果有邀请人，更新邀请人的推荐统计
      if (inviter) {
        await tx.user.update({
          where: { id: inviter.id },
          data: {
            referralCount: {
              increment: 1,
            },
          },
        })
      }

      // 创建欢迎通知
      await tx.userNotification.create({
        data: {
          userId: user.id,
          title: '欢迎注册',
          content: '欢迎使用智能助手！我们为您准备了新手教程，快来体验吧。',
          type: 'SYSTEM',
        },
      })

      return user
    })

    // 生成 JWT token
    const token = generateToken({
      userId: result.id,
      email: result.email,
      roles: [ROLES.USER],
    })

    // 记录注册日志
    await prisma.systemLog.create({
      data: {
        userId: result.id,
        action: 'USER_REGISTER',
        resource: 'user',
        method: 'POST',
        path: '/api/auth/register',
        status: 'SUCCESS',
      },
    })

    // 返回用户信息和 token
    const response = NextResponse.json({
      message: 'User registered successfully',
      user: {
        id: result.id,
        email: result.email,
        username: result.username,
        nickname: result.nickname,
        inviteCode: result.inviteCode,
        credits: result.credits,
      },
      token,
    }, { status: 201 })

    // 设置 cookie
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    })

    return response
  }
  catch (error) {
    console.error('Registration error:', error)

    // 记录错误日志
    await prisma.systemLog.create({
      data: {
        action: 'USER_REGISTER',
        resource: 'user',
        method: 'POST',
        path: '/api/auth/register',
        status: 'ERROR',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      },
    })

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
