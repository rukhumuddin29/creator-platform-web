<template>
  <div class="creator-page settings-page">
    <CreatorHeader :name="displayName" :avatar="headerAvatar" :tagline="headerTagline" @add="goToCreate" @logout="handleLogout" />
    <CreatorNav :username="username" />

    <div class="tab-content card">
      <div class="card-header">
        <div>
          <p class="eyebrow">Subscribers</p>
          <h3>Your subscribers list</h3>
          <p class="muted">Latest 24 per page, with plan and start date.</p>
        </div>
      </div>

      <div v-if="status.message" class="status" :class="status.type">{{ status.message }}</div>

      <div class="subs-grid">
        <div v-for="sub in subscribers" :key="sub.id" class="sub-card">
          <div class="avatar" v-if="sub.avatar_url">
            <img :src="sub.avatar_url" :alt="sub.name" />
          </div>
          <div class="avatar placeholder" v-else>
            <span>{{ initials(sub.name) }}</span>
          </div>
          <h4>{{ sub.name || 'Subscriber' }}</h4>
          <div class="pill">
            <span class="pill-dot">{{ planBadge(sub.billing_period) }}</span>
            {{ sub.subscription_name || 'Plan' }}
          </div>
          <p class="muted small">Subscribed: {{ formatDate(sub.subscribed_at) }}</p>
        </div>
      </div>

      <div class="pagination">
        <button class="ghost" :disabled="page <= 1" @click="changePage(page - 1)">Prev</button>
        <span>Page {{ page }}</span>
        <button class="ghost" :disabled="!hasMore" @click="changePage(page + 1)">Next</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import CreatorHeader from '../../components/creator/CreatorHeader.vue'
import CreatorNav from '../../components/creator/CreatorNav.vue'
import { creatorSubscriberService } from '../../services'
import api from '../../services/api'

const route = useRoute()
const router = useRouter()
const username = ref(route.params.username || 'creator')
const displayName = ref(decodeURIComponent(username.value))
const FALLBACK_AVATAR =
  "data:image/webp;base64,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"

const status = reactive({ message: '', type: 'success' })
const loading = ref(false)
const subscribers = ref([])
const page = ref(1)
const hasMore = ref(false)

const initials = (name = '') => {
  const parts = name.split(' ').filter(Boolean)
  return parts.slice(0, 2).map(p => p[0]).join('').toUpperCase() || 'SB'
}

const planBadge = (period) => {
  if (!period) return 'P'
  const map = { monthly: 'M', quarterly: 'Q', half_yearly: 'H', yearly: 'Y' }
  return map[period] || 'P'
}

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString()
}

const resolveMedia = (url) => {
  if (!url) return FALLBACK_AVATAR
  if (url.startsWith('http')) return url
  const base = new URL(api.defaults.baseURL).origin
  return `${base}${url.startsWith('/') ? '' : '/'}${url}`
}

const loadSubs = async () => {
  loading.value = true
  status.message = ''
  try {
    const { data } = await creatorSubscriberService.getAll(page.value, 24)
    const payload = data?.data || data
    subscribers.value = payload?.data || payload
    const meta = payload?.meta || data?.meta
    hasMore.value = meta ? meta.current_page < meta.last_page : false
    subscribers.value = subscribers.value.map((s) => ({
      ...s,
      avatar_url: resolveMedia(s.avatar_url),
    }))
  } catch (e) {
    status.message = 'Could not load subscribers.'
    status.type = 'error'
  } finally {
    loading.value = false
  }
}

const changePage = (p) => {
  if (p < 1) return
  page.value = p
  loadSubs()
}

const handleLogout = async () => {
  const authStore = useAuthStore()
  await authStore.logout()
  router.push('/login')
}

const goToCreate = () => router.push(`/creator/${username.value}/create-post`)

onMounted(() => {
  loadSubs()
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
  justify-content: space-between;
  align-items: center;
}

.eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: 800;
  margin: 0;
  color: #8a6a5c;
}

.muted {
  color: #8a6a5c;
  margin: 4px 0 0;
}

.subs-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(180px, 1fr));
  gap: 12px;
  margin-top: 12px;
}

@media (min-width: 1100px) {
  .subs-grid {
    grid-template-columns: repeat(6, minmax(160px, 1fr));
  }
}

@media (max-width: 720px) {
  .subs-grid {
    grid-template-columns: repeat(1, minmax(220px, 1fr));
  }
}

.sub-card {
  border: 1px solid #f1d8cb;
  border-radius: 12px;
  padding: 12px;
  text-align: center;
  box-shadow: 0 8px 16px rgba(0,0,0,0.06);
}

.avatar {
  width: 80px;
  height: 80px;
  margin: 0 auto;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid #f5c7b2;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar.placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  color: #8a6a5c;
  background: #fff7f2;
}

.pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: 999px;
  background: #fff3ed;
  border: 1px solid #f5c7b2;
  font-weight: 700;
  color: #6a4338;
  margin-top: 6px;
}

.pill-dot {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #f5a7a8;
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 12px;
}

.pagination {
  margin-top: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.ghost {
  background: transparent;
  color: #6d4f43;
  border: 1px solid #e6cfc0;
  padding: 8px 14px;
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

.status.error {
  background: #ffecec;
  color: #b3261e;
  border: 1px solid #f5c2c0;
}
</style>
