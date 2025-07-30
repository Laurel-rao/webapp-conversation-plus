'use client'
import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'

type SidebarProps = {
    collapsed: boolean
    currentPage: string
    showConversationList?: boolean
    conversationListData?: any
}

const Sidebar: React.FC<SidebarProps> = ({
    collapsed,
    currentPage,
    showConversationList = false,
    conversationListData = null,
}) => {
    const pathname = usePathname()
    const { isAdmin } = useAuth()

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

    // 管理员菜单项
    const adminMenuItems = [
        {
            id: 'admin',
            title: '管理后台',
            icon: (
                <svg className="w-6 h-6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
            ),
            href: '/admin',
        },
    ]

    // 根据用户权限动态生成菜单
    const allMenuItems = isAdmin() ? [...menuItems, ...adminMenuItems] : menuItems

    return (
        <aside
            className={`fixed left-0 top-16 bottom-0 glass-sidebar transition-all duration-300 z-40 ${collapsed ? 'w-16' : 'w-64'
                }`}
        >
            <div className="flex flex-col h-full">
                {/* 菜单项 */}
                {!showConversationList && (
                    <nav className="flex-1 px-3 py-6">
                        <ul className="space-y-3">
                            {allMenuItems.map((item) => {
                                const isActive = currentPage === item.id || pathname === item.href || pathname.startsWith(`${item.href}/`)

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
                )}

                {/* 对话列表 - 聊天页面专用 */}
                {showConversationList && !collapsed && conversationListData && (
                    <div className="flex flex-col h-full">
                        {/* 对话列表头部 */}
                        <div className="p-4 border-b border-blue-400/20">
                            <div className="flex items-center justify-between">
                                <h2 className="text-white font-medium">对话列表</h2>
                                <button
                                    onClick={() => conversationListData.onNewChat && conversationListData.onNewChat()}
                                    className="p-2 text-blue-200 hover:text-white rounded-lg hover:bg-white/10"
                                >
                                    <svg className="w-5 h-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} viewBox="0 0 24 24" stroke="currentColor">
                                        <path d="M12 4v16m8-8H4" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* 对话列表内容 */}
                        <div className="flex-1 overflow-y-auto p-3">
                            {(conversationListData.conversations && conversationListData.conversations.length > 0)
                                ? (
                                    <div className="space-y-2">
                                        {conversationListData.conversations.map((conversation: any) => (
                                            <div
                                                key={conversation.id}
                                                onClick={() => conversationListData.onSelectConversation && conversationListData.onSelectConversation(conversation.id)}
                                                className={`p-3 rounded-lg cursor-pointer transition-colors ${conversation.id === conversationListData.currentId
                                                    ? 'bg-blue-500/20 border border-blue-400/30 text-white'
                                                    : 'text-blue-200 hover:bg-white/10 hover:text-white'
                                                    }`}
                                            >
                                                <div className="flex items-center">
                                                    <svg className="w-4 h-4 mr-3 flex-shrink-0" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} viewBox="0 0 24 24" stroke="currentColor">
                                                        <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                                    </svg>
                                                    <span className="truncate text-sm" title={conversation.name}>
                                                        {conversation.name}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )
                                : (
                                    <div className="text-center text-blue-300/60 text-sm py-8">
                                        暂无对话记录
                                    </div>
                                )}
                        </div>

                        {/* 返回按钮 */}
                        <div className="p-3 border-t border-blue-400/20">
                            <Link href="/">
                                <div className="flex items-center px-3 py-2 text-blue-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                                    <svg className="w-4 h-4 mr-2" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} viewBox="0 0 24 24" stroke="currentColor">
                                        <path d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                    </svg>
                                    <span className="text-sm">返回首页</span>
                                </div>
                            </Link>
                        </div>
                    </div>
                )}

                {/* 底部信息 - 仅在非对话列表模式下显示 */}
                {!showConversationList && !collapsed && (
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
