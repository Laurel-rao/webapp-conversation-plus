'use client'
import React from 'react'
import { useTranslation } from 'react-i18next'

interface TopNavbarProps {
    onToggleSidebar: () => void
    isSidebarCollapsed: boolean
}

const TopNavbar: React.FC<TopNavbarProps> = ({ onToggleSidebar, isSidebarCollapsed }) => {
    const { t } = useTranslation()

    return (
        <nav className="h-16 glass-nav fixed top-0 left-0 right-0 z-50">
            <div className="flex items-center justify-between h-full px-6">
                {/* 左侧：菜单按钮和Logo */}
                <div className="flex items-center space-x-4">
                    <button
                        onClick={onToggleSidebar}
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
                        <span className="text-xl font-bold text-white">智能助手</span>
                    </div>
                </div>

                {/* 右侧：用户信息和设置 */}
                <div className="flex items-center space-x-4">
                    {/* 通知按钮 */}
                    <button className="p-2 rounded-lg glass-effect hover:glow-blue transition-all duration-300 relative">
                        <svg className="w-6 h-6 text-blue-300" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} viewBox="0 0 24 24" stroke="currentColor">
                            <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-400 rounded-full animate-pulse"></span>
                    </button>

                    {/* 用户头像 */}
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-sm">U</span>
                        </div>
                        <span className="text-white font-medium hidden md:block">用户</span>
                    </div>
                </div>
            </div>
        </nav>
    )
}

export default TopNavbar