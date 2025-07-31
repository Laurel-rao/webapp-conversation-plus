'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { api, showSuccessToast } from '@/lib/api-client'

const RegisterPage: React.FC = () => {
  const { t } = useTranslation()
  const router = useRouter()

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    nickname: '',
    inviteCode: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [agreements, setAgreements] = useState({
    terms: false,
    privacy: false,
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
    // 清除错误信息
    if (error)
      setError('')
  }

  const handleAgreementChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target
    setAgreements(prev => ({
      ...prev,
      [name]: checked,
    }))
  }

  const validateForm = () => {
    if (!formData.email || !formData.password || !formData.confirmPassword) {
      setError('请填写所有必需字段')
      return false
    }

    if (formData.password !== formData.confirmPassword) {
      setError('两次输入的密码不一致')
      return false
    }

    if (formData.password.length < 6) {
      setError('密码长度至少为6个字符')
      return false
    }

    if (!agreements.terms || !agreements.privacy) {
      setError('请同意服务条款和隐私政策')
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm())
      return

    setLoading(true)
    setError('')

    try {
      const data = await api.post('/api/auth/register', {
        email: formData.email,
        password: formData.password,
        nickname: formData.nickname,
        inviteCode: formData.inviteCode || undefined,
      })

      // 注册成功，保存用户信息
      localStorage.setItem('user', JSON.stringify(data.user))

      // 触发存储事件，通知其他组件用户状态已更新
      window.dispatchEvent(new Event('storage'))

      // 显示成功提示
      showSuccessToast('注册成功，欢迎使用！')

      // 重定向到首页
      router.push('/')
    }
    catch (error) {
      console.error('Register error:', error)
      setError(error instanceof Error ? error.message : '注册失败')
    }
    finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo 和标题 */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-cyan-300 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">AI</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">创建账户</h1>
          <p className="text-blue-200">开始您的智能助手之旅</p>
        </div>

        {/* 注册表单 */}
        <div className="glass-card p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 错误信息 */}
            {error && (
              <div className="bg-red-500/20 border border-red-400/30 rounded-lg p-3">
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}

            {/* 邮箱输入 */}
            <div>
              <label htmlFor="email" className="block text-blue-200 text-sm font-medium mb-2">
                邮箱地址 *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 bg-white/10 border border-blue-400/30 rounded-lg text-white placeholder-blue-300 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all duration-300"
                placeholder="请输入您的邮箱"
              />
            </div>

            {/* 昵称输入 */}
            <div>
              <label htmlFor="nickname" className="block text-blue-200 text-sm font-medium mb-2">
                昵称
              </label>
              <input
                type="text"
                id="nickname"
                name="nickname"
                value={formData.nickname}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white/10 border border-blue-400/30 rounded-lg text-white placeholder-blue-300 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all duration-300"
                placeholder="请输入您的昵称"
              />
            </div>

            {/* 密码输入 */}
            <div>
              <label htmlFor="password" className="block text-blue-200 text-sm font-medium mb-2">
                密码 *
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 bg-white/10 border border-blue-400/30 rounded-lg text-white placeholder-blue-300 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all duration-300"
                placeholder="至少6个字符"
              />
            </div>

            {/* 确认密码 */}
            <div>
              <label htmlFor="confirmPassword" className="block text-blue-200 text-sm font-medium mb-2">
                确认密码 *
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 bg-white/10 border border-blue-400/30 rounded-lg text-white placeholder-blue-300 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all duration-300"
                placeholder="请再次输入密码"
              />
            </div>

            {/* 邀请码 */}
            <div>
              <label htmlFor="inviteCode" className="block text-blue-200 text-sm font-medium mb-2">
                邀请码 (可选)
              </label>
              <input
                type="text"
                id="inviteCode"
                name="inviteCode"
                value={formData.inviteCode}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white/10 border border-blue-400/30 rounded-lg text-white placeholder-blue-300 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all duration-300"
                placeholder="如有邀请码请填写"
              />
              <p className="text-blue-300 text-xs mt-1">填写邀请码可获得额外奖励</p>
            </div>

            {/* 协议同意 */}
            <div className="space-y-3">
              <label className="flex items-start">
                <input
                  type="checkbox"
                  name="terms"
                  checked={agreements.terms}
                  onChange={handleAgreementChange}
                  className="w-4 h-4 text-cyan-400 bg-white/10 border-blue-400/30 rounded focus:ring-cyan-400 focus:ring-2 mt-0.5"
                />
                <span className="ml-3 text-blue-200 text-sm">
                  我已阅读并同意{' '}
                  <Link href="/terms" className="text-cyan-300 hover:text-cyan-200 underline">
                    服务条款
                  </Link>
                </span>
              </label>

              <label className="flex items-start">
                <input
                  type="checkbox"
                  name="privacy"
                  checked={agreements.privacy}
                  onChange={handleAgreementChange}
                  className="w-4 h-4 text-cyan-400 bg-white/10 border-blue-400/30 rounded focus:ring-cyan-400 focus:ring-2 mt-0.5"
                />
                <span className="ml-3 text-blue-200 text-sm">
                  我已阅读并同意{' '}
                  <Link href="/privacy" className="text-cyan-300 hover:text-cyan-200 underline">
                    隐私政策
                  </Link>
                </span>
              </label>
            </div>

            {/* 注册按钮 */}
            <button
              type="submit"
              disabled={loading}
              className="w-full tech-button py-3 rounded-lg text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading
                ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    注册中...
                  </div>
                )
                : (
                  '创建账户'
                )}
            </button>
          </form>

          {/* 分割线 */}
          <div className="mt-6 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-blue-400/20"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-transparent text-blue-200">或</span>
            </div>
          </div>

          {/* 登录链接 */}
          <div className="mt-6 text-center">
            <p className="text-blue-200">
              已有账户？{' '}
              <Link href="/auth/login" className="text-cyan-300 hover:text-cyan-200 font-medium transition-colors">
                立即登录
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage
