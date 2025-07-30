import bcrypt from 'bcryptjs'
import { SignJWT, jwtVerify } from 'jose'
import jwt from 'jsonwebtoken'
import { prisma } from './prisma'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

// 启动时输出JWT配置信息
console.log('🔧 [JWT配置] JWT_SECRET来源:', process.env.JWT_SECRET ? '环境变量' : '默认值')
console.log('🔧 [JWT配置] JWT_SECRET长度:', JWT_SECRET.length)
console.log('🔧 [JWT配置] JWT_EXPIRES_IN:', JWT_EXPIRES_IN)

export type JWTPayload = {
  userId: string
  email: string
  roles: string[]
}

export type AuthUser = {
  id: string
  email: string
  username?: string
  nickname?: string
  avatar?: string
  roles: string[]
  permissions: string[]
}

// 密码哈希
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

// 验证密码
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

// 生成 JWT Token
export async function generateToken(payload: JWTPayload): Promise<string> {
  const secret = new TextEncoder().encode(JWT_SECRET)

  // 计算过期时间（7天后）
  const expirationTime = Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60)

  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expirationTime)
    .sign(secret)
}

// 验证 JWT Token
export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    console.log('🔐 [JWT验证] 开始验证token')
    console.log('🔐 [JWT验证] Token (前50字符):', `${token.substring(0, 50)}...`)
    console.log('🔐 [JWT验证] 使用的JWT_SECRET:', JWT_SECRET)

    const secret = new TextEncoder().encode(JWT_SECRET)

    const { payload } = await jwtVerify(token, secret)
    console.log('🔐 [JWT验证] Token验证成功:', payload)

    return payload as JWTPayload
  }
  catch (error) {
    console.error('🔐 [JWT验证] Token验证失败:', {
      error: error instanceof Error ? error.message : String(error),
      name: error instanceof Error ? error.name : 'Unknown',
      token_start: `${token.substring(0, 20)}...`,
      jwt_secret_length: JWT_SECRET.length,
      jwt_secret: JWT_SECRET,
    })
    return null
  }
}

// 生成邀请码
export function generateInviteCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 8; i++)
    result += chars.charAt(Math.floor(Math.random() * chars.length))

  return result
}

// 获取用户完整信息（包含角色和权限）
export async function getUserWithPermissions(userId: string): Promise<AuthUser | null> {
  console.log('👤 [用户查询] 开始查询用户信息, ID:', userId)

  try {
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        deletedAt: null,
        status: 'ACTIVE',
      },
      include: {
        userRoles: {
          include: {
            role: {
              include: {
                roleMenus: {
                  include: {
                    menu: true,
                  },
                },
                roleApis: {
                  include: {
                    api: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!user) {
      console.log('👤 [用户查询] 用户不存在或状态不是ACTIVE, ID:', userId)
      return null
    }

    console.log('👤 [用户查询] 找到用户:', {
      id: user.id,
      email: user.email,
      status: user.status,
      rolesCount: user.userRoles.length,
    })

    // 提取角色
    const roles = user.userRoles.map((ur: any) => ur.role.name)
    console.log('👤 [用户查询] 用户角色:', roles)

    // 提取权限
    const permissions = new Set<string>()
    user.userRoles.forEach((ur: any) => {
      ur.role.roleMenus.forEach((rm: any) => {
        if (rm.menu.permission)
          permissions.add(rm.menu.permission)
      })
    })

    const result = {
      id: user.id,
      email: user.email,
      username: user.username || undefined,
      nickname: user.nickname || undefined,
      avatar: user.avatar || undefined,
      roles,
      permissions: Array.from(permissions),
    }

    console.log('👤 [用户查询] 查询完成:', {
      ...result,
      permissionsCount: result.permissions.length,
    })

    return result
  }
  catch (error) {
    console.error('👤 [用户查询] 查询用户信息时发生错误:', error)
    return null
  }
}

// 检查用户是否有指定权限
export async function hasPermission(userId: string, permission: string): Promise<boolean> {
  const user = await getUserWithPermissions(userId)
  return user?.permissions.includes(permission) || false
}

// 检查用户是否有指定角色
export async function hasRole(userId: string, roleName: string): Promise<boolean> {
  const user = await getUserWithPermissions(userId)
  return user?.roles.includes(roleName) || false
}

// 刷新用户最后登录时间
export async function updateLastLogin(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { lastLoginAt: new Date() },
  })
}
