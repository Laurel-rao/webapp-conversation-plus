import type { NextRequest } from 'next/server'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createAuthenticatedMiddleware } from '@/lib/middleware'
import { PERMISSIONS } from '@/lib/permissions'

// 获取系统配置
export async function GET(request: NextRequest) {
  try {
    // 权限检查
    const authResult = await createAuthenticatedMiddleware(PERMISSIONS.SYSTEM_CONFIG)(request)
    if (authResult)
      return authResult

    // 返回前端期望的配置格式
    const defaultConfig = {
      general: {
        siteName: 'AI对话平台',
        siteDescription: '智能AI对话系统',
        siteLogo: '',
        contactEmail: 'support@example.com',
        supportUrl: '',
        termsUrl: '',
        privacyUrl: '',
      },
      auth: {
        allowRegistration: true,
        emailVerificationRequired: false,
        passwordMinLength: 8,
        sessionTimeout: 7200,
        maxLoginAttempts: 5,
      },
      payment: {
        enabled: true,
        currency: 'CNY',
        minRechargeAmount: 10,
        maxRechargeAmount: 10000,
        defaultCreditsPerYuan: 100,
      },
      ai: {
        defaultModel: 'gpt-3.5-turbo',
        maxTokensPerRequest: 4000,
        maxRequestsPerDay: 100,
        creditCostPerToken: 0.01,
      },
      security: {
        rateLimitEnabled: true,
        maxRequestsPerMinute: 60,
        ipWhitelist: [],
        maintenanceMode: false,
      },
    }

    return NextResponse.json({
      config: defaultConfig,
    })
  }
  catch (error) {
    console.error('Get system config error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}

// 更新系统配置
export async function PUT(request: NextRequest) {
  try {
    // 权限检查
    const authResult = await createAuthenticatedMiddleware(PERMISSIONS.SYSTEM_CONFIG)(request)
    if (authResult)
      return authResult

    const config = await request.json()

    // 在实际项目中，这里应该将配置保存到数据库
    // 现在只是简单返回成功，表示配置已保存
    console.log('保存系统配置:', config)

    return NextResponse.json({
      message: 'System config updated successfully',
    })
  }
  catch (error) {
    console.error('Update system config error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}

// 获取配置分类
function getConfigCategory(key: string): string {
  if (key.startsWith('referral_'))
    return 'referral'
  if (key.startsWith('payment_'))
    return 'payment'
  if (key.startsWith('email_'))
    return 'email'
  if (key.startsWith('security_'))
    return 'security'
  if (key.startsWith('feature_'))
    return 'feature'
  return 'general'
}
