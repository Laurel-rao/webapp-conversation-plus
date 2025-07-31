'use client'
import React, { useCallback, useEffect, useState } from 'react'
// import { useTranslation } from 'react-i18next'

type SystemLog = {
  id: string
  user?: {
    id: string
    email: string
    nickname?: string
  }
  action: string
  resource?: string
  method?: string
  path?: string
  ip?: string
  userAgent?: string
  status: 'SUCCESS' | 'ERROR' | 'WARNING'
  errorMessage?: string
  duration?: number
  createdAt: string
}

type LogsResponse = {
  logs: SystemLog[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

const LogsManagement: React.FC = () => {
  // const { t } = useTranslation()
  const [logs, setLogs] = useState<SystemLog[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [limit] = useState(50)
  const [filters, setFilters] = useState({
    action: '',
    status: '',
    dateFrom: '',
    dateTo: '',
    userId: '',
  })

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true)
      const filterParams = Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== ''),
      )

      // 转换参数名以匹配API期望
      if (filterParams.dateFrom) {
        filterParams.startDate = filterParams.dateFrom
        delete filterParams.dateFrom
      }
      if (filterParams.dateTo) {
        filterParams.endDate = filterParams.dateTo
        delete filterParams.dateTo
      }

      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...filterParams,
      })

      const response = await fetch(`/api/admin/system/logs?${params}`, {
        credentials: 'include',
      })

      if (response.ok) {
        const data: LogsResponse = await response.json()
        setLogs(data.logs)
        setTotal(data.pagination.total)
      }
    }
    catch (error) {
      console.error('Failed to fetch logs:', error)
    }
    finally {
      setLoading(false)
    }
  }, [page, limit, filters])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  const exportLogs = async () => {
    try {
      const filterParams = Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== ''),
      )

      // 转换参数名以匹配API期望
      if (filterParams.dateFrom) {
        filterParams.startDate = filterParams.dateFrom
        delete filterParams.dateFrom
      }
      if (filterParams.dateTo) {
        filterParams.endDate = filterParams.dateTo
        delete filterParams.dateTo
      }

      const params = new URLSearchParams({
        ...filterParams,
        export: 'true',
      })

      const response = await fetch(`/api/admin/system/logs?${params}`, {
        credentials: 'include',
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `system_logs_${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    }
    catch (error) {
      console.error('Failed to export logs:', error)
      console.log('导出失败，请重试')
    }
  }

  const clearLogs = async () => {
    // eslint-disable-next-line no-alert
    if (!confirm('确定要清空所有日志吗？此操作不可恢复！'))
      return

    try {
      const response = await fetch('/api/admin/system/logs', {
        method: 'DELETE',
        credentials: 'include',
      })

      if (response.ok) {
        fetchLogs()
        console.log('日志清空成功')
      }
      else {
        console.log('清空失败，请重试')
      }
    }
    catch (error) {
      console.error('Failed to clear logs:', error)
      console.log('清空失败，请重试')
    }
  }

  const getStatusBadge = (status: string) => {
    const statusMap = {
      SUCCESS: 'bg-green-500 text-white',
      ERROR: 'bg-red-500 text-white',
      WARNING: 'bg-yellow-500 text-black',
    }
    const statusText = {
      SUCCESS: '成功',
      ERROR: '错误',
      WARNING: '警告',
    }

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusMap[status as keyof typeof statusMap]}`}>
        {statusText[status as keyof typeof statusText]}
      </span>
    )
  }

  const getActionText = (action: string) => {
    const actionMap: Record<string, string> = {
      LOGIN_SUCCESS: '登录成功',
      LOGIN_FAILED: '登录失败',
      LOGIN_ERROR: '登录错误',
      USER_REGISTER: '用户注册',
      RECHARGE_SUCCESS: '充值成功',
      CREATE_USER: '创建用户',
      UPDATE_USER: '更新用户',
      DELETE_USER: '删除用户',
      CREATE_PACKAGE: '创建套餐',
      UPDATE_PACKAGE: '更新套餐',
      DELETE_PACKAGE: '删除套餐',
      CREATE_ANNOUNCEMENT: '创建公告',
      UPDATE_ANNOUNCEMENT: '更新公告',
      DELETE_ANNOUNCEMENT: '删除公告',
      UPDATE_CONFIG: '更新配置',
    }
    return actionMap[action] || action
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN')
  }

  const formatDuration = (duration?: number) => {
    if (!duration)
      return '-'
    if (duration < 1000)
      return `${duration}ms`
    return `${(duration / 1000).toFixed(2)}s`
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
          <h1 className="text-3xl font-bold text-white">系统日志</h1>
          <p className="text-blue-200 mt-1">查看和管理系统操作日志</p>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={exportLogs}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium"
          >
            导出日志
          </button>
          <button
            onClick={clearLogs}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium"
          >
            清空日志
          </button>
        </div>
      </div>

      {/* 筛选器 */}
      <div className="glass-card p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-blue-200 text-sm font-medium mb-2">操作类型</label>
            <select
              className="w-full px-3 py-2 bg-white/10 border border-blue-400/30 rounded-lg text-white"
              value={filters.action}
              onChange={e => setFilters({ ...filters, action: e.target.value })}
            >
              <option value="">所有操作</option>
              <option value="LOGIN_SUCCESS">登录成功</option>
              <option value="LOGIN_FAILED">登录失败</option>
              <option value="USER_REGISTER">用户注册</option>
              <option value="RECHARGE_SUCCESS">充值成功</option>
              <option value="CREATE_USER">创建用户</option>
              <option value="UPDATE_USER">更新用户</option>
              <option value="DELETE_USER">删除用户</option>
            </select>
          </div>

          <div>
            <label className="block text-blue-200 text-sm font-medium mb-2">状态</label>
            <select
              className="w-full px-3 py-2 bg-white/10 border border-blue-400/30 rounded-lg text-white"
              value={filters.status}
              onChange={e => setFilters({ ...filters, status: e.target.value })}
            >
              <option value="">所有状态</option>
              <option value="SUCCESS">成功</option>
              <option value="ERROR">错误</option>
              <option value="WARNING">警告</option>
            </select>
          </div>

          <div>
            <label className="block text-blue-200 text-sm font-medium mb-2">开始日期</label>
            <input
              type="date"
              className="w-full px-3 py-2 bg-white/10 border border-blue-400/30 rounded-lg text-white"
              value={filters.dateFrom}
              onChange={e => setFilters({ ...filters, dateFrom: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-blue-200 text-sm font-medium mb-2">结束日期</label>
            <input
              type="date"
              className="w-full px-3 py-2 bg-white/10 border border-blue-400/30 rounded-lg text-white"
              value={filters.dateTo}
              onChange={e => setFilters({ ...filters, dateTo: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-blue-200 text-sm font-medium mb-2">用户ID</label>
            <input
              type="text"
              placeholder="输入用户ID"
              className="w-full px-3 py-2 bg-white/10 border border-blue-400/30 rounded-lg text-white placeholder-blue-300"
              value={filters.userId}
              onChange={e => setFilters({ ...filters, userId: e.target.value })}
            />
          </div>
        </div>

        <div className="flex justify-end mt-4">
          <button
            onClick={() => {
              setFilters({
                action: '',
                status: '',
                dateFrom: '',
                dateTo: '',
                userId: '',
              })
              setPage(1)
            }}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg"
          >
            重置筛选
          </button>
        </div>
      </div>

      {/* 日志列表 */}
      <div className="glass-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-blue-400/20">
                <th className="text-left py-4 px-6 text-blue-200 font-medium">时间</th>
                <th className="text-left py-4 px-6 text-blue-200 font-medium">用户</th>
                <th className="text-left py-4 px-6 text-blue-200 font-medium">操作</th>
                <th className="text-left py-4 px-6 text-blue-200 font-medium">资源</th>
                <th className="text-left py-4 px-6 text-blue-200 font-medium">状态</th>
                <th className="text-left py-4 px-6 text-blue-200 font-medium">耗时</th>
                <th className="text-left py-4 px-6 text-blue-200 font-medium">IP地址</th>
                <th className="text-left py-4 px-6 text-blue-200 font-medium">详情</th>
              </tr>
            </thead>
            <tbody>
              {logs?.map(log => (
                <tr key={log.id} className="border-b border-blue-400/10 hover:bg-white/5">
                  <td className="py-4 px-6">
                    <div className="text-white text-sm">
                      {formatDate(log.createdAt)}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    {log.user
                      ? (
                        <div>
                          <div className="text-white font-medium">
                            {log.user.nickname || log.user.email}
                          </div>
                          <div className="text-blue-300 text-xs">{log.user.id}</div>
                        </div>
                      )
                      : (
                        <span className="text-gray-400">系统</span>
                      )}
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-white">{getActionText(log.action)}</div>
                    {log.method && log.path && (
                      <div className="text-blue-300 text-xs">{log.method} {log.path}</div>
                    )}
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-blue-200">{log.resource || '-'}</span>
                  </td>
                  <td className="py-4 px-6">
                    {getStatusBadge(log.status)}
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-white">{formatDuration(log.duration)}</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-blue-200 text-sm">{log.ip || '-'}</span>
                  </td>
                  <td className="py-4 px-6">
                    {log.errorMessage
                      ? (
                        <div className="text-red-300 text-sm max-w-xs truncate" title={log.errorMessage}>
                          {log.errorMessage}
                        </div>
                      )
                      : (
                        <span className="text-gray-400">-</span>
                      )}
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
            <span className="px-3 py-1 text-white">
              第 {page} 页，共 {Math.ceil(total / limit)} 页
            </span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page * limit >= total}
              className="px-3 py-1 bg-white/10 text-white rounded disabled:opacity-50"
            >
              下一页
            </button>
          </div>
        </div>

        {logs.length === 0 && (
          <div className="text-center py-12">
            <div className="text-blue-200">暂无日志记录</div>
          </div>
        )}
      </div>
    </div>
  )
}

export default LogsManagement
