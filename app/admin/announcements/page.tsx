'use client'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

type Announcement = {
  id: string
  title: string
  content: string
  type: 'INFO' | 'WARNING' | 'SUCCESS' | 'ERROR'
  status: 'ACTIVE' | 'INACTIVE'
  priority: number
  startDate?: string
  endDate?: string
  targetUsers?: string
  createdAt: string
  updatedAt: string
}

const AnnouncementsManagement: React.FC = () => {
  const { t } = useTranslation()
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null)

  useEffect(() => {
    fetchAnnouncements()
  }, [])

  const fetchAnnouncements = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/announcements', {
        credentials: 'include',
      })
      if (response.ok) {
        const data = await response.json()
        setAnnouncements(data.announcements || [])
      }
    }
    catch (error) {
      console.error('Failed to fetch announcements:', error)
    }
    finally {
      setLoading(false)
    }
  }

  const saveAnnouncement = async (announcementData: Partial<Announcement>) => {
    try {
      const url = editingAnnouncement
        ? `/api/admin/announcements/${editingAnnouncement.id}`
        : '/api/admin/announcements'

      const response = await fetch(url, {
        method: editingAnnouncement ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(announcementData),
      })

      if (response.ok) {
        setShowForm(false)
        setEditingAnnouncement(null)
        fetchAnnouncements()
      }
    }
    catch (error) {
      console.error('Failed to save announcement:', error)
    }
  }

  const deleteAnnouncement = async (announcementId: string) => {
    if (!confirm('确定要删除这个公告吗？'))
      return

    try {
      const response = await fetch(`/api/admin/announcements/${announcementId}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (response.ok)
        fetchAnnouncements()
    }
    catch (error) {
      console.error('Failed to delete announcement:', error)
    }
  }

  const getTypeBadge = (type: string) => {
    const typeMap = {
      INFO: 'bg-blue-500 text-white',
      WARNING: 'bg-yellow-500 text-black',
      SUCCESS: 'bg-green-500 text-white',
      ERROR: 'bg-red-500 text-white',
    }
    const typeText = {
      INFO: '信息',
      WARNING: '警告',
      SUCCESS: '成功',
      ERROR: '错误',
    }

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${typeMap[type as keyof typeof typeMap]}`}>
        {typeText[type as keyof typeof typeText]}
      </span>
    )
  }

  const getStatusBadge = (status: string) => {
    const statusMap = {
      ACTIVE: 'bg-green-500 text-white',
      INACTIVE: 'bg-gray-500 text-white',
    }
    const statusText = {
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

  const AnnouncementForm = () => {
    const [formData, setFormData] = useState({
      title: editingAnnouncement?.title || '',
      content: editingAnnouncement?.content || '',
      type: editingAnnouncement?.type || 'INFO',
      status: editingAnnouncement?.status || 'ACTIVE',
      priority: editingAnnouncement?.priority || 0,
      startDate: editingAnnouncement?.startDate ? new Date(editingAnnouncement.startDate).toISOString().slice(0, 16) : '',
      endDate: editingAnnouncement?.endDate ? new Date(editingAnnouncement.endDate).toISOString().slice(0, 16) : '',
      targetUsers: editingAnnouncement?.targetUsers || '',
    })

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault()
      const submitData = {
        ...formData,
        startDate: formData.startDate ? new Date(formData.startDate).toISOString() : undefined,
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : undefined,
      }
      saveAnnouncement(submitData)
    }

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="glass-card p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <h3 className="text-xl font-bold text-white mb-4">
            {editingAnnouncement ? '编辑公告' : '新建公告'}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-blue-200 text-sm font-medium mb-2">公告标题</label>
              <input
                type="text"
                className="w-full px-3 py-2 bg-white/10 border border-blue-400/30 rounded-lg text-white"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-blue-200 text-sm font-medium mb-2">公告内容</label>
              <textarea
                className="w-full px-3 py-2 bg-white/10 border border-blue-400/30 rounded-lg text-white"
                rows={6}
                value={formData.content}
                onChange={e => setFormData({ ...formData, content: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-blue-200 text-sm font-medium mb-2">公告类型</label>
                <select
                  className="w-full px-3 py-2 bg-white/10 border border-blue-400/30 rounded-lg text-white"
                  value={formData.type}
                  onChange={e => setFormData({ ...formData, type: e.target.value as Announcement['type'] })}
                >
                  <option value="INFO">信息</option>
                  <option value="WARNING">警告</option>
                  <option value="SUCCESS">成功</option>
                  <option value="ERROR">错误</option>
                </select>
              </div>

              <div>
                <label className="block text-blue-200 text-sm font-medium mb-2">状态</label>
                <select
                  className="w-full px-3 py-2 bg-white/10 border border-blue-400/30 rounded-lg text-white"
                  value={formData.status}
                  onChange={e => setFormData({ ...formData, status: e.target.value as Announcement['status'] })}
                >
                  <option value="ACTIVE">启用</option>
                  <option value="INACTIVE">禁用</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-blue-200 text-sm font-medium mb-2">优先级</label>
              <input
                type="number"
                className="w-full px-3 py-2 bg-white/10 border border-blue-400/30 rounded-lg text-white"
                value={formData.priority}
                onChange={e => setFormData({ ...formData, priority: Number(e.target.value) })}
              />
              <p className="text-blue-300 text-xs mt-1">数字越大优先级越高</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-blue-200 text-sm font-medium mb-2">开始时间（可选）</label>
                <input
                  type="datetime-local"
                  className="w-full px-3 py-2 bg-white/10 border border-blue-400/30 rounded-lg text-white"
                  value={formData.startDate}
                  onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-blue-200 text-sm font-medium mb-2">结束时间（可选）</label>
                <input
                  type="datetime-local"
                  className="w-full px-3 py-2 bg-white/10 border border-blue-400/30 rounded-lg text-white"
                  value={formData.endDate}
                  onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-blue-200 text-sm font-medium mb-2">目标用户（可选）</label>
              <input
                type="text"
                className="w-full px-3 py-2 bg-white/10 border border-blue-400/30 rounded-lg text-white"
                placeholder="留空表示所有用户，或输入特定用户条件"
                value={formData.targetUsers}
                onChange={e => setFormData({ ...formData, targetUsers: e.target.value })}
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setEditingAnnouncement(null)
                }}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg"
              >
                取消
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
              >
                {editingAnnouncement ? '更新' : '创建'}
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
          <h1 className="text-3xl font-bold text-white">公告管理</h1>
          <p className="text-blue-200 mt-1">管理系统公告和通知</p>
        </div>

        <button
          onClick={() => setShowForm(true)}
          className="tech-button px-4 py-2 rounded-lg text-white font-medium"
        >
          新建公告
        </button>
      </div>

      {/* 公告列表 */}
      <div className="glass-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-blue-400/20">
                <th className="text-left py-4 px-6 text-blue-200 font-medium">标题</th>
                <th className="text-left py-4 px-6 text-blue-200 font-medium">类型</th>
                <th className="text-left py-4 px-6 text-blue-200 font-medium">状态</th>
                <th className="text-left py-4 px-6 text-blue-200 font-medium">优先级</th>
                <th className="text-left py-4 px-6 text-blue-200 font-medium">时间范围</th>
                <th className="text-left py-4 px-6 text-blue-200 font-medium">创建时间</th>
                <th className="text-left py-4 px-6 text-blue-200 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {announcements?.map(announcement => (
                <tr key={announcement.id} className="border-b border-blue-400/10 hover:bg-white/5">
                  <td className="py-4 px-6">
                    <div className="text-white font-medium">{announcement.title}</div>
                    <div className="text-blue-300 text-sm truncate max-w-xs">
                      {announcement.content}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    {getTypeBadge(announcement.type)}
                  </td>
                  <td className="py-4 px-6">
                    {getStatusBadge(announcement.status)}
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-white">{announcement.priority}</span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-blue-200 text-sm">
                      {announcement.startDate
                        ? (
                          <div>开始: {formatDate(announcement.startDate)}</div>
                        )
                        : (
                          <div className="text-gray-400">无开始时间</div>
                        )}
                      {announcement.endDate
                        ? (
                          <div>结束: {formatDate(announcement.endDate)}</div>
                        )
                        : (
                          <div className="text-gray-400">无结束时间</div>
                        )}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-blue-200 text-sm">
                      {formatDate(announcement.createdAt)}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setEditingAnnouncement(announcement)
                          setShowForm(true)
                        }}
                        className="text-xs px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded"
                      >
                        编辑
                      </button>
                      <button
                        onClick={() => deleteAnnouncement(announcement.id)}
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

        {announcements.length === 0 && (
          <div className="text-center py-12">
            <div className="text-blue-200">暂无公告</div>
          </div>
        )}
      </div>

      {showForm && <AnnouncementForm />}
    </div>
  )
}

export default AnnouncementsManagement
