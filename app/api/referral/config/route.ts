import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createAuthenticatedMiddleware } from '@/lib/middleware'
import { PERMISSIONS } from '@/lib/permissions'

// 获取推荐系统配置
export async function GET(request: NextRequest) {
    try {
        // 权限检查
        const authResult = await createAuthenticatedMiddleware(PERMISSIONS.REFERRAL_VIEW)(request)
        if (authResult) return authResult

        const configs = await prisma.systemConfig.findMany({
            where: {
                key: {
                    in: [
                        'referral_reward_rate',
                        'referral_level_formula',
                        'referral_level_weight_count',
                        'referral_level_weight_recharge',
                        'referral_level_base'
                    ]
                }
            }
        })

        const configMap = configs.reduce((acc, config) => {
            acc[config.key] = {
                value: config.value,
                type: config.type,
                description: config.description
            }
            return acc
        }, {} as Record<string, any>)

        return NextResponse.json({
            config: configMap
        })

    } catch (error) {
        console.error('Get referral config error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

// 更新推荐系统配置
export async function PUT(request: NextRequest) {
    try {
        // 权限检查
        const authResult = await createAuthenticatedMiddleware(PERMISSIONS.REFERRAL_MANAGE)(request)
        if (authResult) return authResult

        const body = await request.json()
        const { configs } = body

        if (!configs || typeof configs !== 'object') {
            return NextResponse.json(
                { error: 'Invalid config data' },
                { status: 400 }
            )
        }

        // 开始事务
        await prisma.$transaction(async (tx) => {
            for (const [key, configData] of Object.entries(configs)) {
                const { value, description } = configData as any

                await tx.systemConfig.upsert({
                    where: { key },
                    update: {
                        value: String(value),
                        description
                    },
                    create: {
                        key,
                        value: String(value),
                        description,
                        type: 'STRING'
                    }
                })
            }
        })

        // 记录操作日志
        const currentUser = (request as any).user
        await prisma.systemLog.create({
            data: {
                userId: currentUser.id,
                action: 'UPDATE_REFERRAL_CONFIG',
                resource: 'system_config',
                method: 'PUT',
                path: '/api/referral/config',
                status: 'SUCCESS',
                requestData: configs
            }
        })

        return NextResponse.json({
            message: 'Referral config updated successfully'
        })

    } catch (error) {
        console.error('Update referral config error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}