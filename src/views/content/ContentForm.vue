<template>
  <div class="min-h-screen bg-gray-50">
    <nav class="bg-white shadow mb-8">
      <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <router-link to="/content" class="text-blue-600 hover:underline">← Back to Content</router-link>
      </div>
    </nav>

    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 class="text-3xl font-bold mb-8">{{ isEditMode ? 'Edit Content' : 'Create New Content' }}</h1>

      <div class="bg-white p-8 rounded-lg shadow">
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <div>
            <label class="block text-sm font-medium mb-2">Title</label>
            <input
              v-model="formData.title"
              type="text"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Content title"
            />
          </div>

          <div>
            <label class="block text-sm font-medium mb-2">Description</label>
            <textarea
              v-model="formData.description"
              required
              rows="4"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe your content..."
            ></textarea>
          </div>

          <div>
            <label class="block text-sm font-medium mb-2">Content Type</label>
            <select
              v-model="formData.content_type"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a type</option>
              <option value="video">Video</option>
              <option value="article">Article</option>
              <option value="podcast">Podcast</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium mb-2">Media URL</label>
            <input
              v-model="formData.media_url"
              type="url"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://..."
            />
          </div>

          <div>
            <label class="block text-sm font-medium mb-2">Thumbnail URL (Optional)</label>
            <input
              v-model="formData.thumbnail_url"
              type="url"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://..."
            />
          </div>

          <div>
            <label class="block text-sm font-medium mb-2">Subscription Tier</label>
            <input
              v-model="formData.subscription_tier"
              type="text"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., premium"
            />
          </div>

          <div class="flex items-center">
            <input
              v-model="formData.is_published"
              type="checkbox"
              class="w-4 h-4"
            />
            <label class="ml-2 text-sm font-medium">Publish immediately</label>
          </div>

          <div class="flex gap-4">
            <button
              type="submit"
              :disabled="isLoading"
              class="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition disabled:opacity-50"
            >
              {{ isLoading ? 'Saving...' : 'Save Content' }}
            </button>
            <router-link to="/content" class="bg-gray-300 text-gray-700 px-6 py-2 rounded hover:bg-gray-400 transition">
              Cancel
            </router-link>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useContentStore } from '../../stores/content'

const router = useRouter()
const route = useRoute()
const contentStore = useContentStore()

const formData = ref({
  title: '',
  description: '',
  content_type: '',
  media_url: '',
  thumbnail_url: '',
  subscription_tier: 'free',
  is_published: false,
})

const isLoading = ref(false)

const isEditMode = computed(() => !!route.params.id)

onMounted(async () => {
  if (isEditMode.value) {
    try {
      await contentStore.get(route.params.id)
      const content = contentStore.currentContent
      formData.value = {
        title: content.title,
        description: content.description,
        content_type: content.content_type,
        media_url: content.media_url,
        thumbnail_url: content.thumbnail_url,
        subscription_tier: content.subscription_tier,
        is_published: content.is_published,
      }
    } catch (error) {
      alert('Failed to load content')
      router.back()
    }
  }
})

const handleSubmit = async () => {
  isLoading.value = true
  try {
    if (isEditMode.value) {
      await contentStore.update(route.params.id, formData.value)
    } else {
      await contentStore.create(formData.value)
    }
    router.push('/content')
  } catch (error) {
    alert('Failed to save content')
  } finally {
    isLoading.value = false
  }
}
</script>
