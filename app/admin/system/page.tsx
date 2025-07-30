'use client'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

type SystemConfig = {
  general: {
    siteName: string
    siteDescription: string
    siteLogo?: string
    contactEmail: string
    supportUrl?: string
    termsUrl?: string
    privacyUrl?: string
  }
  auth: {
    allowRegistration: boolean
    emailVerificationRequired: boolean
    passwordMinLength: number
    sessionTimeout: number
    maxLoginAttempts: number
  }
  payment: {
    enabled: boolean
    currency: string
    minRechargeAmount: number
    maxRechargeAmount: number
    defaultCreditsPerYuan: number
  }
  ai: {
    defaultModel: string
    maxTokensPerRequest: number
    maxRequestsPerDay: number
    creditCostPerToken: number
  }
  security: {
    rateLimitEnabled: boolean
    maxRequestsPerMinute: number
    ipWhitelist?: string[]
    maintenanceMode: boolean
  }
}

const SystemManagement: React.FC = () => {
  const { t } = useTranslation()
  const [config, setConfig] = useState<SystemConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'general' | 'auth' | 'payment' | 'ai' | 'security'>('general')

  useEffect(() => {
    fetchConfig()
  }, [])

  const fetchConfig = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/system/config', {
        credentials: 'include',
      })
      if (response.ok) {
        const data = await response.json()
        setConfig(data.config)
      }
    }
    catch (error) {
      console.error('Failed to fetch system config:', error)
    }
    finally {
      setLoading(false)
    }
  }

  const saveConfig = async () => {
    if (!config)
      return

    try {
      setSaving(true)
      const response = await fetch('/api/admin/system/config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(config),
      })

      if (response.ok)
        alert('配置保存成功！')
      else
        alert('保存失败，请重试')
    }
    catch (error) {
      console.error('Failed to save config:', error)
      alert('保存失败，请重试')
    }
    finally {
      setSaving(false)
    }
  }

  const updateConfig = (section: keyof SystemConfig, key: string, value: any) => {
    if (!config)
      return

    setConfig({
      ...config,
      [section]: {
        ...config[section],
        [key]: value,
      },
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white">加载中...</div>
      </div>
    )
  }

  if (!config) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-300">加载配置失败</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">系统设置</h1>
          <p className="text-blue-200 mt-1">管理系统配置和参数</p>
        </div>

        <button
          onClick={saveConfig}
          disabled={saving}
          className="tech-button px-6 py-2 rounded-lg text-white font-medium disabled:opacity-50"
        >
          {saving ? '保存中...' : '保存配置'}
        </button>
      </div>

      {/* 选项卡 */}
      <div className="glass-card">
        <div className="flex border-b border-blue-400/20 overflow-x-auto">
          {[
            { key: 'general', label: '基本设置' },
            { key: 'auth', label: '认证设置' },
            { key: 'payment', label: '支付设置' },
            { key: 'ai', label: 'AI设置' },
            { key: 'security', label: '安全设置' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-6 py-3 font-medium transition-colors whitespace-nowrap ${activeTab === tab.key
                ? 'text-cyan-300 border-b-2 border-cyan-300'
                : 'text-blue-200 hover:text-white'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === 'general' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-white">基本设置</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-blue-200 text-sm font-medium mb-2">网站名称</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 bg-white/10 border border-blue-400/30 rounded-lg text-white"
                    value={config.general?.siteName || ''}
                    onChange={e => config && updateConfig('general', 'siteName', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-blue-200 text-sm font-medium mb-2">联系邮箱</label>
                  <input
                    type="email"
                    className="w-full px-3 py-2 bg-white/10 border border-blue-400/30 rounded-lg text-white"
                    value={config.general?.contactEmail || ''}
                    onChange={e => config && updateConfig('general', 'contactEmail', e.target.value)}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-blue-200 text-sm font-medium mb-2">网站描述</label>
                  <textarea
                    className="w-full px-3 py-2 bg-white/10 border border-blue-400/30 rounded-lg text-white"
                    rows={3}
                    value={config.general?.siteDescription || ''}
                    onChange={e => updateConfig('general', 'siteDescription', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-blue-200 text-sm font-medium mb-2">支持页面URL</label>
                  <input
                    type="url"
                    className="w-full px-3 py-2 bg-white/10 border border-blue-400/30 rounded-lg text-white"
                    value={config.general?.supportUrl || ''}
                    onChange={e => updateConfig('general', 'supportUrl', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-blue-200 text-sm font-medium mb-2">使用条款URL</label>
                  <input
                    type="url"
                    className="w-full px-3 py-2 bg-white/10 border border-blue-400/30 rounded-lg text-white"
                    value={config.general?.termsUrl || ''}
                    onChange={e => updateConfig('general', 'termsUrl', e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'auth' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-white">认证设置</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="mr-3"
                      checked={config.auth?.allowRegistration || false}
                      onChange={e => updateConfig('auth', 'allowRegistration', e.target.checked)}
                    />
                    <span className="text-white">允许用户注册</span>
                  </label>
                </div>

                <div className="flex items-center">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="mr-3"
                      checked={config.auth?.emailVerificationRequired || false}
                      onChange={e => updateConfig('auth', 'emailVerificationRequired', e.target.checked)}
                    />
                    <span className="text-white">需要邮箱验证</span>
                  </label>
                </div>

                <div>
                  <label className="block text-blue-200 text-sm font-medium mb-2">密码最小长度</label>
                  <input
                    type="number"
                    min="6"
                    max="50"
                    className="w-full px-3 py-2 bg-white/10 border border-blue-400/30 rounded-lg text-white"
                    value={config.auth?.passwordMinLength || 8}
                    onChange={e => updateConfig('auth', 'passwordMinLength', Number(e.target.value))}
                  />
                </div>

                <div>
                  <label className="block text-blue-200 text-sm font-medium mb-2">会话超时（分钟）</label>
                  <input
                    type="number"
                    min="30"
                    className="w-full px-3 py-2 bg-white/10 border border-blue-400/30 rounded-lg text-white"
                    value={config.auth?.sessionTimeout || 7200}
                    onChange={e => updateConfig('auth', 'sessionTimeout', Number(e.target.value))}
                  />
                </div>

                <div>
                  <label className="block text-blue-200 text-sm font-medium mb-2">最大登录失败次数</label>
                  <input
                    type="number"
                    min="3"
                    max="20"
                    className="w-full px-3 py-2 bg-white/10 border border-blue-400/30 rounded-lg text-white"
                    value={config.auth?.maxLoginAttempts || 5}
                    onChange={e => updateConfig('auth', 'maxLoginAttempts', Number(e.target.value))}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'payment' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-white">支付设置</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="mr-3"
                      checked={config.payment?.enabled || false}
                      onChange={e => updateConfig('payment', 'enabled', e.target.checked)}
                    />
                    <span className="text-white">启用支付功能</span>
                  </label>
                </div>

                <div>
                  <label className="block text-blue-200 text-sm font-medium mb-2">货币单位</label>
                  <select
                    className="w-full px-3 py-2 bg-white/10 border border-blue-400/30 rounded-lg text-white"
                    value={config.payment?.currency || 'CNY'}
                    onChange={e => updateConfig('payment', 'currency', e.target.value)}
                  >
                    <option value="CNY">人民币 (CNY)</option>
                    <option value="USD">美元 (USD)</option>
                    <option value="EUR">欧元 (EUR)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-blue-200 text-sm font-medium mb-2">最小充值金额</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    className="w-full px-3 py-2 bg-white/10 border border-blue-400/30 rounded-lg text-white"
                    value={config.payment?.minRechargeAmount || 10}
                    onChange={e => updateConfig('payment', 'minRechargeAmount', Number(e.target.value))}
                  />
                </div>

                <div>
                  <label className="block text-blue-200 text-sm font-medium mb-2">最大充值金额</label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    className="w-full px-3 py-2 bg-white/10 border border-blue-400/30 rounded-lg text-white"
                    value={config.payment?.maxRechargeAmount || 10000}
                    onChange={e => updateConfig('payment', 'maxRechargeAmount', Number(e.target.value))}
                  />
                </div>

                <div>
                  <label className="block text-blue-200 text-sm font-medium mb-2">每元兑换积分数</label>
                  <input
                    type="number"
                    min="1"
                    className="w-full px-3 py-2 bg-white/10 border border-blue-400/30 rounded-lg text-white"
                    value={config.payment?.defaultCreditsPerYuan || 100}
                    onChange={e => updateConfig('payment', 'defaultCreditsPerYuan', Number(e.target.value))}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ai' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-white">AI设置</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-blue-200 text-sm font-medium mb-2">默认模型</label>
                  <select
                    className="w-full px-3 py-2 bg-white/10 border border-blue-400/30 rounded-lg text-white"
                    value={config.ai?.defaultModel || 'gpt-3.5-turbo'}
                    onChange={e => updateConfig('ai', 'defaultModel', e.target.value)}
                  >
                    <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                    <option value="gpt-4">GPT-4</option>
                    <option value="claude-3">Claude-3</option>
                  </select>
                </div>

                <div>
                  <label className="block text-blue-200 text-sm font-medium mb-2">单次请求最大Token数</label>
                  <input
                    type="number"
                    min="100"
                    max="32000"
                    className="w-full px-3 py-2 bg-white/10 border border-blue-400/30 rounded-lg text-white"
                    value={config.ai?.maxTokensPerRequest || 4000}
                    onChange={e => updateConfig('ai', 'maxTokensPerRequest', Number(e.target.value))}
                  />
                </div>

                <div>
                  <label className="block text-blue-200 text-sm font-medium mb-2">每日最大请求次数</label>
                  <input
                    type="number"
                    min="1"
                    className="w-full px-3 py-2 bg-white/10 border border-blue-400/30 rounded-lg text-white"
                    value={config.ai?.maxRequestsPerDay || 100}
                    onChange={e => updateConfig('ai', 'maxRequestsPerDay', Number(e.target.value))}
                  />
                </div>

                <div>
                  <label className="block text-blue-200 text-sm font-medium mb-2">每Token消耗积分</label>
                  <input
                    type="number"
                    step="0.001"
                    min="0.001"
                    className="w-full px-3 py-2 bg-white/10 border border-blue-400/30 rounded-lg text-white"
                    value={config.ai?.creditCostPerToken || 0.01}
                    onChange={e => updateConfig('ai', 'creditCostPerToken', Number(e.target.value))}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-white">安全设置</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="mr-3"
                      checked={config.security?.rateLimitEnabled || false}
                      onChange={e => updateConfig('security', 'rateLimitEnabled', e.target.checked)}
                    />
                    <span className="text-white">启用API限流</span>
                  </label>
                </div>

                <div className="flex items-center">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="mr-3"
                      checked={config.security?.maintenanceMode || false}
                      onChange={e => updateConfig('security', 'maintenanceMode', e.target.checked)}
                    />
                    <span className="text-white">维护模式</span>
                  </label>
                </div>

                <div>
                  <label className="block text-blue-200 text-sm font-medium mb-2">每分钟最大请求数</label>
                  <input
                    type="number"
                    min="10"
                    max="1000"
                    className="w-full px-3 py-2 bg-white/10 border border-blue-400/30 rounded-lg text-white"
                    value={config.security?.maxRequestsPerMinute || 60}
                    onChange={e => updateConfig('security', 'maxRequestsPerMinute', Number(e.target.value))}
                  />
                </div>

                <div>
                  <label className="block text-blue-200 text-sm font-medium mb-2">IP白名单（每行一个）</label>
                  <textarea
                    className="w-full px-3 py-2 bg-white/10 border border-blue-400/30 rounded-lg text-white"
                    rows={4}
                    placeholder="127.0.0.1&#10;192.168.1.1"
                    value={config.security?.ipWhitelist?.join('\n') || ''}
                    onChange={e => updateConfig('security', 'ipWhitelist',
                      e.target.value.split('\n').filter(ip => ip.trim()),
                    )}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SystemManagement
