import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from './prisma'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

export interface JWTPayload {
    userId: string
    email: string
    roles: string[]
}

export interface AuthUser {
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
export function generateToken(payload: JWTPayload): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
}

// 验证 JWT Token
export function verifyToken(token: string): JWTPayload | null {
    try {
        return jwt.verify(token, JWT_SECRET) as JWTPayload
    } catch (error) {
        return null
    }
}

// 生成邀请码
export function generateInviteCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let result = ''
    for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
}

// 获取用户完整信息（包含角色和权限）
export async function getUserWithPermissions(userId: string): Promise<AuthUser | null> {
    const user = await prisma.user.findFirst({
        where: {
            id: userId,
            deletedAt: null,
            status: 'ACTIVE'
        },
        include: {
            userRoles: {
                include: {
                    role: {
                        include: {
                            roleMenus: {
                                include: {
                                    menu: true
                                }
                            },
                            roleApis: {
                                include: {
                                    api: true
                                }
                            }
                        }
                    }
                }
            }
        }
    })

    if (!user) return null

    // 提取角色
    const roles = user.userRoles.map(ur => ur.role.name)

    // 提取权限
    const permissions = new Set<string>()
    user.userRoles.forEach(ur => {
        ur.role.roleMenus.forEach(rm => {
            if (rm.menu.permission) {
                permissions.add(rm.menu.permission)
            }
        })
    })

    return {
        id: user.id,
        email: user.email,
        username: user.username || undefined,
        nickname: user.nickname || undefined,
        avatar: user.avatar || undefined,
        roles,
        permissions: Array.from(permissions)
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
        data: { lastLoginAt: new Date() }
    })
}