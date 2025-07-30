import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createAuthenticatedMiddleware } from '@/lib/middleware'
import { PERMISSIONS } from '@/lib/permissions'

// 获取充值记录
export async function GET(request: NextRequest) {
    try {
        // 权限检查
        const authResult = await createAuthenticatedMiddleware(PERMISSIONS.RECHARGE_VIEW)(request)
        if (authResult) return authResult

        const { searchParams } = new URL(request.url)
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '10')
        const userId = searchParams.get('userId')
        const status = searchParams.get('status')
        const startDate = searchParams.get('startDate')
        const endDate = searchParams.get('endDate')

        const skip = (page - 1) * limit

        // 构建查询条件
        const where: any = {}

        if (userId) {
            where.userId = userId
        }

        if (status) {
            where.status = status
        }

        if (startDate || endDate) {
            where.createdAt = {}
            if (startDate) {
                where.createdAt.gte = new Date(startDate)
            }
            if (endDate) {
                where.createdAt.lte = new Date(endDate)
            }
        }

        const [records, total] = await Promise.all([
            prisma.rechargeRecord.findMany({
                where,
                skip,
                take: limit,
                include: {
                    user: {
                        select: {
                            id: true,
                            email: true,
                            nickname: true
                        }
                    },
                    package: {
                        select: {
                            id: true,
                            name: true
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                }
            }),
            prisma.rechargeRecord.count({ where })
        ])

        return NextResponse.json({
            records,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        })

    } catch (error) {
        console.error('Get recharge records error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

// 创建充值记录（用户充值）
export async function POST(request: NextRequest) {
    try {
        // 认证检查（普通用户也可以充值）
        const authResult = await createAuthenticatedMiddleware()(request)
        if (authResult) return authResult

        const body = await request.json()
        const { packageId, paymentMethod } = body
        const currentUser = (request as any).user

        // 验证必需字段
        if (!packageId) {
            return NextResponse.json(
                { error: 'Package ID is required' },
                { status: 400 }
            )
        }

        // 获取充值套餐
        const rechargePackage = await prisma.rechargePackage.findFirst({
            where: {
                id: packageId,
                status: 'ACTIVE',
                deletedAt: null
            }
        })

        if (!rechargePackage) {
            return NextResponse.json(
                { error: 'Recharge package not found' },
                { status: 404 }
            )
        }

        // 计算实际金额（考虑折扣）
        let actualAmount = rechargePackage.amount
        if (rechargePackage.discount) {
            actualAmount = rechargePackage.amount * rechargePackage.discount
        }

        // 创建充值记录
        const rechargeRecord = await prisma.rechargeRecord.create({
            data: {
                userId: currentUser.id,
                packageId,
                amount: actualAmount,
                credits: rechargePackage.credits,
                status: 'PENDING',
                paymentMethod: paymentMethod || 'ONLINE',
                description: `Purchase ${rechargePackage.name}`
            }
        })

        // 这里可以集成支付系统
        // 暂时返回待支付状态
        return NextResponse.json({
            message: 'Recharge order created successfully',
            record: {
                id: rechargeRecord.id,
                amount: rechargeRecord.amount,
                credits: rechargeRecord.credits,
                status: rechargeRecord.status,
                package: {
                    id: rechargePackage.id,
                    name: rechargePackage.name
                }
            }
        }, { status: 201 })

    } catch (error) {
        console.error('Create recharge record error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}