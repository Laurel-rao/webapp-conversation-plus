'use client'
import React from 'react'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'

const HomePage: React.FC = () => {
  const { t } = useTranslation()

  const features = [
    {
      title: '智能对话',
      description: '与AI助手进行自然对话，获得智能回答和建议',
      icon: (
        <svg className="w-8 h-8" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} viewBox="0 0 24 24" stroke="currentColor">
          <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      href: '/chat',
      color: 'from-blue-500 to-cyan-400',
    },
    {
      title: '文档分析',
      description: '上传文档，让AI帮您分析内容和提取关键信息',
      icon: (
        <svg className="w-8 h-8" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} viewBox="0 0 24 24" stroke="currentColor">
          <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      href: '/chat',
      color: 'from-purple-500 to-pink-400',
    },
    {
      title: '代码助手',
      description: '编程问题解答，代码审查和优化建议',
      icon: (
        <svg className="w-8 h-8" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} viewBox="0 0 24 24" stroke="currentColor">
          <path d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      ),
      href: '/chat',
      color: 'from-green-500 to-teal-400',
    },
    {
      title: '创意写作',
      description: '协助创作文章、诗歌、故事等各类文本内容',
      icon: (
        <svg className="w-8 h-8" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} viewBox="0 0 24 24" stroke="currentColor">
          <path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
      ),
      href: '/chat',
      color: 'from-orange-500 to-red-400',
    },
  ]

  const stats = [
    { label: '总对话数', value: '12,456', icon: '💬' },
    { label: '活跃用户', value: '3,789', icon: '👥' },
    { label: '满意度', value: '98%', icon: '⭐' },
    { label: '响应时间', value: '<1s', icon: '⚡' },
  ]

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-8">
        {/* 欢迎区域 */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
                        欢迎使用
            <span className="text-gradient ml-2">智能助手</span>
          </h1>
          <p className="text-xl text-blue-200 max-w-2xl">
                        体验前沿的AI技术，让人工智能成为您工作和学习的得力助手
          </p>
        </div>

        {/* 统计数据 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, index) => (
            <div key={index} className="glass-card p-6 text-center">
              <div className="text-3xl mb-2">{stat.icon}</div>
              <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-blue-200 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* 功能特性 */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">核心功能</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Link key={index} href={feature.href}>
                <div className="glass-card p-6 hover:scale-105 transition-all duration-300 cursor-pointer group">
                  <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <div className="text-white">
                      {feature.icon}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                  <p className="text-blue-200 text-sm leading-relaxed">{feature.description}</p>
                  <div className="mt-4 flex items-center text-cyan-300 text-sm font-medium">
                                        立即体验
                    <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} viewBox="0 0 24 24" stroke="currentColor">
                      <path d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* 快速开始 */}
        <div className="glass-card p-8 text-center">
          <h3 className="text-2xl font-bold text-white mb-4">准备开始了吗？</h3>
          <p className="text-blue-200 mb-6">点击下面的按钮，立即开始与AI助手对话</p>
          <Link href="/chat">
            <button className="tech-button px-8 py-3 rounded-xl text-white font-medium">
                            开始对话
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default HomePage
