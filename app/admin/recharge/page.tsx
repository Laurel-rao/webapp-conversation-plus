'use client'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

type RechargePackage = {
  id: string
  name: string
  amount: number
  credits: number
  discount?: number
  validDays?: number
  status: 'ACTIVE' | 'INACTIVE'
  isPopular: boolean
  description?: string
  createdAt: string
  updatedAt: string
}

type RechargeRecord = {
  id: string
  user: {
    id: string
    email: string
    nickname?: string
  }
  package?: {
    name: string
    amount: number
    credits: number
  }
  amount: number
  credits: number
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED'
  paymentMethod?: string
  transactionId?: string
  createdAt: string
  completedAt?: string
}

const RechargeManagement: React.FC = () => {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<'packages' | 'records'>('packages')
  const [packages, setPackages] = useState<RechargePackage[]>([])
  const [records, setRecords] = useState<RechargeRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [showPackageForm, setShowPackageForm] = useState(false)
  const [editingPackage, setEditingPackage] = useState<RechargePackage | null>(null)

  useEffect(() => {
    if (activeTab === 'packages')
      fetchPackages()
    else
      fetchRecords()
  }, [activeTab])

  const fetchPackages = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/recharge/packages', {
        credentials: 'include',
      })
      if (response.ok) {
        const data = await response.json()
        setPackages(data.packages || [])
      }
    }
    catch (error) {
      console.error('Failed to fetch packages:', error)
    }
    finally {
      setLoading(false)
    }
  }

  const fetchRecords = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/recharge/records', {
        credentials: 'include',
      })
      if (response.ok) {
        const data = await response.json()
        setRecords(data.records || [])
      }
    }
    catch (error) {
      console.error('Failed to fetch records:', error)
    }
    finally {
      setLoading(false)
    }
  }

  const savePackage = async (packageData: Partial<RechargePackage>) => {
    try {
      const url = editingPackage
        ? `/api/recharge/packages/${editingPackage.id}`
        : '/api/recharge/packages'

      const response = await fetch(url, {
        method: editingPackage ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(packageData),
      })

      if (response.ok) {
        setShowPackageForm(false)
        setEditingPackage(null)
        fetchPackages()
      }
    }
    catch (error) {
      console.error('Failed to save package:', error)
    }
  }

  const deletePackage = async (packageId: string) => {
    if (!confirm('确定要删除这个充值套餐吗？'))
      return

    try {
      const response = await fetch(`/api/recharge/packages/${packageId}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (response.ok)
        fetchPackages()
    }
    catch (error) {
      console.error('Failed to delete package:', error)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusMap = {
      PENDING: 'bg-yellow-500 text-black',
      COMPLETED: 'bg-green-500 text-white',
      FAILED: 'bg-red-500 text-white',
      REFUNDED: 'bg-gray-500 text-white',
      ACTIVE: 'bg-green-500 text-white',
      INACTIVE: 'bg-gray-500 text-white',
    }
    const statusText = {
      PENDING: '待处理',
      COMPLETED: '已完成',
      FAILED: '失败',
      REFUNDED: '已退款',
      ACTIVE: '启用',
      INACTIVE: '禁用',
    }

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusMap[status as keyof typeof statusMap]}`}>
        {statusText[status as keyof typeof statusText]}
      </span>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN')
  }

  const PackageForm = () => {
    const [formData, setFormData] = useState({
      name: editingPackage?.name || '',
      amount: editingPackage?.amount || 0,
      credits: editingPackage?.credits || 0,
      discount: editingPackage?.discount || 0,
      validDays: editingPackage?.validDays || 0,
      isPopular: editingPackage?.isPopular || false,
      description: editingPackage?.description || '',
      status: editingPackage?.status || 'ACTIVE',
    })

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault()
      savePackage(formData)
    }

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="glass-card p-6 w-full max-w-md">
          <h3 className="text-xl font-bold text-white mb-4">
            {editingPackage ? '编辑套餐' : '新建套餐'}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-blue-200 text-sm font-medium mb-2">套餐名称</label>
              <input
                type="text"
                className="w-full px-3 py-2 bg-white/10 border border-blue-400/30 rounded-lg text-white"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-blue-200 text-sm font-medium mb-2">金额（元）</label>
                <input
                  type="number"
                  step="0.01"
                  className="w-full px-3 py-2 bg-white/10 border border-blue-400/30 rounded-lg text-white"
                  value={formData.amount}
                  onChange={e => setFormData({ ...formData, amount: Number(e.target.value) })}
                  required
                />
              </div>

              <div>
                <label className="block text-blue-200 text-sm font-medium mb-2">获得积分</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 bg-white/10 border border-blue-400/30 rounded-lg text-white"
                  value={formData.credits}
                  onChange={e => setFormData({ ...formData, credits: Number(e.target.value) })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-blue-200 text-sm font-medium mb-2">折扣</label>
                <input
                  type="number"
                  step="0.01"
                  className="w-full px-3 py-2 bg-white/10 border border-blue-400/30 rounded-lg text-white"
                  value={formData.discount}
                  onChange={e => setFormData({ ...formData, discount: Number(e.target.value) })}
                />
              </div>

              <div>
                <label className="block text-blue-200 text-sm font-medium mb-2">有效天数</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 bg-white/10 border border-blue-400/30 rounded-lg text-white"
                  value={formData.validDays}
                  onChange={e => setFormData({ ...formData, validDays: Number(e.target.value) })}
                />
              </div>
            </div>

            <div>
              <label className="block text-blue-200 text-sm font-medium mb-2">描述</label>
              <textarea
                className="w-full px-3 py-2 bg-white/10 border border-blue-400/30 rounded-lg text-white"
                rows={3}
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={formData.isPopular}
                  onChange={e => setFormData({ ...formData, isPopular: e.target.checked })}
                />
                <span className="text-blue-200 text-sm">热门套餐</span>
              </label>

              <div>
                <select
                  className="px-3 py-2 bg-white/10 border border-blue-400/30 rounded-lg text-white"
                  value={formData.status}
                  onChange={e => setFormData({ ...formData, status: e.target.value as 'ACTIVE' | 'INACTIVE' })}
                >
                  <option value="ACTIVE">启用</option>
                  <option value="INACTIVE">禁用</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowPackageForm(false)
                  setEditingPackage(null)
                }}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg"
              >
                取消
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
              >
                {editingPackage ? '更新' : '创建'}
              </button>
            </div>
          </form>
        </div>
      </div>
    )
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
          <h1 className="text-3xl font-bold text-white">充值管理</h1>
          <p className="text-blue-200 mt-1">管理充值套餐和充值记录</p>
        </div>

        {activeTab === 'packages' && (
          <button
            onClick={() => setShowPackageForm(true)}
            className="tech-button px-4 py-2 rounded-lg text-white font-medium"
          >
            新建套餐
          </button>
        )}
      </div>

      {/* 选项卡 */}
      <div className="glass-card">
        <div className="flex border-b border-blue-400/20">
          <button
            onClick={() => setActiveTab('packages')}
            className={`px-6 py-3 font-medium transition-colors ${activeTab === 'packages'
              ? 'text-cyan-300 border-b-2 border-cyan-300'
              : 'text-blue-200 hover:text-white'
              }`}
          >
            充值套餐
          </button>
          <button
            onClick={() => setActiveTab('records')}
            className={`px-6 py-3 font-medium transition-colors ${activeTab === 'records'
              ? 'text-cyan-300 border-b-2 border-cyan-300'
              : 'text-blue-200 hover:text-white'
              }`}
          >
            充值记录
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'packages' ? (
            /* 充值套餐列表 */
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-blue-400/20">
                    <th className="text-left py-3 text-blue-200 font-medium">套餐名称</th>
                    <th className="text-left py-3 text-blue-200 font-medium">金额</th>
                    <th className="text-left py-3 text-blue-200 font-medium">积分</th>
                    <th className="text-left py-3 text-blue-200 font-medium">状态</th>
                    <th className="text-left py-3 text-blue-200 font-medium">创建时间</th>
                    <th className="text-left py-3 text-blue-200 font-medium">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {packages?.map(pkg => (
                    <tr key={pkg.id} className="border-b border-blue-400/10 hover:bg-white/5">
                      <td className="py-3">
                        <div className="flex items-center space-x-2">
                          <span className="text-white font-medium">{pkg.name}</span>
                          {pkg.isPopular && (
                            <span className="px-2 py-1 bg-gradient-to-r from-orange-500 to-red-400 text-white text-xs rounded-full">
                              热门
                            </span>
                          )}
                        </div>
                        {pkg.description && (
                          <div className="text-blue-300 text-sm mt-1">{pkg.description}</div>
                        )}
                      </td>
                      <td className="py-3 text-white">¥{pkg.amount}</td>
                      <td className="py-3 text-cyan-300">{pkg.credits.toLocaleString()}</td>
                      <td className="py-3">{getStatusBadge(pkg.status)}</td>
                      <td className="py-3 text-blue-200 text-sm">{formatDate(pkg.createdAt)}</td>
                      <td className="py-3">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setEditingPackage(pkg)
                              setShowPackageForm(true)
                            }}
                            className="text-xs px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded"
                          >
                            编辑
                          </button>
                          <button
                            onClick={() => deletePackage(pkg.id)}
                            className="text-xs px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded"
                          >
                            删除
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            /* 充值记录列表 */
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-blue-400/20">
                    <th className="text-left py-3 text-blue-200 font-medium">用户</th>
                    <th className="text-left py-3 text-blue-200 font-medium">套餐</th>
                    <th className="text-left py-3 text-blue-200 font-medium">金额</th>
                    <th className="text-left py-3 text-blue-200 font-medium">积分</th>
                    <th className="text-left py-3 text-blue-200 font-medium">状态</th>
                    <th className="text-left py-3 text-blue-200 font-medium">创建时间</th>
                  </tr>
                </thead>
                <tbody>
                  {records?.map(record => (
                    <tr key={record.id} className="border-b border-blue-400/10 hover:bg-white/5">
                      <td className="py-3">
                        <div className="text-white font-medium">
                          {record.user.nickname || record.user.email}
                        </div>
                        <div className="text-blue-300 text-sm">{record.user.email}</div>
                      </td>
                      <td className="py-3">
                        {record.package
                          ? (
                            <span className="text-white">{record.package.name}</span>
                          )
                          : (
                            <span className="text-gray-400">自定义充值</span>
                          )}
                      </td>
                      <td className="py-3 text-white">¥{record.amount}</td>
                      <td className="py-3 text-cyan-300">{record.credits.toLocaleString()}</td>
                      <td className="py-3">{getStatusBadge(record.status)}</td>
                      <td className="py-3 text-blue-200 text-sm">{formatDate(record.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showPackageForm && <PackageForm />}
    </div>
  )
}

export default RechargeManagement
