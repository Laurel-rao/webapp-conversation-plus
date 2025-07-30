import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../lib/auth'
import { ROLES, PERMISSIONS, DEFAULT_ROLE_PERMISSIONS } from '../lib/permissions'

const prisma = new PrismaClient()

async function main() {
    console.log('Start seeding...')

    // 1. 创建系统角色
    console.log('Creating system roles...')

    const superAdminRole = await prisma.role.upsert({
        where: { name: ROLES.SUPER_ADMIN },
        update: {},
        create: {
            name: ROLES.SUPER_ADMIN,
            displayName: '超级管理员',
            description: '系统最高权限，可以管理所有功能',
            isSystem: true,
            status: 'ACTIVE'
        }
    })

    const adminRole = await prisma.role.upsert({
        where: { name: ROLES.ADMIN },
        update: {},
        create: {
            name: ROLES.ADMIN,
            displayName: '管理员',
            description: '管理用户、充值等基本管理功能',
            isSystem: true,
            status: 'ACTIVE'
        }
    })

    const userRole = await prisma.role.upsert({
        where: { name: ROLES.USER },
        update: {},
        create: {
            name: ROLES.USER,
            displayName: '普通用户',
            description: '基础用户权限',
            isSystem: true,
            status: 'ACTIVE'
        }
    })

    const vipRole = await prisma.role.upsert({
        where: { name: ROLES.VIP },
        update: {},
        create: {
            name: ROLES.VIP,
            displayName: 'VIP用户',
            description: 'VIP用户权限，享受特殊优惠',
            isSystem: true,
            status: 'ACTIVE'
        }
    })

    // 2. 创建菜单
    console.log('Creating menus...')

    // 主菜单
    const homeMenu = await prisma.menu.upsert({
        where: { id: 'home' },
        update: {},
        create: {
            id: 'home',
            name: '首页',
            path: '/',
            icon: 'home',
            sort: 1,
            type: 'MENU',
            status: 'ACTIVE'
        }
    })

    const chatMenu = await prisma.menu.upsert({
        where: { id: 'chat' },
        update: {},
        create: {
            id: 'chat',
            name: '智能对话',
            path: '/chat',
            icon: 'chat',
            sort: 2,
            type: 'MENU',
            status: 'ACTIVE'
        }
    })

    const billingMenu = await prisma.menu.upsert({
        where: { id: 'billing' },
        update: {},
        create: {
            id: 'billing',
            name: '充值中心',
            path: '/billing',
            icon: 'billing',
            sort: 3,
            type: 'MENU',
            status: 'ACTIVE'
        }
    })

    const profileMenu = await prisma.menu.upsert({
        where: { id: 'profile' },
        update: {},
        create: {
            id: 'profile',
            name: '个人中心',
            path: '/profile',
            icon: 'profile',
            sort: 4,
            type: 'MENU',
            status: 'ACTIVE'
        }
    })

    // 管理后台菜单
    const adminMenu = await prisma.menu.upsert({
        where: { id: 'admin' },
        update: {},
        create: {
            id: 'admin',
            name: '管理后台',
            path: '/admin',
            icon: 'admin',
            sort: 100,
            type: 'DIRECTORY',
            permission: PERMISSIONS.USER_VIEW,
            status: 'ACTIVE'
        }
    })

    const adminUsersMenu = await prisma.menu.upsert({
        where: { id: 'admin-users' },
        update: {},
        create: {
            id: 'admin-users',
            name: '用户管理',
            path: '/admin/users',
            icon: 'users',
            parentId: adminMenu.id,
            sort: 1,
            type: 'MENU',
            permission: PERMISSIONS.USER_VIEW,
            status: 'ACTIVE'
        }
    })

    const adminRechargeMenu = await prisma.menu.upsert({
        where: { id: 'admin-recharge' },
        update: {},
        create: {
            id: 'admin-recharge',
            name: '充值管理',
            path: '/admin/recharge',
            icon: 'recharge',
            parentId: adminMenu.id,
            sort: 2,
            type: 'MENU',
            permission: PERMISSIONS.RECHARGE_VIEW,
            status: 'ACTIVE'
        }
    })

    const adminSystemMenu = await prisma.menu.upsert({
        where: { id: 'admin-system' },
        update: {},
        create: {
            id: 'admin-system',
            name: '系统设置',
            path: '/admin/system',
            icon: 'system',
            parentId: adminMenu.id,
            sort: 3,
            type: 'MENU',
            permission: PERMISSIONS.SYSTEM_CONFIG,
            status: 'ACTIVE'
        }
    })

    // 3. 创建API权限
    console.log('Creating API permissions...')

    const apiPermissions = [
        { name: '用户列表', path: '/api/users', method: 'GET', category: 'user' },
        { name: '创建用户', path: '/api/users', method: 'POST', category: 'user' },
        { name: '更新用户', path: '/api/users/:id', method: 'PUT', category: 'user' },
        { name: '删除用户', path: '/api/users/:id', method: 'DELETE', category: 'user' },
        { name: '用户充值', path: '/api/users/:id/recharge', method: 'POST', category: 'user' },

        { name: '充值套餐列表', path: '/api/recharge/packages', method: 'GET', category: 'recharge' },
        { name: '充值记录', path: '/api/recharge/records', method: 'GET', category: 'recharge' },

        { name: '推荐统计', path: '/api/referral/stats', method: 'GET', category: 'referral' },
        { name: '推荐配置', path: '/api/referral/config', method: 'PUT', category: 'referral' },

        { name: '仪表板数据', path: '/api/admin/dashboard', method: 'GET', category: 'admin' },
        { name: '系统配置', path: '/api/admin/system/config', method: 'GET', category: 'admin' },
        { name: '系统日志', path: '/api/admin/system/logs', method: 'GET', category: 'admin' },
    ]

    for (const apiPerm of apiPermissions) {
        await prisma.apiPermission.upsert({
            where: {
                path_method: {
                    path: apiPerm.path,
                    method: apiPerm.method
                }
            },
            update: {},
            create: {
                name: apiPerm.name,
                path: apiPerm.path,
                method: apiPerm.method,
                category: apiPerm.category,
                status: 'ACTIVE'
            }
        })
    }

    // 4. 分配角色权限
    console.log('Assigning role permissions...')

    // 普通用户菜单权限
    const userMenus = [homeMenu, chatMenu, billingMenu, profileMenu]
    for (const menu of userMenus) {
        await prisma.roleMenu.upsert({
            where: {
                roleId_menuId: {
                    roleId: userRole.id,
                    menuId: menu.id
                }
            },
            update: {},
            create: {
                roleId: userRole.id,
                menuId: menu.id
            }
        })

        // VIP用户继承普通用户权限
        await prisma.roleMenu.upsert({
            where: {
                roleId_menuId: {
                    roleId: vipRole.id,
                    menuId: menu.id
                }
            },
            update: {},
            create: {
                roleId: vipRole.id,
                menuId: menu.id
            }
        })
    }

    // 管理员权限
    const adminMenus = [homeMenu, chatMenu, billingMenu, profileMenu, adminMenu, adminUsersMenu, adminRechargeMenu]
    for (const menu of adminMenus) {
        await prisma.roleMenu.upsert({
            where: {
                roleId_menuId: {
                    roleId: adminRole.id,
                    menuId: menu.id
                }
            },
            update: {},
            create: {
                roleId: adminRole.id,
                menuId: menu.id
            }
        })
    }

    // 超级管理员权限（所有菜单）
    const allMenus = [homeMenu, chatMenu, billingMenu, profileMenu, adminMenu, adminUsersMenu, adminRechargeMenu, adminSystemMenu]
    for (const menu of allMenus) {
        await prisma.roleMenu.upsert({
            where: {
                roleId_menuId: {
                    roleId: superAdminRole.id,
                    menuId: menu.id
                }
            },
            update: {},
            create: {
                roleId: superAdminRole.id,
                menuId: menu.id
            }
        })
    }

    // 5. 创建默认管理员用户
    console.log('Creating default admin user...')

    const adminEmail = 'admin@example.com'
    const adminPassword = await hashPassword('admin123456')

    const adminUser = await prisma.user.upsert({
        where: { email: adminEmail },
        update: {},
        create: {
            email: adminEmail,
            password: adminPassword,
            username: 'admin',
            nickname: '系统管理员',
            status: 'ACTIVE',
            credits: 10000
        }
    })

    // 分配超级管理员角色
    await prisma.userRole.upsert({
        where: {
            userId_roleId: {
                userId: adminUser.id,
                roleId: superAdminRole.id
            }
        },
        update: {},
        create: {
            userId: adminUser.id,
            roleId: superAdminRole.id
        }
    })

    // 6. 创建充值套餐
    console.log('Creating recharge packages...')

    const packages = [
        {
            name: '基础套餐',
            amount: 19,
            credits: 1000,
            description: '适合轻度使用用户',
            isPopular: false
        },
        {
            name: '专业套餐',
            amount: 89,
            credits: 5000,
            description: '适合专业用户，性价比最高',
            isPopular: true
        },
        {
            name: '企业套餐',
            amount: 299,
            credits: 20000,
            description: '适合企业用户，大容量使用',
            isPopular: false
        }
    ]

    for (const pkg of packages) {
        await prisma.rechargePackage.upsert({
            where: { name: pkg.name },
            update: {},
            create: {
                name: pkg.name,
                amount: pkg.amount,
                credits: pkg.credits,
                description: pkg.description,
                isPopular: pkg.isPopular,
                status: 'ACTIVE'
            }
        })
    }

    // 7. 创建系统配置
    console.log('Creating system configurations...')

    const configs = [
        {
            key: 'referral_reward_rate',
            value: '0.1',
            description: '推荐奖励比例（10%）',
            type: 'NUMBER'
        },
        {
            key: 'referral_level_formula',
            value: '(referralCount * 10 + totalRecharge / 100) / 50',
            description: '推荐等级计算公式',
            type: 'STRING'
        },
        {
            key: 'chat_credits_cost',
            value: '1',
            description: '每次对话消耗积分',
            type: 'NUMBER'
        },
        {
            key: 'vip_default_multiplier',
            value: '0.9',
            description: 'VIP用户默认计费乘数',
            type: 'NUMBER'
        }
    ]

    for (const config of configs) {
        await prisma.systemConfig.upsert({
            where: { key: config.key },
            update: {},
            create: {
                key: config.key,
                value: config.value,
                description: config.description,
                type: config.type as any
            }
        })
    }

    // 8. 创建系统公告
    console.log('Creating system announcements...')

    await prisma.announcement.upsert({
        where: { id: 'welcome' },
        update: {},
        create: {
            id: 'welcome',
            title: '欢迎使用智能助手！',
            content: '感谢您使用我们的智能助手服务。我们致力于为您提供最优质的AI对话体验。如有任何问题，请随时联系我们的客服团队。',
            type: 'INFO',
            status: 'ACTIVE',
            createdBy: adminUser.id
        }
    })

    console.log('Seeding finished.')
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })