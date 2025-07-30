'use client'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

const BillingPage: React.FC = () => {
    const { t } = useTranslation()
    const [selectedPlan, setSelectedPlan] = useState<string>('')

    const userBalance = {
        credits: 1250,
        totalSpent: 4580,
        lastRecharge: '2024-01-15'
    }

    const pricingPlans = [
        {
            id: 'basic',
            name: '基础套餐',
            credits: 1000,
            price: 19,
            features: [
                '1000个AI对话积分',
                '标准响应速度',
                '基础功能支持',
                '7天有效期'
            ],
            popular: false,
            color: 'from-blue-500 to-cyan-400'
        },
        {
            id: 'pro',
            name: '专业套餐',
            credits: 5000,
            price: 89,
            features: [
                '5000个AI对话积分',
                '优先响应速度',
                '高级功能支持',
                '30天有效期',
                '文档上传分析',
                '24/7客服支持'
            ],
            popular: true,
            color: 'from-purple-500 to-pink-400'
        },
        {
            id: 'enterprise',
            name: '企业套餐',
            credits: 20000,
            price: 299,
            features: [
                '20000个AI对话积分',
                '极速响应',
                '全功能访问',
                '90天有效期',
                '批量文档处理',
                '专属客服',
                'API接口访问',
                '定制化服务'
            ],
            popular: false,
            color: 'from-green-500 to-teal-400'
        }
    ]

    const rechargeHistory = [
        { date: '2024-01-15', amount: 89, credits: 5000, status: '已完成' },
        { date: '2023-12-20', amount: 19, credits: 1000, status: '已完成' },
        { date: '2023-11-28', amount: 89, credits: 5000, status: '已完成' },
        { date: '2023-11-10', amount: 19, credits: 1000, status: '已完成' }
    ]

    const handlePurchase = (planId: string) => {
        setSelectedPlan(planId)
        // 这里可以集成支付逻辑
        console.log(`购买套餐: ${planId}`)
    }

    return (
        <div className="h-full overflow-y-auto">
            <div className="p-8">
                {/* 页面标题 */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">充值中心</h1>
                    <p className="text-blue-200">管理您的积分余额和充值记录</p>
                </div>

                {/* 余额概览 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="glass-card p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-white">当前余额</h3>
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} viewBox="0 0 24 24" stroke="currentColor">
                                    <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                </svg>
                            </div>
                        </div>
                        <div className="text-3xl font-bold text-cyan-300">{userBalance.credits.toLocaleString()}</div>
                        <div className="text-blue-200 text-sm mt-1">可用积分</div>
                    </div>

                    <div className="glass-card p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-white">累计消费</h3>
                            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-400 rounded-full flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} viewBox="0 0 24 24" stroke="currentColor">
                                    <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                        </div>
                        <div className="text-3xl font-bold text-pink-300">¥{userBalance.totalSpent.toLocaleString()}</div>
                        <div className="text-blue-200 text-sm mt-1">总金额</div>
                    </div>

                    <div className="glass-card p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-white">最近充值</h3>
                            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-400 rounded-full flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} viewBox="0 0 24 24" stroke="currentColor">
                                    <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                        </div>
                        <div className="text-3xl font-bold text-teal-300">{userBalance.lastRecharge}</div>
                        <div className="text-blue-200 text-sm mt-1">充值日期</div>
                    </div>
                </div>

                {/* 套餐选择 */}
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-white mb-6">选择充值套餐</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {pricingPlans.map((plan) => (
                            <div
                                key={plan.id}
                                className={`glass-card p-6 relative transition-all duration-300 hover:scale-105 cursor-pointer ${plan.popular ? 'ring-2 ring-cyan-400 glow-blue' : ''
                                    }`}
                                onClick={() => handlePurchase(plan.id)}
                            >
                                {plan.popular && (
                                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                                        <span className="bg-gradient-to-r from-cyan-400 to-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                                            推荐
                                        </span>
                                    </div>
                                )}

                                <div className={`w-16 h-16 bg-gradient-to-r ${plan.color} rounded-2xl flex items-center justify-center mb-4 mx-auto`}>
                                    <svg className="w-8 h-8 text-white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} viewBox="0 0 24 24" stroke="currentColor">
                                        <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                    </svg>
                                </div>

                                <h3 className="text-xl font-bold text-white text-center mb-2">{plan.name}</h3>
                                <div className="text-center mb-4">
                                    <span className="text-3xl font-bold text-white">¥{plan.price}</span>
                                    <div className="text-cyan-300 text-sm mt-1">{plan.credits.toLocaleString()} 积分</div>
                                </div>

                                <ul className="space-y-2 mb-6">
                                    {plan.features.map((feature, index) => (
                                        <li key={index} className="flex items-start text-blue-200 text-sm">
                                            <svg className="w-4 h-4 text-cyan-400 mt-0.5 mr-2 flex-shrink-0" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} viewBox="0 0 24 24" stroke="currentColor">
                                                <path d="M5 13l4 4L19 7" />
                                            </svg>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>

                                <button className={`w-full tech-button py-3 rounded-xl text-white font-medium transition-all duration-300 ${selectedPlan === plan.id ? 'scale-95' : ''
                                    }`}>
                                    立即购买
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 充值记录 */}
                <div className="glass-card p-6">
                    <h2 className="text-2xl font-bold text-white mb-6">充值记录</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-blue-400/20">
                                    <th className="text-left py-3 px-4 text-blue-200 font-medium">日期</th>
                                    <th className="text-left py-3 px-4 text-blue-200 font-medium">金额</th>
                                    <th className="text-left py-3 px-4 text-blue-200 font-medium">积分</th>
                                    <th className="text-left py-3 px-4 text-blue-200 font-medium">状态</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rechargeHistory.map((record, index) => (
                                    <tr key={index} className="border-b border-blue-400/10 hover:bg-white/5 transition-colors">
                                        <td className="py-3 px-4 text-white">{record.date}</td>
                                        <td className="py-3 px-4 text-white">¥{record.amount}</td>
                                        <td className="py-3 px-4 text-cyan-300">{record.credits.toLocaleString()}</td>
                                        <td className="py-3 px-4">
                                            <span className="px-2 py-1 bg-green-500/20 text-green-300 rounded-full text-sm">
                                                {record.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default BillingPage