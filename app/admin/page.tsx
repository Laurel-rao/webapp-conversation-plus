'use client'
import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

interface DashboardStats {
    userStats: {
        total: number
        new: number
        active: number
        suspended: number
    }
    revenueStats: {
        total: number
        daily: Record<string, number>
    }
    rechargeStats: {
        total: number
        successful: number
        pending: number
        successRate: string
    }
    consumptionStats: {
        total: number
        byType: Record<string, number>
    }
    recentActivities: Array<{
        id: string
        action: string
        user: {
            id: string
            email: string
            nickname?: string
        }
        createdAt: string
        ip?: string
    }>
    topUsers: Array<{
        id: string
        email: string
        nickname?: string
        totalRecharge: number
        totalConsumption: number
        referralCount: number
        lastLoginAt?: string
    }>
}

const AdminDashboard: React.FC = () => {
    const { t } = useTranslation()
    const [stats, setStats] = useState<DashboardStats | null>(null)
    const [loading, setLoading] = useState(true)
    const [period, setPeriod] = useState('30')

    useEffect(() => {
        fetchDashboardData()
    }, [period])

    const fetchDashboardData = async () => {
        try {
            setLoading(true)
            const response = await fetch(`/api/admin/dashboard?period=${period}`)
            if (response.ok) {
                const data = await response.json()
                setStats(data)
            }
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error)
        } finally {
            setLoading(false)
        }
    }

    const formatActionText = (action: string) => {
        const actionMap: Record<string, string> = {
            'LOGIN_SUCCESS': '登录成功',
            'USER_REGISTER': '用户注册',
            'RECHARGE_SUCCESS': '充值成功',
            'CREATE_USER': '创建用户'
        }
        return actionMap[action] || action
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('zh-CN')
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-white">加载中...</div>
            </div>
        )
    }

    if (!stats) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-red-300">加载失败</div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* 页面标题 */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">仪表板</h1>
                    <p className="text-blue-200 mt-1">系统概览和统计数据</p>
                </div>

                <div className="flex items-center space-x-4">
                    <select
                        value={period}
                        onChange={(e) => setPeriod(e.target.value)}
                        className="px-4 py-2 bg-white/10 border border-blue-400/30 rounded-lg text-white focus:outline-none focus:border-cyan-400"
                    >
                        <option value="7">最近 7 天</option>
                        <option value="30">最近 30 天</option>
                        <option value="90">最近 90 天</option>
                    </select>

                    <button
                        onClick={fetchDashboardData}
                        className="tech-button px-4 py-2 rounded-lg text-white font-medium"
                    >
                        刷新数据
                    </button>
                </div>
            </div>

            {/* 统计卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* 用户统计 */}
                <div className="glass-card p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-white">用户统计</h3>
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} viewBox="0 0 24 24" stroke="currentColor">
                                <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                            </svg>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span className="text-blue-200">总用户数</span>
                            <span className="text-white font-bold">{stats.userStats.total}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-blue-200">新用户</span>
                            <span className="text-cyan-300 font-bold">{stats.userStats.new}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-blue-200">活跃用户</span>
                            <span className="text-green-300 font-bold">{stats.userStats.active}</span>
                        </div>
                    </div>
                </div>

                {/* 收入统计 */}
                <div className="glass-card p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-white">收入统计</h3>
                        <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-400 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} viewBox="0 0 24 24" stroke="currentColor">
                                <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                            </svg>
                        </div>
                    </div>
                    <div className="text-3xl font-bold text-teal-300 mb-2">
                        ¥{stats.revenueStats.total.toLocaleString()}
                    </div>
                    <div className="text-blue-200 text-sm">
                        {period} 天总收入
                    </div>
                </div>

                {/* 充值统计 */}
                <div className="glass-card p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-white">充值统计</h3>
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-400 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} viewBox="0 0 24 24" stroke="currentColor">
                                <path d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                            </svg>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span className="text-blue-200">总充值</span>
                            <span className="text-white font-bold">{stats.rechargeStats.total}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-blue-200">成功率</span>
                            <span className="text-green-300 font-bold">{stats.rechargeStats.successRate}%</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-blue-200">待处理</span>
                            <span className="text-yellow-300 font-bold">{stats.rechargeStats.pending}</span>
                        </div>
                    </div>
                </div>

                {/* 消费统计 */}
                <div className="glass-card p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-white">消费统计</h3>
                        <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-400 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} viewBox="0 0 24 24" stroke="currentColor">
                                <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </div>
                    </div>
                    <div className="text-3xl font-bold text-orange-300 mb-2">
                        {stats.consumptionStats.total.toLocaleString()}
                    </div>
                    <div className="text-blue-200 text-sm">
                        总消费积分
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 最近活动 */}
                <div className="glass-card p-6">
                    <h3 className="text-xl font-bold text-white mb-6">最近活动</h3>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                        {stats.recentActivities.map((activity) => (
                            <div key={activity.id} className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-cyan-300 rounded-full flex items-center justify-center">
                                    <span className="text-white font-bold text-sm">
                                        {activity.user?.nickname?.[0] || activity.user?.email?.[0] || '?'}
                                    </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-white font-medium">
                                        {activity.user?.nickname || activity.user?.email}
                                    </p>
                                    <p className="text-blue-200 text-sm">
                                        {formatActionText(activity.action)}
                                    </p>
                                    <p className="text-blue-300 text-xs">
                                        {formatDate(activity.createdAt)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 活跃用户 */}
                <div className="glass-card p-6">
                    <h3 className="text-xl font-bold text-white mb-6">活跃用户</h3>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                        {stats.topUsers.map((user, index) => (
                            <div key={user.id} className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                                <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                                    <span className="text-white font-bold text-sm">{index + 1}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-white font-medium">
                                        {user.nickname || user.email}
                                    </p>
                                    <div className="flex items-center space-x-4 text-xs text-blue-200">
                                        <span>充值: ¥{user.totalRecharge}</span>
                                        <span>推荐: {user.referralCount}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AdminDashboard