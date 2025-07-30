'use client'
import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/hooks/use-auth'

type TopNavbarProps = {
  onToggleSidebar: () => void
  isSidebarCollapsed: boolean
}

const TopNavbar: React.FC<TopNavbarProps> = ({ onToggleSidebar, isSidebarCollapsed }) => {
  const { t } = useTranslation()
  const { user, isAdmin, logout } = useAuth()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)

  // 点击外部区域关闭用户菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node))
        setShowUserMenu(false)
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

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
              {isSidebarCollapsed
                ? (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )
                : (
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
          {/* 管理后台快捷入口（仅管理员可见） */}
          {isAdmin() && (
            <Link href="/admin">
              <button className="p-2 rounded-lg glass-effect hover:glow-blue transition-all duration-300 relative" title="管理后台">
                <svg className="w-6 h-6 text-blue-300" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </button>
            </Link>
          )}

          {/* 通知按钮 */}
          <button className="p-2 rounded-lg glass-effect hover:glow-blue transition-all duration-300 relative">
            <svg className="w-6 h-6 text-blue-300" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} viewBox="0 0 24 24" stroke="currentColor">
              <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-400 rounded-full animate-pulse"></span>
          </button>

          {/* 用户菜单 */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 p-2 rounded-lg glass-effect hover:glow-blue transition-all duration-300"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">
                  {user?.nickname?.[0] || user?.email?.[0] || 'U'}
                </span>
              </div>
              <span className="text-white font-medium hidden md:block">
                {user?.nickname || user?.email || '用户'}
              </span>
              <svg className="w-4 h-4 text-blue-300" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} viewBox="0 0 24 24" stroke="currentColor">
                <path d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* 用户下拉菜单 */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 glass-card rounded-lg shadow-lg z-50">
                <div className="py-2">
                  <div className="px-4 py-2 border-b border-blue-400/20">
                    <p className="text-sm text-blue-200">已登录为</p>
                    <p className="font-medium text-white">
                      {user?.nickname || user?.email || '用户'}
                    </p>
                    {user?.roles && user.roles.length > 0 && (
                      <p className="text-xs text-cyan-300">
                        {user.roles.includes('super_admin')
                          ? '超级管理员'
                          : user.roles.includes('admin') ? '管理员' : '普通用户'}
                      </p>
                    )}
                  </div>

                  <Link href="/profile" className="block px-4 py-2 text-sm text-blue-200 hover:bg-white/10 hover:text-white">
                                        个人中心
                  </Link>

                  {isAdmin() && (
                    <Link href="/admin" className="block px-4 py-2 text-sm text-blue-200 hover:bg-white/10 hover:text-white">
                                            管理后台
                    </Link>
                  )}

                  <button
                    onClick={logout}
                    className="w-full text-left px-4 py-2 text-sm text-red-300 hover:bg-white/10 hover:text-red-200"
                  >
                                        退出登录
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default TopNavbar
