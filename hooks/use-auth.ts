'use client'
import { useCallback, useEffect, useState } from 'react'
import { api } from '@/lib/api-client'

type User = {
  id: string
  email: string
  username?: string
  nickname?: string
  avatar?: string
  credits: number
  vipMultiplier?: number
  roles: string[]
  lastLoginAt?: string
}

type AuthState = {
  user: User | null
  loading: boolean
  error: string | null
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  })

  const fetchUserInfo = useCallback(async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }))

      const userData = await api.get('/api/auth/me')
      setAuthState({
        user: userData.user,
        loading: false,
        error: null,
      })
    }
    catch (error) {
      setAuthState({
        user: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }, [])

  useEffect(() => {
    fetchUserInfo()

    // 监听存储事件，当登录/注册成功时重新获取用户信息
    const handleStorageChange = () => {
      fetchUserInfo()
    }

    window.addEventListener('storage', handleStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [fetchUserInfo])

  const hasRole = (roleName: string): boolean => {
    return authState.user?.roles.includes(roleName) || false
  }

  const isAdmin = (): boolean => {
    return hasRole('admin') || hasRole('super_admin')
  }

  const logout = async () => {
    try {
      await api.post('/api/auth/logout')
      setAuthState({
        user: null,
        loading: false,
        error: null,
      })
      // 清除本地存储
      localStorage.removeItem('user')
      // 重定向到登录页
      window.location.href = '/auth/login'
    }
    catch (error) {
      console.error('Logout error:', error)
    }
  }

  return {
    ...authState,
    hasRole,
    isAdmin,
    logout,
    refetch: fetchUserInfo,
  }
}
