<template>
  <div class="creator-page settings-page">
    <CreatorHeader :name="displayName" :avatar="headerAvatar" :tagline="headerTagline" @add="goToCreate" />
    <CreatorNav :username="username" />

    <div class="tab-content card">
      <div class="card-header">
        <div>
          <p class="eyebrow">Creator Zone</p>
          <h3>My Posts</h3>
          <p class="muted">Your published and draft posts in one place.</p>
        </div>
        <button class="primary pill-btn" @click="goToCreate">+ Add Post</button>
      </div>

      <div v-if="status.message" class="status" :class="status.type">{{ status.message }}</div>

      <div v-if="loading" class="empty">Loading posts...</div>
      <div v-else-if="posts.length === 0" class="empty">You have not created any posts yet.</div>
      <div v-else class="table-card">
        <div class="table-head">
          <span>Title</span>
          <span>Plan</span>
          <span>Type</span>
          <span>Status</span>
          <span>Actions</span>
        </div>
        <div
          v-for="post in posts"
          :key="post.id"
          class="table-row"
        >
          <span class="title">{{ post.title }}</span>
          <span class="muted">{{ post.subscription_tier || '—' }}</span>
          <span class="muted">{{ post.content_type }}</span>
          <span>
            <span class="chip" :class="post.is_published ? 'chip-success' : 'chip-warn'">
              {{ post.is_published ? 'Published' : 'Draft' }}
            </span>
          </span>
          <span class="actions">
            <button class="icon-btn" @click="editPost(post.id)" aria-label="Edit">
              <i class="pi pi-pencil"></i>
            </button>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import CreatorHeader from '../../components/creator/CreatorHeader.vue'
import CreatorNav from '../../components/creator/CreatorNav.vue'
import { contentService } from '../../services'

const route = useRoute()
const router = useRouter()
const username = ref(route.params.username || 'creator')
const displayName = ref(decodeURIComponent(username.value))
const headerAvatar = ref('')
const headerTagline = ref('Tiny stories from a big world')

const posts = ref([])
const loading = ref(false)
const status = reactive({ message: '', type: 'success' })

const fetchPosts = async () => {
  loading.value = true
  status.message = ''
  try {
    const { data } = await contentService.getAll(1, 100)
    posts.value = data?.data || data?.data?.data || []
  } catch (e) {
    status.message = 'Could not load posts.'
    status.type = 'error'
  } finally {
    loading.value = false
  }
}

const goToCreate = () => {
  router.push(`/creator/${username.value}/create-post`)
}

const editPost = (id) => {
  router.push({ name: 'CreatorEditPost', params: { username: username.value, id } })
}

onMounted(() => {
  fetchPosts()
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
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}

.eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 11px;
  color: #a17863;
  margin: 0;
}

.pill-btn {
  padding: 10px 14px;
  border-radius: 999px;
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

.table-card {
  border: 1px solid #f1d8cb;
  border-radius: 14px;
  overflow: hidden;
  background: #fffdfb;
}

.table-head,
.table-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 0.6fr;
  padding: 12px 14px;
  align-items: center;
}

.table-head {
  background: #f7ede6;
  font-weight: 700;
  color: #5a4035;
}

.table-row {
  border-top: 1px solid #f1d8cb;
}

.table-row:nth-child(odd) {
  background: #fffdfb;
}

.table-row:nth-child(even) {
  background: #ffffff;
}

.title {
  font-weight: 700;
  color: #5a4035;
}

.muted {
  color: #8a6457;
}

.chip {
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  border: 1px solid transparent;
}

.chip-success {
  background: #e5f5ed;
  color: #207c46;
  border-color: #c4e8d3;
}

.chip-warn {
  background: #fff3da;
  color: #a66a00;
  border-color: #f6e0a6;
}

.actions {
  display: flex;
  gap: 8px;
}

.icon-btn {
  background: #f7d1c4;
  border: 1px solid #f1b9a5;
  border-radius: 10px;
  padding: 6px 10px;
  cursor: pointer;
  color: #5a4035;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.icon-btn:hover {
  background: #f5a7a8;
  color: #fff;
}

.empty {
  padding: 16px;
  border: 1px dashed #f1d8cb;
  border-radius: 12px;
  text-align: center;
  color: #8a6457;
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
</style>
