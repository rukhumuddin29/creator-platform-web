<template>
  <div v-if="isCreatorContext" class="creator-page settings-page">
    <CreatorHeader :name="displayName" :avatar="headerAvatar" :tagline="headerTagline" @add="goToCreate" />
    <CreatorNav :username="username" />

    <div class="tab-content card">
      <div class="card-header">
        <div>
          <p class="eyebrow">Creator Zone</p>
          <h3>{{ isEditMode ? 'Edit Post' : 'Create New Post' }}</h3>
          <p class="muted">Keep your posts consistent across the creator dashboard.</p>
        </div>
      </div>

      <div class="form-shell">
        <form @submit.prevent="handleSubmit" class="form-grid">
          <label>
            Title
            <input v-model="formData.title" type="text" required placeholder="Content title" />
          </label>

          <label class="full">
            Description
            <textarea v-model="formData.description" rows="4" required placeholder="Describe your content..."></textarea>
          </label>

          <div class="triple-row full">
            <label>
              Content Type
              <select v-model="formData.content_type" required>
                <option value="">Select a type</option>
                <option value="video">Video</option>
                <option value="article">Article</option>
                <option value="podcast">Podcast</option>
              </select>
            </label>

            <label>
              Media URL
              <input v-model="formData.media_url" type="url" required placeholder="https://..." />
            </label>

            <label>
              Thumbnail URL (Optional)
              <input v-model="formData.thumbnail_url" type="url" placeholder="https://..." />
            </label>
          </div>

          <label>
            Subscription Tier
            <input v-model="formData.subscription_tier" type="text" placeholder="e.g., premium" />
          </label>

          <label class="toggle-row">
            <span>Publish immediately</span>
            <input v-model="formData.is_published" type="checkbox" />
          </label>

          <div class="actions">
            <button type="submit" class="primary" :disabled="isLoading">
              {{ isLoading ? 'Saving...' : 'Save Content' }}
            </button>
            <button type="button" class="ghost" @click="goBack">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  </div>

  <div v-else class="min-h-screen bg-gray-50">
    <nav class="bg-white shadow mb-8">
      <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <router-link to="/content" class="text-blue-600 hover:underline">Back to Content</router-link>
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
import CreatorHeader from '../../components/creator/CreatorHeader.vue'
import CreatorNav from '../../components/creator/CreatorNav.vue'

const router = useRouter()
const route = useRoute()
const contentStore = useContentStore()

const username = ref(route.params.username || '')
const displayName = ref(decodeURIComponent(username.value || 'Creator'))
const headerAvatar = ref('')
const headerTagline = ref('Tiny stories from a big world')

const isCreatorContext = computed(() => route.name && route.name.toString().toLowerCase().includes('creator'))

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
    goBack()
  } catch (error) {
    alert('Failed to save content')
  } finally {
    isLoading.value = false
  }
}

const goBack = () => {
  if (isCreatorContext.value) {
    router.push(`/creator/${username.value}/my-posts`)
  } else {
    router.push('/content')
  }
}

const goToCreate = () => {
  router.push(`/creator/${username.value}/create-post`)
}
</script>

<style scoped>
.creator-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #fce5dc 0%, #ffffff 40%);
  color: #55423d;
  font-family: 'Trebuchet MS', 'Lucida Sans Unicode', 'Lucida Grande', 'Lucida Sans', Arial, sans-serif;
  padding: 24px;
}

.tab-content {
  background: #fff;
  border-radius: 18px;
  padding: 20px 22px 24px;
  box-shadow: 0 10px 18px rgba(0,0,0,0.08);
  margin-top: 12px;
  border: 1px solid #f1d8cb;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
}

.eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 11px;
  color: #a17863;
  margin: 0;
}

.form-shell {
  border: 1px solid #f1d8cb;
  border-radius: 14px;
  padding: 16px;
  background: #fffdfb;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 12px 16px;
}

.triple-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(220px, 1fr));
  gap: 12px 16px;
}

label {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-weight: 600;
  color: #5a4035;
}

input,
textarea,
select {
  border: 1px solid #e6cfc0;
  border-radius: 10px;
  padding: 10px 12px;
  background: #fff7f2;
  color: #55423d;
}

input:focus,
textarea:focus,
select:focus {
  outline: 2px solid #f5a7a8;
}

.full {
  grid-column: 1 / -1;
}

.actions {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-top: 4px;
}

.primary {
  background: linear-gradient(135deg, #f5a7a8, #f7c8b4);
  color: #fff;
  border: none;
  padding: 10px 16px;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 700;
  box-shadow: 0 6px 12px rgba(0,0,0,0.12);
}

.ghost {
  background: transparent;
  color: #6d4f43;
  border: 1px solid #e6cfc0;
  padding: 10px 16px;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 700;
}

.toggle-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
