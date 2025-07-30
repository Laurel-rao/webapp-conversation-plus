import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createAuthenticatedMiddleware } from '@/lib/middleware'
import { PERMISSIONS } from '@/lib/permissions'

// 获取充值套餐列表
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const includeInactive = searchParams.get('includeInactive') === 'true'

        // 构建查询条件
        const where: any = {
            deletedAt: null
        }

        if (!includeInactive) {
            where.status = 'ACTIVE'
        }

        const packages = await prisma.rechargePackage.findMany({
            where,
            orderBy: [
                { isPopular: 'desc' },
                { amount: 'asc' }
            ]
        })

        return NextResponse.json({
            packages: packages.map(pkg => ({
                id: pkg.id,
                name: pkg.name,
                amount: pkg.amount,
                credits: pkg.credits,
                discount: pkg.discount,
                validDays: pkg.validDays,
                isPopular: pkg.isPopular,
                description: pkg.description,
                status: pkg.status
            }))
        })

    } catch (error) {
        console.error('Get recharge packages error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

// 创建充值套餐
export async function POST(request: NextRequest) {
    try {
        // 权限检查
        const authResult = await createAuthenticatedMiddleware(PERMISSIONS.RECHARGE_MANAGE)(request)
        if (authResult) return authResult

        const body = await request.json()
        const {
            name,
            amount,
            credits,
            discount,
            validDays,
            isPopular = false,
            description
        } = body

        // 验证必需字段
        if (!name || !amount || !credits) {
            return NextResponse.json(
                { error: 'Name, amount, and credits are required' },
                { status: 400 }
            )
        }

        if (amount <= 0 || credits <= 0) {
            return NextResponse.json(
                { error: 'Amount and credits must be positive numbers' },
                { status: 400 }
            )
        }

        // 创建充值套餐
        const rechargePackage = await prisma.rechargePackage.create({
            data: {
                name,
                amount: parseFloat(amount),
                credits: parseInt(credits),
                discount: discount ? parseFloat(discount) : null,
                validDays: validDays ? parseInt(validDays) : null,
                isPopular,
                description,
                status: 'ACTIVE'
            }
        })

        // 记录操作日志
        const currentUser = (request as any).user
        await prisma.systemLog.create({
            data: {
                userId: currentUser.id,
                action: 'CREATE_RECHARGE_PACKAGE',
                resource: 'recharge_package',
                method: 'POST',
                path: '/api/recharge/packages',
                status: 'SUCCESS'
            }
        })

        return NextResponse.json({
            message: 'Recharge package created successfully',
            package: rechargePackage
        }, { status: 201 })

    } catch (error) {
        console.error('Create recharge package error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}