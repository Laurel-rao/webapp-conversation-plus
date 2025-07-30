import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createAuthenticatedMiddleware } from '@/lib/middleware'
import { PERMISSIONS } from '@/lib/permissions'

// 给用户充值
export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        // 权限检查
        const authResult = await createAuthenticatedMiddleware(PERMISSIONS.USER_RECHARGE)(request)
        if (authResult) return authResult

        const userId = params.id
        const body = await request.json()
        const { credits, amount, description } = body

        // 验证参数
        if (!credits || credits <= 0) {
            return NextResponse.json(
                { error: 'Credits must be a positive number' },
                { status: 400 }
            )
        }

        if (!amount || amount <= 0) {
            return NextResponse.json(
                { error: 'Amount must be a positive number' },
                { status: 400 }
            )
        }

        // 检查用户是否存在
        const user = await prisma.user.findFirst({
            where: {
                id: userId,
                deletedAt: null
            }
        })

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            )
        }

        // 开始事务
        const result = await prisma.$transaction(async (tx) => {
            // 创建充值记录
            const rechargeRecord = await tx.rechargeRecord.create({
                data: {
                    userId,
                    amount: parseFloat(amount),
                    credits: parseInt(credits),
                    status: 'SUCCESS',
                    paymentMethod: 'ADMIN_RECHARGE',
                    description: description || 'Admin manual recharge'
                }
            })

            // 更新用户积分和充值总额
            const updatedUser = await tx.user.update({
                where: { id: userId },
                data: {
                    credits: {
                        increment: parseInt(credits)
                    },
                    totalRecharge: {
                        increment: parseFloat(amount)
                    }
                }
            })

            // 如果用户有邀请人，计算推荐奖励
            if (user.invitedBy) {
                // 获取推荐奖励比例配置
                const rewardRateConfig = await tx.systemConfig.findUnique({
                    where: { key: 'referral_reward_rate' }
                })

                const rewardRate = rewardRateConfig ? parseFloat(rewardRateConfig.value) : 0.1 // 默认10%

                if (rewardRate > 0) {
                    const rewardCredits = Math.floor(parseInt(credits) * rewardRate)

                    if (rewardCredits > 0) {
                        // 给邀请人增加积分
                        await tx.user.update({
                            where: { id: user.invitedBy },
                            data: {
                                credits: {
                                    increment: rewardCredits
                                }
                            }
                        })

                        // 创建推荐奖励记录
                        await tx.referralReward.create({
                            data: {
                                userId: user.invitedBy,
                                fromUserId: userId,
                                rechargeId: rechargeRecord.id,
                                amount: parseFloat(amount),
                                rewardRate,
                                credits: rewardCredits
                            }
                        })

                        // 给邀请人发送通知
                        await tx.userNotification.create({
                            data: {
                                userId: user.invitedBy,
                                title: '推荐奖励',
                                content: `您推荐的用户充值了 ${amount} 元，您获得了 ${rewardCredits} 积分奖励！`,
                                type: 'REFERRAL'
                            }
                        })
                    }
                }

                // 更新邀请人的推荐等级
                const inviter = await tx.user.findUnique({
                    where: { id: user.invitedBy },
                    select: {
                        referralCount: true,
                        totalRecharge: true
                    }
                })

                if (inviter) {
                    // 获取等级计算配置
                    const levelFormulaConfig = await tx.systemConfig.findUnique({
                        where: { key: 'referral_level_formula' }
                    })

                    let newLevel = 0
                    if (levelFormulaConfig) {
                        try {
                            // 这里可以实现复杂的等级计算公式
                            // 示例：等级 = floor((推荐人数 * 10 + 充值总额 / 100) / 50)
                            const formula = levelFormulaConfig.value
                            newLevel = Math.floor((inviter.referralCount * 10 + parseFloat(inviter.totalRecharge.toString()) / 100) / 50)
                        } catch (error) {
                            console.error('Level calculation error:', error)
                        }
                    }

                    await tx.user.update({
                        where: { id: user.invitedBy },
                        data: {
                            referralLevel: newLevel
                        }
                    })
                }
            }

            // 给用户发送充值通知
            await tx.userNotification.create({
                data: {
                    userId,
                    title: '充值成功',
                    content: `您的账户已成功充值 ${credits} 积分，金额 ${amount} 元。`,
                    type: 'RECHARGE'
                }
            })

            return { rechargeRecord, updatedUser }
        })

        // 记录操作日志
        const currentUser = (request as any).user
        await prisma.systemLog.create({
            data: {
                userId: currentUser.id,
                action: 'RECHARGE_USER',
                resource: 'recharge',
                method: 'POST',
                path: `/api/users/${userId}/recharge`,
                status: 'SUCCESS',
                requestData: { userId, credits, amount, description }
            }
        })

        return NextResponse.json({
            message: 'Recharge successful',
            recharge: result.rechargeRecord,
            user: {
                id: result.updatedUser.id,
                credits: result.updatedUser.credits,
                totalRecharge: result.updatedUser.totalRecharge
            }
        })

    } catch (error) {
        console.error('Recharge user error:', error)

        // 记录错误日志
        const currentUser = (request as any).user
        await prisma.systemLog.create({
            data: {
                userId: currentUser?.id,
                action: 'RECHARGE_USER',
                resource: 'recharge',
                method: 'POST',
                path: `/api/users/${params.id}/recharge`,
                status: 'ERROR',
                errorMessage: error instanceof Error ? error.message : 'Unknown error'
            }
        })

        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}