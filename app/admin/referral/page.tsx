'use client'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

type ReferralStats = {
  totalUsers: number
  totalRewards: number
  activeReferrers: number
  conversionRate: string
  topReferrers: Array<{
    id: string
    email: string
    nickname?: string
    referralCount: number
    totalRewards: number
    level: number
  }>
  recentRewards: Array<{
    id: string
    referrer: {
      email: string
      nickname?: string
    }
    referee: {
      email: string
      nickname?: string
    }
    amount: number
    type: string
    createdAt: string
  }>
}

type ReferralConfig = {
  enabled: boolean
  baseReward: number
  levelRewards: Record<string, number>
  maxLevel: number
  requirementPerLevel: number
  rewardTypes: {
    registration: number
    firstRecharge: number
    consumption: number
  }
}

const ReferralManagement: React.FC = () => {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<'stats' | 'config'>('stats')
  const [stats, setStats] = useState<ReferralStats | null>(null)
  const [config, setConfig] = useState<ReferralConfig | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (activeTab === 'stats')
      fetchStats()
    else
      fetchConfig()
  }, [activeTab])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/referral/stats', {
        credentials: 'include',
      })
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    }
    catch (error) {
      console.error('Failed to fetch referral stats:', error)
    }
    finally {
      setLoading(false)
    }
  }

  const fetchConfig = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/referral/config', {
        credentials: 'include',
      })
      if (response.ok) {
        const config = await response.json()
        setConfig(config)
      }
    }
    catch (error) {
      console.error('Failed to fetch referral config:', error)
    }
    finally {
      setLoading(false)
    }
  }

  const saveConfig = async (newConfig: ReferralConfig | null) => {
    if (!newConfig) return
    try {
      const response = await fetch('/api/referral/config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(newConfig),
      })

      if (response.ok) {
        setConfig(newConfig)
        alert('配置保存成功！')
      }
    }
    catch (error) {
      console.error('Failed to save config:', error)
      alert('保存失败，请重试')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN')
  }

  const getRewardTypeText = (type: string) => {
    const typeMap: Record<string, string> = {
      registration: '注册奖励',
      firstRecharge: '首充奖励',
      consumption: '消费分成',
    }
    return typeMap[type] || type
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white">加载中...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">推荐管理</h1>
          <p className="text-blue-200 mt-1">管理推荐系统和奖励配置</p>
        </div>
      </div>

      {/* 选项卡 */}
      <div className="glass-card">
        <div className="flex border-b border-blue-400/20">
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-6 py-3 font-medium transition-colors ${activeTab === 'stats'
              ? 'text-cyan-300 border-b-2 border-cyan-300'
              : 'text-blue-200 hover:text-white'
              }`}
          >
            推荐统计
          </button>
          <button
            onClick={() => setActiveTab('config')}
            className={`px-6 py-3 font-medium transition-colors ${activeTab === 'config'
              ? 'text-cyan-300 border-b-2 border-cyan-300'
              : 'text-blue-200 hover:text-white'
              }`}
          >
            系统配置
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'stats' ? (
            <div className="space-y-6">
              {/* 统计概览 */}
              {stats && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="glass-card p-4">
                      <div className="text-blue-200 text-sm">总推荐用户</div>
                      <div className="text-2xl font-bold text-white">{stats?.totalUsers || 0}</div>
                    </div>
                    <div className="glass-card p-4">
                      <div className="text-blue-200 text-sm">总奖励金额</div>
                      <div className="text-2xl font-bold text-green-300">¥{stats?.totalRewards || 0}</div>
                    </div>
                    <div className="glass-card p-4">
                      <div className="text-blue-200 text-sm">活跃推荐者</div>
                      <div className="text-2xl font-bold text-cyan-300">{stats?.activeReferrers || 0}</div>
                    </div>
                    <div className="glass-card p-4">
                      <div className="text-blue-200 text-sm">转化率</div>
                      <div className="text-2xl font-bold text-purple-300">{stats?.conversionRate || 0}%</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* 顶级推荐者 */}
                    <div className="glass-card p-6">
                      <h3 className="text-xl font-bold text-white mb-4">顶级推荐者</h3>
                      <div className="space-y-3">
                        {stats?.topReferrers?.map((referrer, index) => (
                          <div key={referrer.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                                <span className="text-white font-bold text-sm">{index + 1}</span>
                              </div>
                              <div>
                                <div className="text-white font-medium">
                                  {referrer.nickname || referrer.email}
                                </div>
                                <div className="text-blue-300 text-sm">等级 {referrer.level}</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-white font-medium">{referrer.referralCount} 人</div>
                              <div className="text-green-300 text-sm">¥{referrer.totalRewards}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 最近奖励 */}
                    <div className="glass-card p-6">
                      <h3 className="text-xl font-bold text-white mb-4">最近奖励</h3>
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {stats?.recentRewards?.map(reward => (
                          <div key={reward.id} className="p-3 bg-white/5 rounded-lg">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="text-white font-medium">
                                  {reward.referrer.nickname || reward.referrer.email}
                                </div>
                                <div className="text-blue-300 text-sm">
                                  推荐 {reward.referee.nickname || reward.referee.email}
                                </div>
                                <div className="text-gray-400 text-xs">
                                  {getRewardTypeText(reward.type)}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-green-300 font-medium">+¥{reward.amount}</div>
                                <div className="text-gray-400 text-xs">
                                  {formatDate(reward.createdAt)}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            /* 配置设置 */
            <div className="space-y-6">
              {!config ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-white">加载配置中...</div>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    saveConfig(config)
                  }}
                  className="space-y-6"
                >
                  {/* 基本配置 */}
                  <div className="glass-card p-6">
                    <h3 className="text-xl font-bold text-white mb-4">基本配置</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex items-center">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            className="mr-3"
                            checked={config.enabled || false}
                            onChange={e => config && setConfig({ ...config, enabled: e.target.checked })}
                          />
                          <span className="text-white font-medium">启用推荐系统</span>
                        </label>
                      </div>

                      <div>
                        <label className="block text-blue-200 text-sm font-medium mb-2">基础奖励（元）</label>
                        <input
                          type="number"
                          step="0.01"
                          className="w-full px-3 py-2 bg-white/10 border border-blue-400/30 rounded-lg text-white"
                          value={config.baseReward || 0}
                          onChange={e => config && setConfig({ ...config, baseReward: Number(e.target.value) })}
                        />
                      </div>

                      <div>
                        <label className="block text-blue-200 text-sm font-medium mb-2">最大等级</label>
                        <input
                          type="number"
                          className="w-full px-3 py-2 bg-white/10 border border-blue-400/30 rounded-lg text-white"
                          value={config.maxLevel || 1}
                          onChange={e => config && setConfig({ ...config, maxLevel: Number(e.target.value) })}
                        />
                      </div>

                      <div>
                        <label className="block text-blue-200 text-sm font-medium mb-2">每级要求人数</label>
                        <input
                          type="number"
                          className="w-full px-3 py-2 bg-white/10 border border-blue-400/30 rounded-lg text-white"
                          value={config.requirementPerLevel || 1}
                          onChange={e => config && setConfig({ ...config, requirementPerLevel: Number(e.target.value) })}
                        />
                      </div>
                    </div>
                  </div>

                  {/* 奖励类型配置 */}
                  <div className="glass-card p-6">
                    <h3 className="text-xl font-bold text-white mb-4">奖励类型配置</h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-blue-200 text-sm font-medium mb-2">注册奖励（元）</label>
                        <input
                          type="number"
                          step="0.01"
                          className="w-full px-3 py-2 bg-white/10 border border-blue-400/30 rounded-lg text-white"
                          value={config.rewardTypes?.registration || 0}
                          onChange={e => config && setConfig({
                            ...config,
                            rewardTypes: {
                              ...config.rewardTypes,
                              registration: Number(e.target.value),
                            },
                          })}
                        />
                      </div>

                      <div>
                        <label className="block text-blue-200 text-sm font-medium mb-2">首充奖励（元）</label>
                        <input
                          type="number"
                          step="0.01"
                          className="w-full px-3 py-2 bg-white/10 border border-blue-400/30 rounded-lg text-white"
                          value={config.rewardTypes?.firstRecharge || 0}
                          onChange={e => config && setConfig({
                            ...config,
                            rewardTypes: {
                              ...config.rewardTypes,
                              firstRecharge: Number(e.target.value),
                            },
                          })}
                        />
                      </div>

                      <div>
                        <label className="block text-blue-200 text-sm font-medium mb-2">消费分成（%）</label>
                        <input
                          type="number"
                          step="0.01"
                          className="w-full px-3 py-2 bg-white/10 border border-blue-400/30 rounded-lg text-white"
                          value={config.rewardTypes?.consumption || 0}
                          onChange={e => config && setConfig({
                            ...config,
                            rewardTypes: {
                              ...config.rewardTypes,
                              consumption: Number(e.target.value),
                            },
                          })}
                        />
                      </div>
                    </div>
                  </div>

                  {/* 等级奖励配置 */}
                  <div className="glass-card p-6">
                    <h3 className="text-xl font-bold text-white mb-4">等级奖励配置</h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {Array.from({ length: config?.maxLevel || 0 }, (_, i) => i + 1).map(level => (
                        <div key={level}>
                          <label className="block text-blue-200 text-sm font-medium mb-2">
                            等级 {level} 奖励倍数
                          </label>
                          <input
                            type="number"
                            step="0.1"
                            className="w-full px-3 py-2 bg-white/10 border border-blue-400/30 rounded-lg text-white"
                            value={config?.levelRewards?.[level.toString()] || 1}
                            onChange={e => config && setConfig({
                              ...config,
                              levelRewards: {
                                ...config.levelRewards,
                                [level.toString()]: Number(e.target.value),
                              },
                            })}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
                    >
                      保存配置
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ReferralManagement
