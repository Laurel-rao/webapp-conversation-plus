'use client'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

type User = {
  id: string
  email: string
  username?: string
  nickname?: string
  avatar?: string
  phone?: string
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'BANNED'
  credits: number
  totalRecharge: number
  totalConsumption: number
  vipMultiplier?: number
  referralCount: number
  createdAt: string
  lastLoginAt?: string
  roles: string[]
}

type UsersResponse = {
  users: User[]
  total: number
  page: number
  limit: number
}

const UsersManagement: React.FC = () => {
  const { t } = useTranslation()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [limit] = useState(20)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => {
    fetchUsers()
  }, [page, search, statusFilter])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
        ...(statusFilter && { status: statusFilter }),
      })

      const response = await fetch(`/api/users?${params}`, {
        credentials: 'include',
      })

      if (response.ok) {
        const data: UsersResponse = await response.json()
        setUsers(data.users)
        setTotal(data.total)
      }
    }
    catch (error) {
      console.error('Failed to fetch users:', error)
    }
    finally {
      setLoading(false)
    }
  }

  const updateUserStatus = async (userId: string, status: string) => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ status }),
      })

      if (response.ok)
        fetchUsers() // 刷新列表
    }
    catch (error) {
      console.error('Failed to update user status:', error)
    }
  }

  const rechargeCredits = async (userId: string, amount: number) => {
    try {
      const response = await fetch(`/api/users/${userId}/recharge`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ amount }),
      })

      if (response.ok)
        fetchUsers() // 刷新列表
    }
    catch (error) {
      console.error('Failed to recharge credits:', error)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusMap = {
      ACTIVE: 'bg-green-500 text-white',
      INACTIVE: 'bg-gray-500 text-white',
      SUSPENDED: 'bg-yellow-500 text-black',
      BANNED: 'bg-red-500 text-white',
    }
    const statusText = {
      ACTIVE: '活跃',
      INACTIVE: '非活跃',
      SUSPENDED: '暂停',
      BANNED: '封禁',
    }

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusMap[status as keyof typeof statusMap]}`}>
        {statusText[status as keyof typeof statusText]}
      </span>
    )
  }

  const getRoleBadge = (roles: string[]) => {
    if (roles.includes('super_admin'))
      return <span className="px-2 py-1 bg-purple-600 text-white rounded text-xs">超级管理员</span>

    if (roles.includes('admin'))
      return <span className="px-2 py-1 bg-blue-600 text-white rounded text-xs">管理员</span>

    return <span className="px-2 py-1 bg-gray-600 text-white rounded text-xs">普通用户</span>
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

  return (
    <div className="space-y-6">
      {/* 页面标题和操作 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">用户管理</h1>
          <p className="text-blue-200 mt-1">管理系统中的所有用户</p>
        </div>
      </div>

      {/* 搜索和筛选 */}
      <div className="glass-card p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="搜索用户（邮箱、昵称、用户名）"
              className="w-full px-4 py-2 bg-white/10 border border-blue-400/30 rounded-lg text-white placeholder-blue-300 focus:outline-none focus:border-cyan-400"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div>
            <select
              className="px-4 py-2 bg-white/10 border border-blue-400/30 rounded-lg text-white focus:outline-none focus:border-cyan-400"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="">所有状态</option>
              <option value="ACTIVE">活跃</option>
              <option value="INACTIVE">非活跃</option>
              <option value="SUSPENDED">暂停</option>
              <option value="BANNED">封禁</option>
            </select>
          </div>
        </div>
      </div>

      {/* 用户列表 */}
      <div className="glass-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-blue-400/20">
                <th className="text-left py-4 px-6 text-blue-200 font-medium">用户信息</th>
                <th className="text-left py-4 px-6 text-blue-200 font-medium">状态</th>
                <th className="text-left py-4 px-6 text-blue-200 font-medium">角色</th>
                <th className="text-left py-4 px-6 text-blue-200 font-medium">积分</th>
                <th className="text-left py-4 px-6 text-blue-200 font-medium">统计</th>
                <th className="text-left py-4 px-6 text-blue-200 font-medium">注册时间</th>
                <th className="text-left py-4 px-6 text-blue-200 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {users?.map(user => (
                <tr key={user.id} className="border-b border-blue-400/10 hover:bg-white/5">
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-cyan-300 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">
                          {user.nickname?.[0] || user.email[0]}
                        </span>
                      </div>
                      <div>
                        <div className="text-white font-medium">
                          {user.nickname || user.username || '未设置'}
                        </div>
                        <div className="text-blue-300 text-sm">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    {getStatusBadge(user.status)}
                  </td>
                  <td className="py-4 px-6">
                    {getRoleBadge(user.roles)}
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-white font-medium">{user.credits.toLocaleString()}</div>
                    {user.vipMultiplier && (
                      <div className="text-cyan-300 text-sm">VIP {user.vipMultiplier}x</div>
                    )}
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-sm space-y-1">
                      <div className="text-green-300">充值: ¥{user.totalRecharge}</div>
                      <div className="text-orange-300">消费: {user.totalConsumption}</div>
                      <div className="text-purple-300">推荐: {user.referralCount}</div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-blue-200 text-sm">
                      {formatDate(user.createdAt)}
                    </div>
                    {user.lastLoginAt && (
                      <div className="text-gray-400 text-xs">
                        最后登录: {formatDate(user.lastLoginAt)}
                      </div>
                    )}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex space-x-2">
                      <select
                        className="text-xs px-2 py-1 bg-white/10 border border-blue-400/30 rounded text-white"
                        value={user.status}
                        onChange={e => updateUserStatus(user.id, e.target.value)}
                      >
                        <option value="ACTIVE">活跃</option>
                        <option value="INACTIVE">非活跃</option>
                        <option value="SUSPENDED">暂停</option>
                        <option value="BANNED">封禁</option>
                      </select>
                      <button
                        onClick={() => {
                          const amount = prompt('请输入充值金额（积分）:')
                          if (amount && !isNaN(Number(amount)))
                            rechargeCredits(user.id, Number(amount))
                        }}
                        className="text-xs px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded"
                      >
                        充值
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 分页 */}
        <div className="flex items-center justify-between p-6 border-t border-blue-400/20">
          <div className="text-blue-200 text-sm">
            显示第 {(page - 1) * limit + 1} - {Math.min(page * limit, total)} 条，共 {total} 条
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-3 py-1 bg-white/10 text-white rounded disabled:opacity-50"
            >
              上一页
            </button>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page * limit >= total}
              className="px-3 py-1 bg-white/10 text-white rounded disabled:opacity-50"
            >
              下一页
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UsersManagement
