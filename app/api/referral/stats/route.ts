import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createAuthenticatedMiddleware } from '@/lib/middleware'

// 获取推荐统计
export async function GET(request: NextRequest) {
    try {
        // 认证检查
        const authResult = await createAuthenticatedMiddleware()(request)
        if (authResult) return authResult

        const currentUser = (request as any).user
        const { searchParams } = new URL(request.url)
        const userId = searchParams.get('userId') || currentUser.id

        // 获取用户基本信息
        const user = await prisma.user.findFirst({
            where: {
                id: userId,
                deletedAt: null
            },
            select: {
                id: true,
                email: true,
                nickname: true,
                inviteCode: true,
                referralLevel: true,
                referralCount: true,
                totalRecharge: true
            }
        })

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            )
        }

        // 获取推荐的用户列表
        const invitees = await prisma.user.findMany({
            where: {
                invitedBy: userId,
                deletedAt: null
            },
            select: {
                id: true,
                email: true,
                nickname: true,
                totalRecharge: true,
                createdAt: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        // 获取推荐奖励记录
        const referralRewards = await prisma.referralReward.findMany({
            where: {
                userId
            },
            include: {
                recharge: {
                    select: {
                        amount: true,
                        createdAt: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: 20
        })

        // 计算统计数据
        const totalRewards = referralRewards.reduce((sum, reward) => sum + reward.credits, 0)
        const totalRechargeFromInvitees = invitees.reduce((sum, invitee) => sum + parseFloat(invitee.totalRecharge.toString()), 0)

        // 获取等级配置
        const levelConfig = await prisma.systemConfig.findUnique({
            where: { key: 'referral_level_formula' }
        })

        // 计算下一等级所需条件
        let nextLevelRequirement = null
        if (levelConfig) {
            try {
                // 这里可以根据配置计算下一等级要求
                const nextLevel = user.referralLevel + 1
                const requiredPoints = nextLevel * 50 // 示例公式
                const currentPoints = user.referralCount * 10 + totalRechargeFromInvitees / 100
                nextLevelRequirement = {
                    nextLevel,
                    requiredPoints,
                    currentPoints,
                    difference: requiredPoints - currentPoints
                }
            } catch (error) {
                console.error('Level calculation error:', error)
            }
        }

        return NextResponse.json({
            user: {
                id: user.id,
                email: user.email,
                nickname: user.nickname,
                inviteCode: user.inviteCode,
                referralLevel: user.referralLevel,
                referralCount: user.referralCount
            },
            stats: {
                totalInvitees: invitees.length,
                totalRewards,
                totalRechargeFromInvitees,
                nextLevelRequirement
            },
            invitees,
            recentRewards: referralRewards.slice(0, 10).map(reward => ({
                id: reward.id,
                credits: reward.credits,
                amount: reward.amount,
                rewardRate: reward.rewardRate,
                createdAt: reward.createdAt
            }))
        })

    } catch (error) {
        console.error('Get referral stats error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}