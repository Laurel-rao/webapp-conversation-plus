import { NextRequest, NextResponse } from 'next/server'
import { authMiddleware } from '@/lib/middleware'
import { getUserWithPermissions } from '@/lib/auth'

export async function GET(request: NextRequest) {
    try {
        // 认证检查
        const authResult = await authMiddleware(request)
        if (authResult) return authResult

        const user = (request as any).user

        // 获取完整的用户信息
        const fullUser = await getUserWithPermissions(user.id)

        if (!fullUser) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            user: fullUser
        })

    } catch (error) {
        console.error('Get user info error:', error)

        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}