<template>
  <div class="min-h-screen bg-gray-50">
    <nav class="bg-white shadow mb-8">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <router-link to="/dashboard" class="text-blue-600 hover:underline">← Back to Dashboard</router-link>
      </div>
    </nav>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 class="text-3xl font-bold mb-8">Manage Your Content</h1>

      <div class="mb-4">
        <router-link
          to="/content/create"
          class="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
        >
          + Create New Content
        </router-link>
      </div>

      <div v-if="isLoading" class="text-center py-12">
        <p class="text-gray-600">Loading content...</p>
      </div>

      <div v-else-if="contents.length === 0" class="bg-white p-8 rounded-lg shadow text-center">
        <p class="text-gray-600 mb-4">No content yet</p>
        <router-link to="/content/create" class="text-blue-600 hover:underline">Create your first content</router-link>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="content in contents" :key="content.id" class="bg-white p-6 rounded-lg shadow">
          <div v-if="content.thumbnail_url" class="mb-4">
            <img :src="content.thumbnail_url" :alt="content.title" class="w-full h-40 object-cover rounded" />
          </div>
          <h3 class="text-lg font-bold mb-2">{{ content.title }}</h3>
          <p class="text-sm text-gray-600 mb-2">{{ content.content_type }}</p>
          <p class="text-gray-600 mb-4 line-clamp-2">{{ content.description }}</p>
          <div class="mb-4">
            <span
              :class="content.is_published ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'"
              class="px-3 py-1 rounded-full text-sm font-medium"
            >
              {{ content.is_published ? 'Published' : 'Draft' }}
            </span>
          </div>
          <div class="flex gap-2">
            <router-link
              :to="`/content/${content.id}/edit`"
              class="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition text-center text-sm"
            >
              Edit
            </router-link>
            <button
              v-if="!content.is_published"
              @click="publishContent(content.id)"
              class="flex-1 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition text-sm"
            >
              Publish
            </button>
            <button
              @click="deleteContent(content.id)"
              class="flex-1 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition text-sm"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useContentStore } from '../../stores/content'

const contentStore = useContentStore()
const { contents, isLoading } = contentStore

onMounted(() => {
  contentStore.getAll()
})

const publishContent = async (id) => {
  try {
    await contentStore.publish(id)
  } catch (error) {
    alert('Failed to publish content')
  }
}

const deleteContent = async (id) => {
  if (confirm('Are you sure you want to delete this content?')) {
    try {
      await contentStore.remove(id)
    } catch (error) {
      alert('Failed to delete content')
    }
  }
}
</script>
