'use client'
import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslation } from 'react-i18next'

interface SidebarProps {
    collapsed: boolean
    currentPage: string
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, currentPage }) => {
    const { t } = useTranslation()
    const pathname = usePathname()

    const menuItems = [
        {
            id: 'home',
            title: '首页',
            icon: (
                <svg className="w-6 h-6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
            ),
            href: '/',
        },
        {
            id: 'chat',
            title: '智能对话',
            icon: (
                <svg className="w-6 h-6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
            ),
            href: '/chat',
        },
        {
            id: 'billing',
            title: '充值中心',
            icon: (
                <svg className="w-6 h-6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
            ),
            href: '/billing',
        },
        {
            id: 'profile',
            title: '个人中心',
            icon: (
                <svg className="w-6 h-6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
            ),
            href: '/profile',
        },
    ]

    return (
        <aside
            className={`fixed left-0 top-16 bottom-0 glass-sidebar transition-all duration-300 z-40 ${collapsed ? 'w-16' : 'w-64'
                }`}
        >
            <div className="flex flex-col h-full">
                {/* 菜单项 */}
                <nav className="flex-1 px-3 py-6">
                    <ul className="space-y-3">
                        {menuItems.map((item) => {
                            const isActive = currentPage === item.id || pathname === item.href

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

                                            {!collapsed && (
                                                <span className="ml-3 font-medium">{item.title}</span>
                                            )}
                                        </div>
                                    </Link>
                                </li>
                            )
                        })}
                    </ul>
                </nav>

                {/* 底部信息 */}
                {!collapsed && (
                    <div className="p-4 border-t border-blue-400/20">
                        <div className="glass-card p-3">
                            <div className="text-blue-200 text-sm">
                                <div className="font-medium">剩余积分</div>
                                <div className="text-lg font-bold text-cyan-300">1,250</div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </aside>
    )
}

export default Sidebar