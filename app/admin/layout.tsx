'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslation } from 'react-i18next'

interface AdminLayoutProps {
    children: React.ReactNode
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
    const { t } = useTranslation()
    const pathname = usePathname()
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

    const menuItems = [
        {
            id: 'dashboard',
            title: '仪表板',
            icon: (
                <svg className="w-5 h-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
            ),
            href: '/admin',
        },
        {
            id: 'users',
            title: '用户管理',
            icon: (
                <svg className="w-5 h-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
            ),
            href: '/admin/users',
        },
        {
            id: 'recharge',
            title: '充值管理',
            icon: (
                <svg className="w-5 h-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
            ),
            href: '/admin/recharge',
        },
        {
            id: 'referral',
            title: '推荐管理',
            icon: (
                <svg className="w-5 h-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
            ),
            href: '/admin/referral',
        },
        {
            id: 'announcements',
            title: '公告管理',
            icon: (
                <svg className="w-5 h-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                </svg>
            ),
            href: '/admin/announcements',
        },
        {
            id: 'system',
            title: '系统设置',
            icon: (
                <svg className="w-5 h-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            ),
            href: '/admin/system',
        },
        {
            id: 'logs',
            title: '系统日志',
            icon: (
                <svg className="w-5 h-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            ),
            href: '/admin/logs',
        },
    ]

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
            {/* 顶部导航栏 */}
            <nav className="h-16 glass-nav fixed top-0 left-0 right-0 z-50">
                <div className="flex items-center justify-between h-full px-6">
                    {/* 左侧：菜单按钮和Logo */}
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                            className="p-2 rounded-lg glass-effect hover:glow-blue transition-all duration-300"
                        >
                            <svg
                                className="w-6 h-6 text-blue-300"
                                fill="none"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                {isSidebarCollapsed ? (
                                    <path d="M4 6h16M4 12h16M4 18h16" />
                                ) : (
                                    <path d="M6 18L18 6M6 6l12 12" />
                                )}
                            </svg>
                        </button>

                        <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-cyan-300 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-sm">AI</span>
                            </div>
                            <span className="text-xl font-bold text-white">管理后台</span>
                        </div>
                    </div>

                    {/* 右侧：用户信息 */}
                    <div className="flex items-center space-x-4">
                        <Link href="/" className="text-blue-300 hover:text-white transition-colors">
                            返回前台
                        </Link>
                        <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                                <span className="text-white font-bold text-sm">A</span>
                            </div>
                            <span className="text-white font-medium">管理员</span>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="flex pt-16">
                {/* 左侧菜单 */}
                <aside
                    className={`fixed left-0 top-16 bottom-0 glass-sidebar transition-all duration-300 z-40 ${isSidebarCollapsed ? 'w-16' : 'w-64'
                        }`}
                >
                    <div className="flex flex-col h-full">
                        <nav className="flex-1 px-3 py-6">
                            <ul className="space-y-2">
                                {menuItems.map((item) => {
                                    const isActive = pathname === item.href || pathname.startsWith(item.href + '/')

                                    return (
                                        <li key={item.id}>
                                            <Link href={item.href}>
                                                <div
                                                    className={`flex items-center px-3 py-3 rounded-xl transition-all duration-300 group cursor-pointer ${isActive
                                                        ? 'bg-gradient-to-r from-blue-500 to-cyan-400 text-white glow-blue'
                                                        : 'text-blue-200 hover:bg-white/10 hover:text-white'
                                                        }`}
                                                >
                                                    <div className={`flex-shrink-0 ${isActive ? 'text-white' : 'text-blue-300 group-hover:text-white'}`}>
                                                        {item.icon}
                                                    </div>

                                                    {!isSidebarCollapsed && (
                                                        <span className="ml-3 font-medium">{item.title}</span>
                                                    )}
                                                </div>
                                            </Link>
                                        </li>
                                    )
                                })}
                            </ul>
                        </nav>
                    </div>
                </aside>

                {/* 主内容区域 */}
                <main
                    className={`flex-1 transition-all duration-300 ${isSidebarCollapsed ? 'ml-16' : 'ml-64'
                        }`}
                >
                    <div className="p-6">
                        <div className="h-full">
                            {children}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    )
}

export default AdminLayout