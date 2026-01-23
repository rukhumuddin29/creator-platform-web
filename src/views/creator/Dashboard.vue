<template>
  <div class="creator-page">
<CreatorHeader :name="displayName" :avatar="headerAvatar" @add="handleAddPost" @logout="handleLogout" />
    <CreatorNav :username="username" />

    <section class="stats-grid">
      <div class="stat-card chart-card">
        <div class="chart-header">
          <div>
            <p class="chart-title">Revenue Analytics</p>
            <p class="chart-sub">${{ totalRevenue.toLocaleString() }} <span class="muted">total revenue ($)</span></p>
          </div>
          <span class="chip">Last 6 months</span>
        </div>
        <svg viewBox="0 0 300 120" class="chart">
          <polyline
            :points="chartPoints"
            fill="none"
            stroke="#b77c73"
            stroke-width="3"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <circle v-for="(p, idx) in parsedChartPoints" :key="idx" :cx="p.x" :cy="p.y" r="3" fill="#b77c73" />
        </svg>
        <div class="chart-foot">
          <span v-for="label in chartLabels" :key="label" class="chart-label">{{ label }}</span>
        </div>
      </div>

      <div class="stat-card main">
        <div class="stat-row" v-for="stat in statEntries" :key="stat.label">
          <span class="stat-label">{{ stat.label.toUpperCase() }}</span>
          <span class="stat-value" :class="{ pulse: animate }">{{ stat.value }}</span>
        </div>
      </div>

      <div class="stat-card subs-card">
        <div class="subs-header">
          <span class="chart-title">Recent Subscribers</span>
          <div class="subs-controls" v-if="recentSubscribers.length > subsPageSize">
            <button class="pill-btn" @click="prevSubs" :disabled="subsPage === 1">â€¹</button>
            <button class="pill-btn" @click="nextSubs" :disabled="subsPage * subsPageSize >= recentSubscribers.length">â€º</button>
          </div>
          <span class="muted" v-else>Last 5</span>
        </div>
        <div v-if="recentSubscribers.length" class="subs-list">
          <div class="subs-item" v-for="sub in visibleSubscribers" :key="sub.id">
            <img class="avatar tiny" :src="resolveSrc(sub.avatar_url)" alt="" />
            <div class="subs-meta">
              <span class="subs-name">{{ sub.name || sub.username || 'Subscriber' }}</span>
              <span class="subs-plan">{{ sub.plan || 'Plan' }}</span>
            </div>
          </div>
        </div>
        <div v-else class="muted small">No subscribers yet.</div>
      </div>
    </section>

    <section class="content">
      <h2 class="section-title">My Featured Subscription Posts</h2>
      <div class="cards">
        <article class="card" v-for="post in featuredPosts" :key="post.id">
          <span class="badge">{{ formatPlan(post.subscription_tier) }}</span>
          <img :src="resolveSrc(post.thumbnail_url) || resolveSrc(post.media_url)" :alt="post.title" loading="lazy">
          <div class="card-footer">
            <div class="author">
              <span class="title">{{ post.title }}</span>
            </div>
          </div>
        </article>
      </div>
      <div class="load-more" v-if="hasMore">
        <button class="load-btn" @click="loadFeatured(true)">Load More</button>
      </div>
    </section>

    <section class="content">
      <div class="section-header">
        <h2 class="section-title">PPV Featured Posts</h2>
        <button class="load-btn ghost" @click="goToPosts" v-if="ppvHasAny">View All Posts</button>
      </div>
      <div v-if="ppvFeatured.length" class="ppv-grid">
        <article class="card" v-for="post in ppvFeatured" :key="`ppv-${post.id}`">
          <span class="badge accent">PPV</span>
          <img :src="resolveSrc(post.thumbnail_url) || resolveSrc(post.media_url)" :alt="post.title" loading="lazy">
          <div class="card-footer">
            <div class="author">
              <span class="title">{{ post.title }}</span>
              <span class="muted small">
                ${{ formatPrice(post.ppv_price) }} 
              </span>
              <span class="muted small" v-if="post.ppv_expires_in_days">
                Added {{ formatDate(post.created_at) }} {{ expiryLabel(post) }}
              </span>
            </div>
          </div>
        </article>
      </div>
      <div v-else class="muted small">No PPV featured posts yet.</div>
      <div class="load-more" v-if="ppvHasMore">
        <button class="load-btn" @click="loadMorePpv">Load More</button>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import CreatorHeader from '../../components/creator/CreatorHeader.vue'
import CreatorNav from '../../components/creator/CreatorNav.vue'
import { contentService, creatorSubscriberService } from '../../services'
import { useAuthStore } from '../../stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const username = computed(() => route.params.username || 'creator')
const displayName = computed(() => decodeURIComponent(username.value))
const headerAvatar = computed(() => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    return user?.avatar_url || ''
  } catch {
    return ''
  }
})

const handleAddPost = () => {
  router.push({ name: 'CreatorCreatePost', params: { username: username.value } })
}

const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}

const goToPosts = () => {
  router.push({ name: 'CreatorPosts', params: { username: username.value } })
}

const statEntries = computed(() => [
  { label: 'My Posts', value: internalState.value.posts },
  { label: 'Subscribers', value: internalState.value.subscribers },
  { label: 'Follows', value: internalState.value.follows },
])

const internalState = ref({
  posts: 0,
  subscribers: 0,
  follows: 0,
})

const allFeatured = ref([])
const allFeaturedSubs = ref([])
const featuredPosts = ref([])
const page = ref(1)
const chunkSize = 8
const hasMore = ref(false)
const ppvFeatured = ref([])
const ppvPage = ref(1)
const ppvChunk = 10
const ppvHasMore = ref(false)
const recentSubscribers = ref([])
const totalRevenue = ref(0)
const chartData = ref([0, 0, 0, 0, 0, 0])
const chartLabels = ref(['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'])
const subsPage = ref(1)
const subsPageSize = 2

const backendBase = (import.meta.env.VITE_BACKEND_URL || '').replace(/\/$/, '')
const resolveSrc = (path) => {
  if (!path) return ''
  if (path.startsWith('http')) return path
  return backendBase ? `${backendBase}${path.startsWith('/') ? '' : '/'}${path}` : path
}

const animate = ref(false)

const formatPlan = (plan) => {
  if (!plan || plan === 'free') return 'Free'
  return plan.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

const formatDate = (val) => {
  if (!val) return ''
  return new Date(val).toLocaleDateString()
}

const expiryLabel = (post) => {
  if (!post.ppv_expires_in_days) return ''
  const created = post.created_at ? new Date(post.created_at) : new Date()
  const expires = new Date(created)
  expires.setDate(expires.getDate() + Number(post.ppv_expires_in_days))
  const now = new Date()
  if (now > expires) return 'Post Expired'
  const diff = Math.ceil((expires - now) / (1000 * 60 * 60 * 24))
  return `Expiry in ${diff} day${diff === 1 ? '' : 's'}`
}

const formatPrice = (val) => {
  const num = Number(val || 0)
  return num.toFixed(2)
}

const loadFeatured = async (loadNext = false) => {
  try {
    if (!allFeatured.value.length) {
      const { data } = await contentService.getAll(1, 200)
      const items = Array.isArray(data?.data) ? data.data : []
      allFeatured.value = items.filter((item) => item.is_featured)
      allFeaturedSubs.value = allFeatured.value.filter((item) => !item.is_ppv)
    }

    page.value = loadNext ? page.value + 1 : 1
    const end = page.value * chunkSize
    featuredPosts.value = allFeaturedSubs.value.slice(0, end)
    hasMore.value = allFeaturedSubs.value.length > end

    buildPpvLists()
  } catch (error) {
    console.error('Failed to load featured posts', error)
    featuredPosts.value = []
    hasMore.value = false
    ppvFeatured.value = []
    ppvHasMore.value = false
  }
}

const buildPpvLists = () => {
  const ppvAll = allFeatured.value.filter((item) => item.is_ppv)
  ppvPage.value = 1
  ppvFeatured.value = ppvAll.slice(0, ppvChunk)
  ppvHasMore.value = ppvAll.length > ppvChunk
}

const loadMorePpv = () => {
  const ppvAll = allFeatured.value.filter((item) => item.is_ppv)
  ppvPage.value += 1
  const end = ppvPage.value * ppvChunk
  ppvFeatured.value = ppvAll.slice(0, end)
  ppvHasMore.value = ppvAll.length > end
}

const ppvHasAny = computed(() => ppvFeatured.value.length > 0)

const buildRevenueSeries = (items = []) => {
  const now = new Date()
  const months = []
  for (let i = 5; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    months.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: d.toLocaleString('default', { month: 'short' }), total: 0 })
  }

  const getAmount = (item) =>
    Number(
      item.amount ??
      item.price ??
      item.subscription_price ??
      item.plan_price ??
      item.total ??
      0
    )

  let grand = 0
  items.forEach((item) => {
    const rawDate = item.subscribed_at || item.created_at || item.updated_at
    const dt = rawDate ? new Date(rawDate) : null
    const key = dt ? `${dt.getFullYear()}-${dt.getMonth()}` : null
    const amt = getAmount(item)
    grand += amt
    if (!key) return
    const bucket = months.find((m) => m.key === key)
    if (bucket) bucket.total += amt
  })

  totalRevenue.value = grand
  chartData.value = months.map((m) => m.total)
  chartLabels.value = months.map((m) => m.label)
}

const loadStats = async () => {
  try {
    // posts total from pagination meta
    const { data } = await contentService.getAll(1, 1)
    
    const total =
      data?.pagination?.total ||
      data?.data?.pagination?.total ||
      data?.meta?.total ||
      data?.data?.meta?.total ||
      data?.data?.total ||
      data?.total ||
      (Array.isArray(data?.data) ? data.data.length : 0) ||
      (Array.isArray(data?.data?.data) ? data.data.data.length : 0)
    internalState.value.posts = total
  } catch {
    internalState.value.posts = 0
  }

  try {
    const response = await creatorSubscriberService.getAll(1, 50)
    const body = response?.data || {}
    const items = Array.isArray(body?.data) ? body.data : Array.isArray(body) ? body : []
    recentSubscribers.value = items.slice(0, 5).map((item) => ({
      id: item.id,
      name: item.name,
      username: item.username,
      avatar_url: item.avatar_url,
      plan: item.subscription_plan || item.plan || item.subscription_name || 'Subscription',
    }))
    buildRevenueSeries(items)
    const total =
      body?.pagination?.total ??
      body?.data?.pagination?.total ??
      body?.meta?.total ??
      body?.data?.meta?.total ??
      body?.total ??
      body?.data?.total ??
      (Array.isArray(body?.data?.data) ? body.data.data.length : 0) ??
      (Array.isArray(body?.data) ? body.data.length : 0) ??
      (Array.isArray(body) ? body.length : 0) ??
      0
    internalState.value.subscribers = total
  } catch (error) {
    console.error('creatorSubscriberService error', error)
    internalState.value.subscribers = 0
  }

  internalState.value.follows = 0 // placeholder for future logic
  animate.value = true
  setTimeout(() => (animate.value = false), 1200)
}

onMounted(() => {
  loadStats()
  loadFeatured()
})

const parsedChartPoints = computed(() => {
  const maxVal = Math.max(...chartData.value, 1)
  const stepX = 300 / (chartData.value.length - 1 || 1)
  return chartData.value.map((val, idx) => ({
    x: idx * stepX,
    y: 120 - (val / maxVal) * 100,
  }))
})

const chartPoints = computed(() => parsedChartPoints.value.map((p) => `${p.x},${p.y}`).join(' '))

const visibleSubscribers = computed(() => {
  const start = (subsPage.value - 1) * subsPageSize
  return recentSubscribers.value.slice(start, start + subsPageSize)
})

const nextSubs = () => {
  const maxPage = Math.ceil(recentSubscribers.value.length / subsPageSize)
  if (subsPage.value < maxPage) subsPage.value += 1
}

const prevSubs = () => {
  if (subsPage.value > 1) subsPage.value -= 1
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

.creator-page :deep(*) {
  font-family: inherit;
}

.creator-hero {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  padding: 16px 0;
}

.creator-brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #f7c8b4;
  box-shadow: 0 6px 12px rgba(0,0,0,0.12);
}

.avatar.small {
  width: 36px;
  height: 36px;
  border: 2px solid #f7c8b4;
}

.name {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
}

.tagline {
  margin: 0;
  color: #8a6457;
  font-size: 12px;
}

.logo {
  justify-self: center;
  font-size: 32px;
  margin: 0;
  font-weight: 700;
}

.add-post {
  justify-self: end;
  background: #f5a7a8;
  color: #fff;
  border: none;
  border-radius: 24px;
  padding: 10px 20px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 8px 16px rgba(0,0,0,0.12);
}

.creator-nav {
  display: flex;
  justify-content: center;
  gap: 24px;
  margin: 12px 0 24px;
}

.creator-nav a {
  color: #6d4f43;
  text-decoration: none;
  font-weight: 600;
}

.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
}

.card {
  position: relative;
  background: #fff;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 8px 16px rgba(0,0,0,0.12);
}

.card img {
  width: 100%;
  height: 220px;
  object-fit: cover;
}

.badge {
  position: absolute;
  top: 12px;
  left: 12px;
  background: #f5a7a8;
  color: #fff;
  padding: 6px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 700;
  box-shadow: 0 4px 8px rgba(0,0,0,0.12);
}

.card-footer {
  padding: 12px 14px;
  display: flex;
}

.author {
  display: inline-grid;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #6d4f43;
}

.title {
  font-weight: 700;
  color: #5a4035;
}

.load-more {
  display: flex;
  justify-content: center;
  margin-top: 12px;
}

.load-btn {
  background: #f5a7a8;
  color: #fff;
  border: none;
  padding: 10px 16px;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 8px 16px rgba(0,0,0,0.08);
}

.stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(180px, 1fr));
  gap: 12px;
  margin: 12px 0 4px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(220px, 1fr));
  gap: 14px;
  margin: 12px 0 20px;
}

.stat-card {
  background: #fff7f2;
  border: 1px solid #f1d8cb;
  border-radius: 14px;
  padding: 14px 16px;
  box-shadow: 0 8px 16px rgba(0,0,0,0.06);
}

.stat-card.empty {
  opacity: 0.6;
  min-height: 120px;
}

.stat-card.main {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.stat-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.stat-label {
  color: #8a6457;
  font-weight: 800;
  font-size: 32px;
  letter-spacing: 0.04em;
  font-family: 'Poppins', 'Segoe UI', Arial, sans-serif;
}

.stat-value {
  font-size: 32px;
  font-weight: 800;
  color: #5a4035;
  transition: transform 0.4s ease, opacity 0.4s ease;
}

.stat-value.pulse {
  transform: translateY(-2px) scale(1.02);
  opacity: 0.9;
}

.chart-card {
  grid-column: span 1;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.chart-title {
  margin: 0;
  font-weight: 800;
  color: #5a4035;
}

.chart-sub {
  margin: 0;
  color: #8a6457;
  font-weight: 700;
}

.chip {
  background: #f5e3db;
  color: #6d4f43;
  padding: 4px 10px;
  border-radius: 12px;
  font-weight: 700;
  font-size: 12px;
}

.chart {
  width: 100%;
  height: 140px;
}

.chart-foot {
  display: flex;
  justify-content: space-between;
  color: #8a6457;
  font-size: 12px;
  margin-top: 6px;
}

.subs-card {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.subs-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.subs-controls {
  display: flex;
  gap: 6px;
}

.pill-btn {
  border: 1px solid #f1d8cb;
  background: #fff7f2;
  color: #5a4035;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  font-weight: 800;
  cursor: pointer;
}

.pill-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.subs-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.subs-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  background: #fff;
  border: 1px solid #f1d8cb;
  border-radius: 10px;
}

.subs-meta {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
}

.subs-name {
  font-weight: 700;
  color: #5a4035;
}

.subs-plan {
  font-size: 12px;
  color: #8a6457;
}

.muted {
  color: #9b7a70;
}

.muted.small {
  font-size: 12px;
}

.content {
  margin-top: 28px;
}

.section-title {
  font-size: 20px;
  margin: 0 0 12px;
  color: #5a3b32;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
}

.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 18px;
}

.cards .card {
  position: relative;
}

.cards .card img {
  width: 100%;
  height: 180px;
  object-fit: cover;
  border-radius: 14px;
}

.ppv-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 18px;
}

@media (min-width: 1024px) {
  .ppv-grid {
    grid-template-columns: repeat(5, minmax(0, 1fr));
  }
}

.badge.accent {
  background: #ffe1e1;
  color: #b35a52;
}
</style>
