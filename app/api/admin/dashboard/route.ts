import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createAuthenticatedMiddleware } from '@/lib/middleware'
import { PERMISSIONS } from '@/lib/permissions'

// 获取管理后台仪表板数据
export async function GET(request: NextRequest) {
    try {
        // 权限检查
        const authResult = await createAuthenticatedMiddleware(PERMISSIONS.STATS_VIEW)(request)
        if (authResult) return authResult

        const { searchParams } = new URL(request.url)
        const period = searchParams.get('period') || '30' // 默认30天

        const daysAgo = parseInt(period)
        const startDate = new Date()
        startDate.setDate(startDate.getDate() - daysAgo)

        // 并行获取各种统计数据
        const [
            userStats,
            revenueStats,
            rechargeStats,
            consumptionStats,
            recentActivities,
            topUsers
        ] = await Promise.all([
            // 用户统计
            getUserStats(startDate),
            // 收入统计
            getRevenueStats(startDate),
            // 充值统计
            getRechargeStats(startDate),
            // 消费统计
            getConsumptionStats(startDate),
            // 最近活动
            getRecentActivities(),
            // 活跃用户
            getTopUsers(startDate)
        ])

        return NextResponse.json({
            userStats,
            revenueStats,
            rechargeStats,
            consumptionStats,
            recentActivities,
            topUsers
        })

    } catch (error) {
        console.error('Get dashboard data error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

// 获取用户统计
async function getUserStats(startDate: Date) {
    const [totalUsers, newUsers, activeUsers, suspendedUsers] = await Promise.all([
        prisma.user.count({
            where: { deletedAt: null }
        }),
        prisma.user.count({
            where: {
                deletedAt: null,
                createdAt: { gte: startDate }
            }
        }),
        prisma.user.count({
            where: {
                deletedAt: null,
                status: 'ACTIVE',
                lastLoginAt: { gte: startDate }
            }
        }),
        prisma.user.count({
            where: {
                deletedAt: null,
                status: 'SUSPENDED'
            }
        })
    ])

    return {
        total: totalUsers,
        new: newUsers,
        active: activeUsers,
        suspended: suspendedUsers
    }
}

// 获取收入统计
async function getRevenueStats(startDate: Date) {
    const rechargeRecords = await prisma.rechargeRecord.findMany({
        where: {
            status: 'SUCCESS',
            createdAt: { gte: startDate }
        },
        select: {
            amount: true,
            createdAt: true
        }
    })

    const totalRevenue = rechargeRecords.reduce((sum, record) =>
        sum + parseFloat(record.amount.toString()), 0
    )

    // 按天统计收入
    const dailyRevenue = rechargeRecords.reduce((acc, record) => {
        const date = record.createdAt.toISOString().split('T')[0]
        acc[date] = (acc[date] || 0) + parseFloat(record.amount.toString())
        return acc
    }, {} as Record<string, number>)

    return {
        total: totalRevenue,
        daily: dailyRevenue
    }
}

// 获取充值统计
async function getRechargeStats(startDate: Date) {
    const [totalRecharges, successfulRecharges, pendingRecharges] = await Promise.all([
        prisma.rechargeRecord.count({
            where: { createdAt: { gte: startDate } }
        }),
        prisma.rechargeRecord.count({
            where: {
                status: 'SUCCESS',
                createdAt: { gte: startDate }
            }
        }),
        prisma.rechargeRecord.count({
            where: {
                status: 'PENDING',
                createdAt: { gte: startDate }
            }
        })
    ])

    return {
        total: totalRecharges,
        successful: successfulRecharges,
        pending: pendingRecharges,
        successRate: totalRecharges > 0 ? (successfulRecharges / totalRecharges * 100).toFixed(2) : '0'
    }
}

// 获取消费统计
async function getConsumptionStats(startDate: Date) {
    const consumptionLogs = await prisma.consumptionLog.findMany({
        where: {
            createdAt: { gte: startDate }
        },
        select: {
            credits: true,
            type: true,
            createdAt: true
        }
    })

    const totalConsumption = consumptionLogs.reduce((sum, log) => sum + log.credits, 0)

    // 按类型统计
    const consumptionByType = consumptionLogs.reduce((acc, log) => {
        acc[log.type] = (acc[log.type] || 0) + log.credits
        return acc
    }, {} as Record<string, number>)

    return {
        total: totalConsumption,
        byType: consumptionByType
    }
}

// 获取最近活动
async function getRecentActivities() {
    const activities = await prisma.systemLog.findMany({
        where: {
            action: {
                in: ['LOGIN_SUCCESS', 'USER_REGISTER', 'RECHARGE_SUCCESS', 'CREATE_USER']
            }
        },
        include: {
            user: {
                select: {
                    id: true,
                    email: true,
                    nickname: true
                }
            }
        },
        orderBy: {
            createdAt: 'desc'
        },
        take: 20
    })

    return activities.map(activity => ({
        id: activity.id,
        action: activity.action,
        user: activity.user,
        createdAt: activity.createdAt,
        ip: activity.ip
    }))
}

// 获取活跃用户
async function getTopUsers(startDate: Date) {
    const topUsers = await prisma.user.findMany({
        where: {
            deletedAt: null,
            lastLoginAt: { gte: startDate }
        },
        select: {
            id: true,
            email: true,
            nickname: true,
            totalRecharge: true,
            totalConsumption: true,
            referralCount: true,
            lastLoginAt: true
        },
        orderBy: {
            totalRecharge: 'desc'
        },
        take: 10
    })

    return topUsers
}