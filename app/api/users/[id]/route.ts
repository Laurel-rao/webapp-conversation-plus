import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createAuthenticatedMiddleware } from '@/lib/middleware'
import { PERMISSIONS } from '@/lib/permissions'
import { hashPassword } from '@/lib/auth'

// 获取单个用户
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        // 权限检查
        const authResult = await createAuthenticatedMiddleware(PERMISSIONS.USER_VIEW)(request)
        if (authResult) return authResult

        const userId = params.id

        const user = await prisma.user.findFirst({
            where: {
                id: userId,
                deletedAt: null
            },
            include: {
                userRoles: {
                    include: {
                        role: true
                    }
                },
                rechargeRecords: {
                    orderBy: {
                        createdAt: 'desc'
                    },
                    take: 10
                },
                consumptionLogs: {
                    orderBy: {
                        createdAt: 'desc'
                    },
                    take: 10
                },
                referralRewards: {
                    orderBy: {
                        createdAt: 'desc'
                    },
                    take: 10
                },
                invitees: {
                    select: {
                        id: true,
                        email: true,
                        nickname: true,
                        createdAt: true
                    },
                    take: 10
                }
            }
        })

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            )
        }

        // 格式化返回数据
        const formattedUser = {
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
            invitedBy: user.invitedBy,
            roles: user.userRoles.map(ur => ({
                id: ur.role.id,
                name: ur.role.name,
                displayName: ur.role.displayName
            })),
            rechargeRecords: user.rechargeRecords,
            consumptionLogs: user.consumptionLogs,
            referralRewards: user.referralRewards,
            invitees: user.invitees,
            createdAt: user.createdAt,
            lastLoginAt: user.lastLoginAt
        }

        return NextResponse.json({ user: formattedUser })

    } catch (error) {
        console.error('Get user error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

// 更新用户
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        // 权限检查
        const authResult = await createAuthenticatedMiddleware(PERMISSIONS.USER_UPDATE)(request)
        if (authResult) return authResult

        const userId = params.id
        const body = await request.json()
        const {
            username,
            nickname,
            phone,
            status,
            password,
            roleIds,
            vipMultiplier
        } = body

        // 检查用户是否存在
        const existingUser = await prisma.user.findFirst({
            where: {
                id: userId,
                deletedAt: null
            }
        })

        if (!existingUser) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            )
        }

        // 检查用户名是否已被其他用户使用
        if (username && username !== existingUser.username) {
            const existingUsername = await prisma.user.findFirst({
                where: {
                    username,
                    id: { not: userId },
                    deletedAt: null
                }
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
            // 准备更新数据
            const updateData: any = {}

            if (username !== undefined) updateData.username = username
            if (nickname !== undefined) updateData.nickname = nickname
            if (phone !== undefined) updateData.phone = phone
            if (status !== undefined) updateData.status = status
            if (vipMultiplier !== undefined) updateData.vipMultiplier = vipMultiplier

            // 如果有新密码，进行哈希
            if (password) {
                updateData.password = await hashPassword(password)
            }

            // 更新用户信息
            const user = await tx.user.update({
                where: { id: userId },
                data: updateData
            })

            // 更新角色（如果提供）
            if (roleIds !== undefined) {
                // 删除现有角色
                await tx.userRole.deleteMany({
                    where: { userId }
                })

                // 添加新角色
                if (roleIds.length > 0) {
                    await tx.userRole.createMany({
                        data: roleIds.map((roleId: string) => ({
                            userId,
                            roleId
                        }))
                    })
                }
            }

            return user
        })

        // 记录操作日志
        const currentUser = (request as any).user
        await prisma.systemLog.create({
            data: {
                userId: currentUser.id,
                action: 'UPDATE_USER',
                resource: 'user',
                method: 'PUT',
                path: `/api/users/${userId}`,
                status: 'SUCCESS'
            }
        })

        return NextResponse.json({
            message: 'User updated successfully',
            user: {
                id: result.id,
                email: result.email,
                username: result.username,
                nickname: result.nickname,
                phone: result.phone,
                status: result.status,
                vipMultiplier: result.vipMultiplier
            }
        })

    } catch (error) {
        console.error('Update user error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

// 删除用户（软删除）
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        // 权限检查
        const authResult = await createAuthenticatedMiddleware(PERMISSIONS.USER_DELETE)(request)
        if (authResult) return authResult

        const userId = params.id

        // 检查用户是否存在
        const existingUser = await prisma.user.findFirst({
            where: {
                id: userId,
                deletedAt: null
            }
        })

        if (!existingUser) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            )
        }

        // 防止删除自己
        const currentUser = (request as any).user
        if (currentUser.id === userId) {
            return NextResponse.json(
                { error: 'Cannot delete yourself' },
                { status: 400 }
            )
        }

        // 软删除用户
        await prisma.user.update({
            where: { id: userId },
            data: {
                deletedAt: new Date(),
                status: 'INACTIVE'
            }
        })

        // 记录操作日志
        await prisma.systemLog.create({
            data: {
                userId: currentUser.id,
                action: 'DELETE_USER',
                resource: 'user',
                method: 'DELETE',
                path: `/api/users/${userId}`,
                status: 'SUCCESS'
            }
        })

        return NextResponse.json({
            message: 'User deleted successfully'
        })

    } catch (error) {
        console.error('Delete user error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}