import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createAuthenticatedMiddleware } from '@/lib/middleware'
import { PERMISSIONS } from '@/lib/permissions'

// 获取系统配置
export async function GET(request: NextRequest) {
    try {
        // 权限检查
        const authResult = await createAuthenticatedMiddleware(PERMISSIONS.SYSTEM_CONFIG)(request)
        if (authResult) return authResult

        const configs = await prisma.systemConfig.findMany({
            orderBy: {
                key: 'asc'
            }
        })

        // 按类型分组
        const groupedConfigs = configs.reduce((acc, config) => {
            const category = getConfigCategory(config.key)
            if (!acc[category]) {
                acc[category] = []
            }
            acc[category].push({
                id: config.id,
                key: config.key,
                value: config.value,
                description: config.description,
                type: config.type
            })
            return acc
        }, {} as Record<string, any[]>)

        return NextResponse.json({
            configs: groupedConfigs
        })

    } catch (error) {
        console.error('Get system config error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

// 更新系统配置
export async function PUT(request: NextRequest) {
    try {
        // 权限检查
        const authResult = await createAuthenticatedMiddleware(PERMISSIONS.SYSTEM_CONFIG)(request)
        if (authResult) return authResult

        const body = await request.json()
        const { configs } = body

        if (!Array.isArray(configs)) {
            return NextResponse.json(
                { error: 'Invalid config data format' },
                { status: 400 }
            )
        }

        // 开始事务
        await prisma.$transaction(async (tx) => {
            for (const config of configs) {
                await tx.systemConfig.upsert({
                    where: { key: config.key },
                    update: {
                        value: String(config.value),
                        description: config.description,
                        type: config.type || 'STRING'
                    },
                    create: {
                        key: config.key,
                        value: String(config.value),
                        description: config.description,
                        type: config.type || 'STRING'
                    }
                })
            }
        })

        // 记录操作日志
        const currentUser = (request as any).user
        await prisma.systemLog.create({
            data: {
                userId: currentUser.id,
                action: 'UPDATE_SYSTEM_CONFIG',
                resource: 'system_config',
                method: 'PUT',
                path: '/api/admin/system/config',
                status: 'SUCCESS',
                requestData: configs
            }
        })

        return NextResponse.json({
            message: 'System config updated successfully'
        })

    } catch (error) {
        console.error('Update system config error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

// 获取配置分类
function getConfigCategory(key: string): string {
    if (key.startsWith('referral_')) return 'referral'
    if (key.startsWith('payment_')) return 'payment'
    if (key.startsWith('email_')) return 'email'
    if (key.startsWith('security_')) return 'security'
    if (key.startsWith('feature_')) return 'feature'
    return 'general'
}