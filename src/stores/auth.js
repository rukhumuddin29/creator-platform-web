import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authService } from '../services/index'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(null)
  const isLoading = ref(false)
  const error = ref(null)

  // Load from localStorage
  const loadFromStorage = () => {
    const storedUser = localStorage.getItem('user')
    const storedToken = localStorage.getItem('auth_token')
    if (storedUser) user.value = JSON.parse(storedUser)
    if (storedToken) token.value = storedToken
  }

  const isAuthenticated = computed(() => !!token.value)
  const normalizeRole = (value) => {
    if (!value) return []
    if (Array.isArray(value)) return value.flatMap(normalizeRole)
    if (typeof value === 'object') return [value.name || value.slug || value.title].filter(Boolean)
    if (typeof value === 'string') return [value]
    return []
  }

  const hasRole = (role) => {
    const target = role.toLowerCase()
    const collected = [
      ...normalizeRole(user.value?.roles),
      ...normalizeRole(user.value?.role),
      ...normalizeRole(user.value?.role_name),
      ...normalizeRole(user.value?.type),
    ].map((r) => r?.toLowerCase())

    if (target === 'admin' && user.value?.is_admin) return true
    if (target === 'creator' && user.value?.is_creator) return true
    if (target === 'subscriber' && user.value?.is_subscriber) return true

    return collected.includes(target)
  }

  const isCreator = computed(() => hasRole('creator'))
  const isAdmin = computed(() => hasRole('admin'))
  const isSubscriber = computed(() => hasRole('subscriber'))

  const dashboardPath = computed(() => {
    if (isAdmin.value) return '/admin/dashboard'

    if (isCreator.value) {
      const raw = user.value?.username || user.value?.name || 'me'
      const slug = (raw || 'me').toString().trim().toLowerCase().replace(/\s+/g, '-')
      return `/creator/${encodeURIComponent(slug)}`
    }

    if (isSubscriber.value) return '/subscriber/overview'

    return '/dashboard'
  })

  const getDashboardPath = () => dashboardPath.value
  const loginPath = computed(() => (isAdmin.value ? '/secret-admin-login' : '/login'))
  const getLoginPath = () => loginPath.value

  const register = async (data) => {
    isLoading.value = true
    error.value = null
    try {
      const response = await authService.register(data)
      user.value = response.data.data.user
      token.value = response.data.data.token
      localStorage.setItem('auth_token', token.value)
      // refresh profile to hydrate roles/details
      await getProfile()
      localStorage.setItem('user', JSON.stringify(user.value))
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Registration failed'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const login = async (email, password) => {
    isLoading.value = true
    error.value = null
    try {
      const response = await authService.login(email, password)
      user.value = response.data.data.user
      token.value = response.data.data.token
      localStorage.setItem('auth_token', token.value)
      // refresh profile to hydrate roles/details
      await getProfile()
      localStorage.setItem('user', JSON.stringify(user.value))
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Login failed'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const logout = async () => {
    try {
      await authService.logout()
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      user.value = null
      token.value = null
      localStorage.removeItem('user')
      localStorage.removeItem('auth_token')
    }
  }

  const getProfile = async () => {
    try {
      const response = await authService.getProfile()
      user.value = response.data.data
      localStorage.setItem('user', JSON.stringify(user.value))
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to get profile'
      throw err
    }
  }

  const updateProfile = async (data) => {
    isLoading.value = true
    error.value = null
    try {
      const response = await authService.updateProfile(data)
      user.value = response.data.data
      localStorage.setItem('user', JSON.stringify(user.value))
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to update profile'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Initialize from storage on load
  loadFromStorage()

  return {
    user,
    token,
    isLoading,
    error,
    isAuthenticated,
    isCreator,
    isAdmin,
    isSubscriber,
    dashboardPath,
    getDashboardPath,
    loginPath,
    getLoginPath,
    register,
    login,
    logout,
    getProfile,
    updateProfile,
  }
})
