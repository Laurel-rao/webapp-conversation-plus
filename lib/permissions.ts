// 系统权限常量
export const PERMISSIONS = {
    // 用户管理
    USER_VIEW: 'user:view',
    USER_CREATE: 'user:create',
    USER_UPDATE: 'user:update',
    USER_DELETE: 'user:delete',
    USER_RECHARGE: 'user:recharge',

    // 角色管理
    ROLE_VIEW: 'role:view',
    ROLE_CREATE: 'role:create',
    ROLE_UPDATE: 'role:update',
    ROLE_DELETE: 'role:delete',

    // 菜单管理
    MENU_VIEW: 'menu:view',
    MENU_CREATE: 'menu:create',
    MENU_UPDATE: 'menu:update',
    MENU_DELETE: 'menu:delete',

    // 权限管理
    PERMISSION_VIEW: 'permission:view',
    PERMISSION_CREATE: 'permission:create',
    PERMISSION_UPDATE: 'permission:update',
    PERMISSION_DELETE: 'permission:delete',

    // 系统配置
    SYSTEM_CONFIG: 'system:config',
    SYSTEM_MONITOR: 'system:monitor',
    SYSTEM_LOG: 'system:log',

    // 公告管理
    ANNOUNCEMENT_VIEW: 'announcement:view',
    ANNOUNCEMENT_CREATE: 'announcement:create',
    ANNOUNCEMENT_UPDATE: 'announcement:update',
    ANNOUNCEMENT_DELETE: 'announcement:delete',

    // 充值管理
    RECHARGE_VIEW: 'recharge:view',
    RECHARGE_MANAGE: 'recharge:manage',

    // 推荐管理
    REFERRAL_VIEW: 'referral:view',
    REFERRAL_MANAGE: 'referral:manage',

    // 统计分析
    STATS_VIEW: 'stats:view',
    STATS_EXPORT: 'stats:export',
} as const

// 系统角色常量
export const ROLES = {
    SUPER_ADMIN: 'super_admin',
    ADMIN: 'admin',
    USER: 'user',
    VIP: 'vip',
} as const

// 默认角色权限映射
export const DEFAULT_ROLE_PERMISSIONS = {
    [ROLES.SUPER_ADMIN]: Object.values(PERMISSIONS), // 超级管理员拥有所有权限

    [ROLES.ADMIN]: [
        // 用户管理
        PERMISSIONS.USER_VIEW,
        PERMISSIONS.USER_CREATE,
        PERMISSIONS.USER_UPDATE,
        PERMISSIONS.USER_RECHARGE,

        // 充值管理
        PERMISSIONS.RECHARGE_VIEW,
        PERMISSIONS.RECHARGE_MANAGE,

        // 推荐管理
        PERMISSIONS.REFERRAL_VIEW,
        PERMISSIONS.REFERRAL_MANAGE,

        // 公告管理
        PERMISSIONS.ANNOUNCEMENT_VIEW,
        PERMISSIONS.ANNOUNCEMENT_CREATE,
        PERMISSIONS.ANNOUNCEMENT_UPDATE,

        // 统计分析
        PERMISSIONS.STATS_VIEW,
    ],

    [ROLES.USER]: [
        // 基础用户权限
    ],

    [ROLES.VIP]: [
        // VIP用户权限（继承普通用户权限）
    ],
}

// 菜单权限映射
export const MENU_PERMISSIONS = {
    // 管理后台
    '/admin': PERMISSIONS.USER_VIEW,
    '/admin/users': PERMISSIONS.USER_VIEW,
    '/admin/roles': PERMISSIONS.ROLE_VIEW,
    '/admin/permissions': PERMISSIONS.PERMISSION_VIEW,
    '/admin/menus': PERMISSIONS.MENU_VIEW,
    '/admin/system': PERMISSIONS.SYSTEM_CONFIG,
    '/admin/announcements': PERMISSIONS.ANNOUNCEMENT_VIEW,
    '/admin/recharge': PERMISSIONS.RECHARGE_VIEW,
    '/admin/referral': PERMISSIONS.REFERRAL_VIEW,
    '/admin/stats': PERMISSIONS.STATS_VIEW,
    '/admin/logs': PERMISSIONS.SYSTEM_LOG,

    // 用户端
    '/': '', // 首页无需权限
    '/chat': '', // 聊天页面无需权限
    '/billing': '', // 充值页面无需权限
    '/profile': '', // 个人中心无需权限
} as const

// API 权限映射
export const API_PERMISSIONS = {
    // 认证相关
    'POST /api/auth/login': '',
    'POST /api/auth/register': '',
    'POST /api/auth/logout': '',
    'GET /api/auth/me': '',

    // 用户管理
    'GET /api/users': PERMISSIONS.USER_VIEW,
    'POST /api/users': PERMISSIONS.USER_CREATE,
    'PUT /api/users/:id': PERMISSIONS.USER_UPDATE,
    'DELETE /api/users/:id': PERMISSIONS.USER_DELETE,
    'POST /api/users/:id/recharge': PERMISSIONS.USER_RECHARGE,

    // 角色管理
    'GET /api/roles': PERMISSIONS.ROLE_VIEW,
    'POST /api/roles': PERMISSIONS.ROLE_CREATE,
    'PUT /api/roles/:id': PERMISSIONS.ROLE_UPDATE,
    'DELETE /api/roles/:id': PERMISSIONS.ROLE_DELETE,

    // 菜单管理
    'GET /api/menus': PERMISSIONS.MENU_VIEW,
    'POST /api/menus': PERMISSIONS.MENU_CREATE,
    'PUT /api/menus/:id': PERMISSIONS.MENU_UPDATE,
    'DELETE /api/menus/:id': PERMISSIONS.MENU_DELETE,

    // 系统配置
    'GET /api/system/config': PERMISSIONS.SYSTEM_CONFIG,
    'PUT /api/system/config': PERMISSIONS.SYSTEM_CONFIG,
    'GET /api/system/monitor': PERMISSIONS.SYSTEM_MONITOR,
    'GET /api/system/logs': PERMISSIONS.SYSTEM_LOG,

    // 公告管理
    'GET /api/announcements': PERMISSIONS.ANNOUNCEMENT_VIEW,
    'POST /api/announcements': PERMISSIONS.ANNOUNCEMENT_CREATE,
    'PUT /api/announcements/:id': PERMISSIONS.ANNOUNCEMENT_UPDATE,
    'DELETE /api/announcements/:id': PERMISSIONS.ANNOUNCEMENT_DELETE,

    // 充值管理
    'GET /api/recharge/packages': PERMISSIONS.RECHARGE_VIEW,
    'POST /api/recharge/packages': PERMISSIONS.RECHARGE_MANAGE,
    'PUT /api/recharge/packages/:id': PERMISSIONS.RECHARGE_MANAGE,
    'DELETE /api/recharge/packages/:id': PERMISSIONS.RECHARGE_MANAGE,

    // 推荐管理
    'GET /api/referral/stats': PERMISSIONS.REFERRAL_VIEW,
    'PUT /api/referral/config': PERMISSIONS.REFERRAL_MANAGE,

    // 统计分析
    'GET /api/stats/users': PERMISSIONS.STATS_VIEW,
    'GET /api/stats/revenue': PERMISSIONS.STATS_VIEW,
    'GET /api/stats/usage': PERMISSIONS.STATS_VIEW,
} as const