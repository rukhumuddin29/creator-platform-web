<template>
  <div class="creator-page settings-page">
    <CreatorHeader :name="displayName" :avatar="headerAvatar" :tagline="headerTagline" @add="noop" />
    <CreatorNav :username="username" />

    <div class="tab-content card">
      <h3>Create New Post</h3>
      <p class="muted">Share a new post with your subscribers. Choose a plan to target.</p>
      <div v-if="status.message" class="status" :class="status.type">{{ status.message }}</div>

      <form class="form-grid" @submit.prevent="saveDraft">
        <div class="triple-row full">
          <label>
            Subscription Plan
            <select v-model="form.subscription_tier" required>
              <option value="" disabled>Select a plan</option>
              <option value="free">Free</option>
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
            <input type="file" accept="image/*" @change="onPostImageChange" required>
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
          <button type="submit" class="primary">Save</button>
          <button type="button" class="ghost" @click="router.back()">Cancel</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import CreatorHeader from '../../components/creator/CreatorHeader.vue'
import CreatorNav from '../../components/creator/CreatorNav.vue'
import { subscriptionService } from '../../services'

const route = useRoute()
const router = useRouter()
const username = ref(route.params.username || 'creator')
const displayName = ref(decodeURIComponent(username.value))
const headerAvatar = ref('')
const headerTagline = ref('Tiny stories from a big world')

const plans = ref([])
const status = reactive({ message: '', type: 'success' })

const form = reactive({
  subscription_tier: 'free',
  title: '',
  slug: '',
  description: '',
  content_type: 'article',
  post_image_file: null,
  post_image_preview: '',
  thumbnail_file: null,
  thumbnail_preview: '',
  is_featured: false,
  is_published: false,
})

const noop = () => {}

const loadPlans = async () => {
  try {
    const { data } = await subscriptionService.getAll(1, 50)
    plans.value = data?.data || data?.data?.data || []
  } catch (e) {
    status.message = 'Could not load your plans.'
    status.type = 'error'
  }
}

const saveDraft = () => {
  status.message = 'Post saved (UI only).'
  status.type = 'success'
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

onMounted(() => {
  loadPlans()
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
  padding: 18px;
  box-shadow: 0 10px 18px rgba(0,0,0,0.08);
  margin-top: 12px;
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
  grid-template-columns: auto auto 1fr;
  column-gap: 16px;
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
