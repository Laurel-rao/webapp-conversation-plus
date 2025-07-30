'use client'
import React, { useState } from 'react'
import Sidebar from './Sidebar'
import TopNavbar from './TopNavbar'
import { useTranslation } from 'react-i18next'

interface AppLayoutProps {
    children: React.ReactNode
    currentPage?: string
}

const AppLayout: React.FC<AppLayoutProps> = ({ children, currentPage = 'home' }) => {
    const { t } = useTranslation()
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
            {/* 顶部导航栏 */}
            <TopNavbar
                onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                isSidebarCollapsed={isSidebarCollapsed}
            />

            <div className="flex h-[calc(100vh-4rem)]">
                {/* 左侧菜单 */}
                <Sidebar
                    collapsed={isSidebarCollapsed}
                    currentPage={currentPage}
                />

                {/* 主内容区域 */}
                <main
                    className={`flex-1 transition-all duration-300 overflow-hidden ${isSidebarCollapsed ? 'ml-16' : 'ml-64'
                        }`}
                >
                    <div className="h-full p-6">
                        <div className="h-full glass-card">
                            {children}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    )
}

export default AppLayout