import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken, generateToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
    try {
        // 获取 token
        const token = request.cookies.get('token')?.value ||
            request.headers.get('authorization')?.replace('Bearer ', '')

        if (!token) {
            return NextResponse.json(
                { error: 'No token provided' },
                { status: 401 }
            )
        }

        // 验证 token
        const payload = verifyToken(token)
        if (!payload) {
            return NextResponse.json(
                { error: 'Invalid token' },
                { status: 401 }
            )
        }

        // 获取用户信息
        const user = await prisma.user.findFirst({
            where: {
                id: payload.userId,
                deletedAt: null,
                status: 'ACTIVE'
            },
            include: {
                userRoles: {
                    include: {
                        role: true
                    }
                }
            }
        })

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            )
        }

        // 提取用户角色
        const roles = user.userRoles.map(ur => ur.role.name)

        // 生成新的 token
        const newToken = generateToken({
            userId: user.id,
            email: user.email,
            roles
        })

        // 返回新 token
        const response = NextResponse.json({
            message: 'Token refreshed successfully',
            token: newToken,
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                nickname: user.nickname,
                avatar: user.avatar,
                roles
            }
        })

        // 设置新的 cookie
        response.cookies.set('token', newToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 // 7 days
        })

        return response

    } catch (error) {
        console.error('Token refresh error:', error)

        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}