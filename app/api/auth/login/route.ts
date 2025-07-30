import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateToken, updateLastLogin, verifyPassword } from '@/lib/auth'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { email, password } = body

        // 验证必需字段
        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email and password are required' },
                { status: 400 },
            )
        }

        // 查找用户
        const user = await prisma.user.findFirst({
            where: {
                email,
                deletedAt: null,
            },
            include: {
                userRoles: {
                    include: {
                        role: true,
                    },
                },
            },
        })

        if (!user) {
            return NextResponse.json(
                { error: 'Invalid email or password' },
                { status: 401 },
            )
        }

        // 检查用户状态
        if (user.status !== 'ACTIVE') {
            let message = 'Account is not active'
            switch (user.status) {
                case 'SUSPENDED':
                    message = 'Account is suspended'
                    break
                case 'BANNED':
                    message = 'Account is banned'
                    break
                case 'INACTIVE':
                    message = 'Account is inactive'
                    break
            }

            return NextResponse.json(
                { error: message },
                { status: 403 },
            )
        }

        // 验证密码
        const isPasswordValid = await verifyPassword(password, user.password)
        if (!isPasswordValid) {
            // 记录登录失败日志
            await prisma.systemLog.create({
                data: {
                    userId: user.id,
                    action: 'LOGIN_FAILED',
                    resource: 'auth',
                    method: 'POST',
                    path: '/api/auth/login',
                    status: 'ERROR',
                    errorMessage: 'Invalid password',
                },
            })

            return NextResponse.json(
                { error: 'Invalid email or password' },
                { status: 401 },
            )
        }

        // 提取用户角色
        const roles = user.userRoles.map((ur: any) => ur.role.name)

        // 生成 JWT token
        const token = await generateToken({
            userId: user.id,
            email: user.email,
            roles,
        })

        // 更新最后登录时间
        await updateLastLogin(user.id)

        // 记录登录成功日志
        await prisma.systemLog.create({
            data: {
                userId: user.id,
                action: 'LOGIN_SUCCESS',
                resource: 'auth',
                method: 'POST',
                path: '/api/auth/login',
                status: 'SUCCESS',
            },
        })

        // 返回用户信息和 token
        const response = NextResponse.json({
            message: 'Login successful',
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                nickname: user.nickname,
                avatar: user.avatar,
                credits: user.credits,
                vipMultiplier: user.vipMultiplier,
                roles,
                lastLoginAt: new Date(),
            },
            token,
        })

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
        console.error('Login error:', error)

        // 记录错误日志
        await prisma.systemLog.create({
            data: {
                action: 'LOGIN_ERROR',
                resource: 'auth',
                method: 'POST',
                path: '/api/auth/login',
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
