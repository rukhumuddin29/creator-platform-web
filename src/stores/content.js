import { defineStore } from 'pinia'
import { ref } from 'vue'
import { contentService } from '../services/index'

export const useContentStore = defineStore('content', () => {
  const contents = ref([])
  const currentContent = ref(null)
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
      const response = await contentService.getAll(page, perPage)
      contents.value = response.data.data
      pagination.value = response.data.pagination
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch content'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const create = async (data) => {
    isLoading.value = true
    error.value = null
    try {
      const response = await contentService.create(data)
      contents.value.unshift(response.data.data)
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to create content'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const get = async (id) => {
    try {
      const response = await contentService.get(id)
      currentContent.value = response.data.data
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch content'
      throw err
    }
  }

  const update = async (id, data) => {
    isLoading.value = true
    error.value = null
    try {
      const response = await contentService.update(id, data)
      const index = contents.value.findIndex((c) => c.id === id)
      if (index !== -1) {
        contents.value[index] = response.data.data
      }
      currentContent.value = response.data.data
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to update content'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const publish = async (id) => {
    isLoading.value = true
    error.value = null
    try {
      const response = await contentService.publish(id)
      const index = contents.value.findIndex((c) => c.id === id)
      if (index !== -1) {
        contents.value[index] = response.data.data
      }
      currentContent.value = response.data.data
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to publish content'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const remove = async (id) => {
    isLoading.value = true
    error.value = null
    try {
      await contentService.delete(id)
      contents.value = contents.value.filter((c) => c.id !== id)
      return true
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to delete content'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  return {
    contents,
    currentContent,
    isLoading,
    error,
    pagination,
    getAll,
    create,
    get,
    update,
    publish,
    remove,
  }
})
