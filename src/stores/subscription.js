import { defineStore } from 'pinia'
import { ref } from 'vue'
import { subscriptionService } from '../services/index'

export const useSubscriptionStore = defineStore('subscription', () => {
  const subscriptions = ref([])
  const currentSubscription = ref(null)
  const isLoading = ref(false)
  const error = ref(null)
  const pagination = ref({
    total: 0,
    perPage: 15,
    currentPage: 1,
    lastPage: 1,
  })

  const getAll = async (page = 1, perPage = 15) => {
    isLoading.value = true
    error.value = null
    try {
      const response = await subscriptionService.getAll(page, perPage)
      subscriptions.value = response.data.data
      pagination.value = response.data.pagination
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch subscriptions'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const create = async (data) => {
    isLoading.value = true
    error.value = null
    try {
      const response = await subscriptionService.create(data)
      subscriptions.value.unshift(response.data.data)
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to create subscription'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const get = async (id) => {
    try {
      const response = await subscriptionService.get(id)
      currentSubscription.value = response.data.data
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch subscription'
      throw err
    }
  }

  const update = async (id, data) => {
    isLoading.value = true
    error.value = null
    try {
      const response = await subscriptionService.update(id, data)
      const index = subscriptions.value.findIndex((s) => s.id === id)
      if (index !== -1) {
        subscriptions.value[index] = response.data.data
      }
      currentSubscription.value = response.data.data
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to update subscription'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const remove = async (id) => {
    isLoading.value = true
    error.value = null
    try {
      await subscriptionService.delete(id)
      subscriptions.value = subscriptions.value.filter((s) => s.id !== id)
      return true
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to delete subscription'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  return {
    subscriptions,
    currentSubscription,
    isLoading,
    error,
    pagination,
    getAll,
    create,
    get,
    update,
    remove,
  }
})
