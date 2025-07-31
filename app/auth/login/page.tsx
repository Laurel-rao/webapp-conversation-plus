'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { api, showSuccessToast } from '@/lib/api-client'

const LoginPage: React.FC = () => {
  const { t } = useTranslation()
  const router = useRouter()

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const data = await api.post('/api/auth/login', formData)

      // 登录成功，保存用户信息到 localStorage
      localStorage.setItem('user', JSON.stringify(data.user))

      // 触发存储事件，通知其他组件用户状态已更新
      window.dispatchEvent(new Event('storage'))

      // 显示成功提示
      showSuccessToast('登录成功')

      // 获取重定向 URL
      const urlParams = new URLSearchParams(window.location.search)
      const redirect = urlParams.get('redirect') || '/'

      // 重定向到目标页面
      router.push(redirect)
    }
    catch (error) {
      console.error('Login error:', error)
      setError(error instanceof Error ? error.message : '登录失败')
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
          <h1 className="text-3xl font-bold text-white mb-2">欢迎回来</h1>
          <p className="text-blue-200">登录到您的智能助手账户</p>
        </div>

        {/* 登录表单 */}
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
                邮箱地址
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

            {/* 密码输入 */}
            <div>
              <label htmlFor="password" className="block text-blue-200 text-sm font-medium mb-2">
                密码
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 bg-white/10 border border-blue-400/30 rounded-lg text-white placeholder-blue-300 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all duration-300"
                placeholder="请输入您的密码"
              />
            </div>

            {/* 记住我和忘记密码 */}
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-cyan-400 bg-white/10 border-blue-400/30 rounded focus:ring-cyan-400 focus:ring-2"
                />
                <span className="ml-2 text-blue-200 text-sm">记住我</span>
              </label>
              <Link href="/auth/forgot-password" className="text-cyan-300 text-sm hover:text-cyan-200 transition-colors">
                忘记密码？
              </Link>
            </div>

            {/* 登录按钮 */}
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
                    登录中...
                  </div>
                )
                : (
                  '登录'
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

          {/* 注册链接 */}
          <div className="mt-6 text-center">
            <p className="text-blue-200">
              还没有账户？{' '}
              <Link href="/auth/register" className="text-cyan-300 hover:text-cyan-200 font-medium transition-colors">
                立即注册
              </Link>
            </p>
          </div>
        </div>

        {/* 底部信息 */}
        <div className="mt-8 text-center">
          <p className="text-blue-300 text-xs">
            登录即表示您同意我们的{' '}
            <Link href="/terms" className="text-cyan-300 hover:text-cyan-200">服务条款</Link>
            {' '}和{' '}
            <Link href="/privacy" className="text-cyan-300 hover:text-cyan-200">隐私政策</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
