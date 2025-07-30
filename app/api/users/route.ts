import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createAuthenticatedMiddleware } from '@/lib/middleware'
import { PERMISSIONS } from '@/lib/permissions'
import { hashPassword } from '@/lib/auth'

// 获取用户列表
export async function GET(request: NextRequest) {
    try {
        // 权限检查
        const authResult = await createAuthenticatedMiddleware(PERMISSIONS.USER_VIEW)(request)
        if (authResult) return authResult

        const { searchParams } = new URL(request.url)
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '10')
        const search = searchParams.get('search') || ''
        const status = searchParams.get('status') || ''
        const role = searchParams.get('role') || ''

        const skip = (page - 1) * limit

        // 构建查询条件
        const where: any = {
            deletedAt: null
        }

        if (search) {
            where.OR = [
                { email: { contains: search, mode: 'insensitive' } },
                { username: { contains: search, mode: 'insensitive' } },
                { nickname: { contains: search, mode: 'insensitive' } }
            ]
        }

        if (status) {
            where.status = status
        }

        if (role) {
            where.userRoles = {
                some: {
                    role: {
                        name: role
                    }
                }
            }
        }

        // 获取用户列表
        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                skip,
                take: limit,
                include: {
                    userRoles: {
                        include: {
                            role: true
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                }
            }),
            prisma.user.count({ where })
        ])

        // 格式化返回数据
        const formattedUsers = users.map(user => ({
            id: user.id,
            email: user.email,
            username: user.username,
            nickname: user.nickname,
            avatar: user.avatar,
            phone: user.phone,
            status: user.status,
            credits: user.credits,
            totalRecharge: user.totalRecharge,
            totalConsumption: user.totalConsumption,
            vipMultiplier: user.vipMultiplier,
            referralLevel: user.referralLevel,
            referralCount: user.referralCount,
            inviteCode: user.inviteCode,
            roles: user.userRoles.map(ur => ({
                id: ur.role.id,
                name: ur.role.name,
                displayName: ur.role.displayName
            })),
            createdAt: user.createdAt,
            lastLoginAt: user.lastLoginAt
        }))

        return NextResponse.json({
            users: formattedUsers,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        })

    } catch (error) {
        console.error('Get users error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

// 创建用户
export async function POST(request: NextRequest) {
    try {
        // 权限检查
        const authResult = await createAuthenticatedMiddleware(PERMISSIONS.USER_CREATE)(request)
        if (authResult) return authResult

        const body = await request.json()
        const {
            email,
            password,
            username,
            nickname,
            phone,
            roleIds = [],
            vipMultiplier
        } = body

        // 验证必需字段
        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email and password are required' },
                { status: 400 }
            )
        }

        // 检查邮箱是否已存在
        const existingUser = await prisma.user.findUnique({
            where: { email }
        })

        if (existingUser) {
            return NextResponse.json(
                { error: 'Email already exists' },
                { status: 409 }
            )
        }

        // 检查用户名是否已存在
        if (username) {
            const existingUsername = await prisma.user.findUnique({
                where: { username }
            })

            if (existingUsername) {
                return NextResponse.json(
                    { error: 'Username already exists' },
                    { status: 409 }
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
                    phone,
                    vipMultiplier,
                    status: 'ACTIVE'
                }
            })

            // 分配角色
            if (roleIds.length > 0) {
                await tx.userRole.createMany({
                    data: roleIds.map((roleId: string) => ({
                        userId: user.id,
                        roleId
                    }))
                })
            }

            return user
        })

        // 记录操作日志
        const currentUser = (request as any).user
        await prisma.systemLog.create({
            data: {
                userId: currentUser.id,
                action: 'CREATE_USER',
                resource: 'user',
                method: 'POST',
                path: '/api/users',
                status: 'SUCCESS'
            }
        })

        return NextResponse.json({
            message: 'User created successfully',
            user: {
                id: result.id,
                email: result.email,
                username: result.username,
                nickname: result.nickname,
                phone: result.phone,
                status: result.status,
                credits: result.credits,
                vipMultiplier: result.vipMultiplier
            }
        }, { status: 201 })

    } catch (error) {
        console.error('Create user error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}