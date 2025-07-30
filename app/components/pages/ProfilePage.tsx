'use client'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

const ProfilePage: React.FC = () => {
    const { t } = useTranslation()

    const [userInfo, setUserInfo] = useState({
        username: 'user@example.com',
        nickname: 'AI用户',
        email: 'user@example.com',
        phone: '+86 138****8888',
        avatar: '',
        joinDate: '2023-10-15',
        lastLogin: '2024-01-20 14:30'
    })

    const [isEditing, setIsEditing] = useState(false)
    const [editForm, setEditForm] = useState(userInfo)

    const stats = [
        { label: '总对话次数', value: '1,234', icon: '💬' },
        { label: '使用天数', value: '89', icon: '📅' },
        { label: '积分消耗', value: '12,580', icon: '💎' },
        { label: '满意评价', value: '98%', icon: '⭐' }
    ]

    const handleSave = () => {
        setUserInfo(editForm)
        setIsEditing(false)
        // 这里可以调用API保存用户信息
        console.log('保存用户信息:', editForm)
    }

    const handleCancel = () => {
        setEditForm(userInfo)
        setIsEditing(false)
    }

    const handleInputChange = (field: string, value: string) => {
        setEditForm(prev => ({
            ...prev,
            [field]: value
        }))
    }

    return (
        <div className="h-full overflow-y-auto">
            <div className="p-8">
                {/* 页面标题 */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">个人中心</h1>
                    <p className="text-blue-200">管理您的个人信息和账户设置</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* 左侧：用户信息 */}
                    <div className="lg:col-span-2">
                        <div className="glass-card p-6 mb-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-white">基本信息</h2>
                                <button
                                    onClick={() => setIsEditing(!isEditing)}
                                    className="tech-button px-4 py-2 rounded-lg text-white text-sm font-medium"
                                >
                                    {isEditing ? '取消编辑' : '编辑信息'}
                                </button>
                            </div>

                            <div className="flex items-center mb-8">
                                <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white text-2xl font-bold mr-6">
                                    {userInfo.nickname.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">{userInfo.nickname}</h3>
                                    <p className="text-blue-200">{userInfo.email}</p>
                                    <p className="text-blue-300 text-sm">加入时间: {userInfo.joinDate}</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-blue-200 text-sm font-medium mb-2">昵称</label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={editForm.nickname}
                                                onChange={(e) => handleInputChange('nickname', e.target.value)}
                                                className="w-full px-4 py-3 bg-white/10 border border-blue-400/30 rounded-lg text-white placeholder-blue-300 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                                            />
                                        ) : (
                                            <div className="px-4 py-3 bg-white/5 border border-blue-400/20 rounded-lg text-white">
                                                {userInfo.nickname}
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-blue-200 text-sm font-medium mb-2">邮箱</label>
                                        {isEditing ? (
                                            <input
                                                type="email"
                                                value={editForm.email}
                                                onChange={(e) => handleInputChange('email', e.target.value)}
                                                className="w-full px-4 py-3 bg-white/10 border border-blue-400/30 rounded-lg text-white placeholder-blue-300 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                                            />
                                        ) : (
                                            <div className="px-4 py-3 bg-white/5 border border-blue-400/20 rounded-lg text-white">
                                                {userInfo.email}
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-blue-200 text-sm font-medium mb-2">手机号</label>
                                        {isEditing ? (
                                            <input
                                                type="tel"
                                                value={editForm.phone}
                                                onChange={(e) => handleInputChange('phone', e.target.value)}
                                                className="w-full px-4 py-3 bg-white/10 border border-blue-400/30 rounded-lg text-white placeholder-blue-300 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                                            />
                                        ) : (
                                            <div className="px-4 py-3 bg-white/5 border border-blue-400/20 rounded-lg text-white">
                                                {userInfo.phone}
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-blue-200 text-sm font-medium mb-2">最后登录</label>
                                        <div className="px-4 py-3 bg-white/5 border border-blue-400/20 rounded-lg text-white">
                                            {userInfo.lastLogin}
                                        </div>
                                    </div>
                                </div>

                                {isEditing && (
                                    <div className="flex space-x-4 pt-4">
                                        <button
                                            onClick={handleSave}
                                            className="tech-button px-6 py-3 rounded-lg text-white font-medium"
                                        >
                                            保存更改
                                        </button>
                                        <button
                                            onClick={handleCancel}
                                            className="px-6 py-3 bg-white/10 border border-blue-400/30 rounded-lg text-white font-medium hover:bg-white/20 transition-all duration-300"
                                        >
                                            取消
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 安全设置 */}
                        <div className="glass-card p-6">
                            <h2 className="text-2xl font-bold text-white mb-6">安全设置</h2>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-blue-400/20">
                                    <div>
                                        <h3 className="text-white font-medium">修改密码</h3>
                                        <p className="text-blue-200 text-sm">定期更新密码以保护账户安全</p>
                                    </div>
                                    <button className="tech-button px-4 py-2 rounded-lg text-white text-sm font-medium">
                                        修改
                                    </button>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-blue-400/20">
                                    <div>
                                        <h3 className="text-white font-medium">双重验证</h3>
                                        <p className="text-blue-200 text-sm">启用双重验证以增强账户安全</p>
                                    </div>
                                    <div className="flex items-center">
                                        <span className="text-green-300 text-sm mr-3">已启用</span>
                                        <div className="w-12 h-6 bg-green-500 rounded-full relative">
                                            <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-blue-400/20">
                                    <div>
                                        <h3 className="text-white font-medium">登录设备管理</h3>
                                        <p className="text-blue-200 text-sm">查看和管理已登录的设备</p>
                                    </div>
                                    <button className="tech-button px-4 py-2 rounded-lg text-white text-sm font-medium">
                                        管理
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 右侧：统计信息 */}
                    <div className="space-y-6">
                        <div className="glass-card p-6">
                            <h2 className="text-xl font-bold text-white mb-4">使用统计</h2>
                            <div className="space-y-4">
                                {stats.map((stat, index) => (
                                    <div key={index} className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <span className="text-2xl mr-3">{stat.icon}</span>
                                            <span className="text-blue-200">{stat.label}</span>
                                        </div>
                                        <span className="text-white font-bold">{stat.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="glass-card p-6">
                            <h2 className="text-xl font-bold text-white mb-4">账户等级</h2>
                            <div className="text-center">
                                <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="text-white text-2xl font-bold">VIP</span>
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">高级用户</h3>
                                <p className="text-blue-200 text-sm mb-4">享受更多高级功能和优先服务</p>
                                <div className="bg-white/10 rounded-full h-2 mb-2">
                                    <div className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                                </div>
                                <p className="text-blue-200 text-xs">距离下一等级还需 2,500 积分</p>
                            </div>
                        </div>

                        <div className="glass-card p-6">
                            <h2 className="text-xl font-bold text-white mb-4">推荐奖励</h2>
                            <div className="text-center">
                                <div className="text-3xl mb-2">🎁</div>
                                <p className="text-blue-200 text-sm mb-4">邀请好友注册即可获得积分奖励</p>
                                <button className="tech-button w-full py-2 rounded-lg text-white text-sm font-medium">
                                    立即邀请
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ProfilePage