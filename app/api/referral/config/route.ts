import type { NextRequest } from 'next/server'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { createAuthenticatedMiddleware } from '@/lib/middleware'
import { PERMISSIONS } from '@/lib/permissions'

// 获取推荐系统配置
export async function GET(request: NextRequest) {
  try {
    // 权限检查
    const authResult = await createAuthenticatedMiddleware(PERMISSIONS.REFERRAL_VIEW)(request)
    if (authResult)
      return authResult

    // 返回前端期望的配置格式
    const defaultConfig = {
      enabled: true,
      baseReward: 10,
      levelRewards: {
        '1': 1.0,
        '2': 1.2,
        '3': 1.5,
        '4': 2.0,
        '5': 2.5,
      },
      maxLevel: 5,
      requirementPerLevel: 10,
      rewardTypes: {
        registration: 5,
        firstRecharge: 10,
        consumption: 0.1,
      },
    }

    return NextResponse.json(defaultConfig)
  }
  catch (error) {
    console.error('Get referral config error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}

// 更新推荐系统配置
export async function PUT(request: NextRequest) {
  try {
    // 权限检查
    const authResult = await createAuthenticatedMiddleware(PERMISSIONS.REFERRAL_MANAGE)(request)
    if (authResult)
      return authResult

    const config = await request.json()

    // 在实际项目中，这里应该将配置保存到数据库
    // 现在只是简单返回成功，表示配置已保存
    console.log('保存推荐配置:', config)

    return NextResponse.json({ success: true })
  }
  catch (error) {
    console.error('Update referral config error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}