<template>
  <div class="creator-page settings-page">
    <CreatorHeader :name="displayName" :avatar="headerAvatar" :tagline="headerTagline" @add="goToCreate" @logout="handleLogout" />
    <CreatorNav :username="username" />

    <div class="tab-content card">
      <div class="card-header">
        <div>
          <p class="eyebrow">Creator Zone</p>
          <h3>Create New Post</h3>
          <p class="muted">Share a new post with your subscribers. Choose a plan to target.</p>
        </div>
        <div class="pill-actions">
          <div class="pill">Draft or Publish</div>
          <button
            v-if="showAddMore"
            type="button"
            class="pill add-more"
            @click="resetForm"
          >
            Add More
          </button>
        </div>
      </div>

      <div v-if="status.message" class="status" :class="status.type">{{ status.message }}</div>

      <form class="form-grid" @submit.prevent="saveDraft">
        <div class="triple-row full">
          <div class="access-row">
            <div class="toggle-label">
              Access Type
              <small class="muted block-label">Choose how viewers unlock this post.</small>
            </div>
            <button
              type="button"
              class="toggle-btn access-toggle"
              :class="{ active: form.is_ppv }"
              @click="setAccessType(!form.is_ppv)"
              :aria-pressed="form.is_ppv"
            >
              <span class="dot"></span>
            </button>
            <div class="access-copy">
              <span :class="{ active: !form.is_ppv }">Subscription Plan</span>
              <span class="divider">/</span>
              <span :class="{ active: form.is_ppv }">PPV (pay-per-view)</span>
            </div>
          </div>

          <label>
            Subscription Plan
            <select v-model="form.subscription_tier" :disabled="form.is_ppv" :required="!form.is_ppv">
              <option value="" disabled>Select a plan</option>
              <option v-for="plan in plans" :key="plan.id" :value="plan.slug">
                {{ plan.name }}
              </option>
            </select>
          </label>

          <label>
            Post Title
            <input v-model="form.title" type="text" required placeholder="Post title" @input="onTitleInput">
          </label>

          <label>
            Slug
            <input v-model="form.slug" type="text" required readonly>
            <small class="muted">Slug auto-generates from title.</small>
          </label>
        </div>

        <div class="triple-row full">
          <label>
            Content Type
            <select v-model="form.content_type" required>
              <option value="article">Article</option>
              <option value="video">Video</option>
              <option value="podcast">Podcast</option>
            </select>
          </label>

          <label>
            Post Image
            <input
              type="file"
              accept="image/*"
              @change="onPostImageChange"
              :required="!isEdit.value && !form.post_image_preview"
            >
            <div class="avatar-preview" v-if="form.post_image_preview">
              <img :src="form.post_image_preview" alt="Post image preview">
            </div>
          </label>

          <label>
            Thumbnail Image
            <input type="file" accept="image/*" @change="onThumbImageChange">
            <div class="avatar-preview" v-if="form.thumbnail_preview">
              <img :src="form.thumbnail_preview" alt="Thumbnail preview">
            </div>
          </label>
        </div>

        <label class="full">
          Description
          <textarea v-model="form.description" rows="6" placeholder="Write your post..."></textarea>
        </label>

        <div class="triple-row full" v-if="form.is_ppv">
          <label>
            PPV Price
            <input v-model.number="form.ppv_price" type="number" step="0.01" min="0" placeholder="4.99" required>
          </label>
          <label>
            Currency
            <input v-model="form.ppv_currency" type="text" maxlength="10" placeholder="USD">
          </label>
          <label>
            Expires in days (optional)
            <input v-model.number="form.ppv_expires_in_days" type="number" min="1" placeholder="e.g. 30">
          </label>
        </div>

        <div class="toggle-row duo">
          <span class="toggle-label">Featured</span>
          <button
            type="button"
            class="toggle-btn"
            :class="{ active: form.is_featured }"
            @click="form.is_featured = !form.is_featured"
            :aria-pressed="form.is_featured"
          >
            <span class="dot"></span>
          </button>
          <span class="muted status-text">{{ form.is_featured ? 'This post will be highlighted.' : 'Normal visibility.' }}</span>
        </div>

        <div class="toggle-row duo">
          <span class="toggle-label">Publish</span>
          <button
            type="button"
            class="toggle-btn"
            :class="{ active: form.is_published }"
            @click="form.is_published = !form.is_published"
            :aria-pressed="form.is_published"
          >
            <span class="dot"></span>
          </button>
          <span class="muted status-text">{{ form.is_published ? 'Will be published' : 'Saved as draft' }}</span>
        </div>

        <div class="actions full">
          <button type="submit" class="primary" :disabled="loading">
            <span v-if="loading" class="spinner"></span>
            {{ loading ? 'Saving...' : 'Save' }}
          </button>
          <button type="button" class="ghost" @click="router.back()">Cancel</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import CreatorHeader from '../../components/creator/CreatorHeader.vue'
import CreatorNav from '../../components/creator/CreatorNav.vue'
import { subscriptionService, contentService } from '../../services'
import api from '../../services/api'
import { useAuthStore } from '../../stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const username = ref(route.params.username || 'creator')
const displayName = ref(decodeURIComponent(username.value))
const FALLBACK_AVATAR =
  "data:image/webp;base64,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"
const headerAvatar = ref(FALLBACK_AVATAR)
const headerTagline = ref('Tiny stories from a big world')
const isEdit = ref(!!route.params.id)

const plans = ref([])
const status = reactive({ message: '', type: 'success' })
const loading = ref(false)
const showAddMore = ref(!!route.params.id)

const form = reactive({})

const setFormDefaults = () => {
  form.subscription_tier = ''
  form.title = ''
  form.slug = ''
  form.description = ''
  form.content_type = 'article'
  form.post_image_file = null
  form.post_image_preview = ''
  form.thumbnail_file = null
  form.thumbnail_preview = ''
  form.is_featured = false
  form.is_published = false
  form.is_ppv = false
  form.ppv_price = ''
  form.ppv_currency = 'USD'
  form.ppv_expires_in_days = ''
  form.required_tier = 1
}

setFormDefaults()

const noop = () => {}

const loadPlans = async () => {
  try {
    const { data } = await subscriptionService.getAll(1, 50)
    plans.value = data?.data || data?.data?.data || []
    if (!isEdit.value && !form.subscription_tier && plans.value.length) {
      form.subscription_tier = plans.value[0].slug
    }
    updateRequiredTier()
  } catch (e) {
    status.message = 'Could not load your plans.'
    status.type = 'error'
  }
}

const loadProfile = async () => {
  try {
    const { data } = await api.get('/user-information')
    const payload = data.data || data
    const assetBase = new URL(api.defaults.baseURL).origin
    const avatarPath = payload.user?.avatar_url || payload.information?.avatar_url
    const normalized = avatarPath
      ? (avatarPath.startsWith('http') ? avatarPath : `${assetBase}${avatarPath.startsWith('/') ? '' : '/'}${avatarPath}`)
      : FALLBACK_AVATAR
    headerAvatar.value = normalized
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      if (normalized && user) {
        user.avatar_url = normalized
        localStorage.setItem('user', JSON.stringify(user))
      }
    } catch {
      // ignore
    }
    headerTagline.value = payload.information?.tagline || headerTagline.value
    displayName.value = payload.user?.name || displayName.value
  } catch {
    // keep defaults
  }
}

const loadPost = async () => {
  if (!isEdit.value) return
  try {
    const { data } = await contentService.get(route.params.id)
    const post = data?.data || data
    form.subscription_tier = post.subscription_tier || ''
    form.is_ppv = !!post.is_ppv
    form.ppv_price = post.ppv_price || ''
    form.ppv_currency = post.ppv_currency || 'USD'
    form.ppv_expires_in_days = post.ppv_expires_in_days || ''
    form.required_tier = post.required_tier || 1
    form.title = post.title || ''
    form.slug = post.slug || ''
    form.description = post.description || ''
    form.content_type = post.content_type || 'article'
    form.is_featured = !!post.is_featured
    form.is_published = !!post.is_published
    const assetBase = new URL(api.defaults.baseURL).origin
    form.post_image_preview = post.media_url
      ? (post.media_url.startsWith('http') ? post.media_url : `${assetBase}${post.media_url}`)
      : ''
    form.thumbnail_preview = post.thumbnail_url
      ? (post.thumbnail_url.startsWith('http') ? post.thumbnail_url : `${assetBase}${post.thumbnail_url}`)
      : ''
    form.post_image_file = null
    form.thumbnail_file = null
    updateRequiredTier()
  } catch (e) {
    status.message = 'Unable to load post.'
    status.type = 'error'
  }
}

const saveDraft = async () => {
  if ((!form.is_ppv && !form.subscription_tier) || !form.title) {
    status.message = 'Please fill required fields.'
    status.type = 'error'
    return
  }
  if (form.is_ppv && !form.ppv_price) {
    status.message = 'Please set a PPV price.'
    status.type = 'error'
    return
  }

  const payload = new FormData()
  payload.append('subscription_tier', form.is_ppv ? '' : form.subscription_tier)
  payload.append('is_ppv', form.is_ppv ? '1' : '0')
  if (form.is_ppv) {
    payload.append('ppv_price', form.ppv_price || 0)
    payload.append('ppv_currency', form.ppv_currency || 'USD')
    if (form.ppv_expires_in_days) {
      payload.append('ppv_expires_in_days', form.ppv_expires_in_days)
    }
  }
  payload.append('title', form.title)
  payload.append('slug', form.slug)
  payload.append('description', form.description || '')
  payload.append('content_type', form.content_type)
  payload.append('is_featured', form.is_featured ? '1' : '0')
  payload.append('is_published', form.is_published ? '1' : '0')
  payload.append('required_tier', form.required_tier || 1)

  if (form.post_image_file) {
    payload.append('post_image', form.post_image_file)
  } else if (isEdit.value && form.post_image_preview) {
    payload.append('media_url', form.post_image_preview.replace(new URL(api.defaults.baseURL).origin, ''))
  }

  if (form.thumbnail_file) {
    payload.append('thumbnail_image', form.thumbnail_file)
  } else if (isEdit.value && form.thumbnail_preview) {
    payload.append('thumbnail_url', form.thumbnail_preview.replace(new URL(api.defaults.baseURL).origin, ''))
  }

  status.message = ''
  loading.value = true
  try {
    if (isEdit.value) {
      await contentService.update(route.params.id, payload)
      status.message = 'Post updated successfully.'
      status.type = 'success'
    } else {
      await contentService.create(payload)
      status.message = 'Post created successfully.'
      status.type = 'success'
      isEdit.value = false
    }
    showAddMore.value = true
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } catch (e) {
    status.message = 'Unable to create post. Please try again.'
    status.type = 'error'
  } finally {
    loading.value = false
  }
}

const onTitleInput = () => {
  form.slug = form.title
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

const onPostImageChange = (event) => {
  const file = event.target.files?.[0]
  form.post_image_file = file || null
  form.post_image_preview = file ? URL.createObjectURL(file) : ''
}

const onThumbImageChange = (event) => {
  const file = event.target.files?.[0]
  form.thumbnail_file = file || null
  form.thumbnail_preview = file ? URL.createObjectURL(file) : ''
}

const setAccessType = (ppv) => {
  form.is_ppv = ppv
  if (ppv) {
    form.subscription_tier = ''
    form.required_tier = 1
  }
}

const updateRequiredTier = () => {
  const selected = plans.value.find(p => p.slug === form.subscription_tier)
  if (!selected) return
  form.required_tier = selected.tier_level ? Number(selected.tier_level) : 1
}

watch(() => form.subscription_tier, updateRequiredTier)

const goToCreate = () => {
  router.push(`/creator/${username.value}/create-post`)
}

const resetForm = () => {
  setFormDefaults()
  status.message = ''
  status.type = 'success'
  showAddMore.value = false
  // when coming from edit, ensure fresh create route
  if (route.params.id) {
    router.push(`/creator/${username.value}/create-post`)
    isEdit.value = false
  }
}

const handleLogout = async () => {
  try {
    await authStore.logout()
    router.push('/login')
  } catch (e) {
    // ignore
  }
}

onMounted(() => {
  loadPlans()
  loadProfile()
  loadPost()
})
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
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
}

.pill-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.add-more {
  padding: 8px 12px;
  border-radius: 10px;
  border: 1px solid #f1d8cb;
  color: #7a554b;
  background: #fff7f3;
  cursor: pointer;
  transition: all 0.15s ease;
}

.add-more:hover {
  background: #ffd7c3;
  border-color: #f0b59c;
}

.card-header h3 {
  margin: 4px 0 2px;
  font-size: 22px;
}

.eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 11px;
  color: #a17863;
  margin: 0;
}

.pill {
  background: #fff1ea;
  color: #7d4a3a;
  padding: 8px 12px;
  border-radius: 999px;
  font-weight: 700;
  border: 1px solid #f5cbbb;
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

.primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.spinner {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 2px solid rgba(255,255,255,0.5);
  border-top-color: #fff;
  display: inline-block;
  margin-right: 6px;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
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

.status {
  margin: 8px 0 12px;
  padding: 10px 12px;
  border-radius: 12px;
  font-weight: 700;
  border: 1px solid transparent;
}

.status.success {
  background: #e6f7e9;
  color: #2f7a3d;
  border: 1px solid #b6e2c1;
}

.status.error {
  background: #ffecec;
  color: #b3261e;
  border: 1px solid #f5c2c0;
}

.toggle-row {
  display: grid;
  grid-template-columns: auto auto 1fr;
  align-items: center;
  gap: 10px;
}

.toggle-row.duo {
  grid-template-columns: 1fr;
  column-gap: 16px;
  margin-top: 4px;
}

.access-row {
  display: grid;
  grid-template-columns: auto 60px 1fr;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  border: 1px dashed #f0d8cb;
  border-radius: 14px;
  background: linear-gradient(120deg, #fff7f2, #fffaf7);
}

.access-toggle {
  margin: 0 auto;
}

.access-copy {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 12px;
  color: #8a6a5c;
}

.access-copy .divider {
  opacity: 0.6;
}

.access-copy .active {
  color: #4b332b;
}

.block-label {
  display: block;
  margin-top: 4px;
}

.toggle-label {
  font-weight: 700;
  color: #5a4035;
}

.toggle-btn {
  width: 48px;
  height: 26px;
  border-radius: 20px;
  background: #e6cfc0;
  position: relative;
  cursor: pointer;
  transition: background 0.2s ease;
  border: none;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.08);
}

.toggle-btn .dot {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #fff;
  position: absolute;
  top: 4px;
  left: 5px;
  transition: transform 0.2s ease;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

.toggle-btn.active {
  background: linear-gradient(135deg, #f5a7a8, #f7c8b4);
}

.toggle-btn.active .dot {
  transform: translateX(20px);
}

.avatar-preview {
  margin-top: 8px;
  padding: 8px;
  border: 1px dashed #e6cfc0;
  border-radius: 10px;
  background: #fffaf7;
}

.avatar-preview img {
  max-width: 180px;
  border-radius: 10px;
  box-shadow: 0 6px 12px rgba(0,0,0,0.12);
}
</style>
