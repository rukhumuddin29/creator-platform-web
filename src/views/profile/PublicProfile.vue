<template>
  <div :class="['public-profile', userRoleClass]">
    <CreatorHeader
      v-if="userRole === 'creator'"
      :name="currentUser?.name || 'Creator'"
      :avatar="currentUser?.avatar_url"
      :tagline="currentUser?.tagline || 'Welcome back!'"
      @add="goCreatorAddPost"
      @logout="logout"
    />
    <CreatorNav
      v-if="userRole === 'creator'"
      :username="slugify(currentUser?.name || route.params.username || 'creator')"
    />
    <SubscriberHeader
      v-else-if="userRole === 'subscriber'"
      :name="currentUser?.name || 'Subscriber'"
      :avatar="currentUser?.avatar_url"
      @home="goSubscriberHome"
      @subscriptions="goSubscriberSubs"
      @following="goSubscriberFollowing"
      @logout="logout"
    />
    <div class="overlay" v-if="loading">
      <div class="spinner"></div>
    </div>

    <div class="card" :class="{ blurred: loading }">
      <div class="avatar-wrap">
        <img :src="profile.avatar_url || defaultAvatar" alt="Profile" class="avatar" @error="onAvatarError" />
        <div class="socials" v-if="profile.socials.length">
          <a
            v-for="item in profile.socials"
            :key="item.platform + item.url"
            :href="item.url"
            target="_blank"
            rel="noopener"
            class="social-img"
            :title="item.platform"
          >
            <template v-if="resolveMedia(item.logo)">
              <img :src="resolveMedia(item.logo)" :alt="item.platform" />
            </template>
            <template v-else>
              <i :class="socialIcon(item.platform)"></i>
            </template>
          </a>
        </div>
      </div>
      <div class="info">
        <h2>{{ profile.full_name || profile.name }}</h2>
        <p class="tagline" v-if="profile.tagline">{{ profile.tagline }}</p>
      </div>
    </div>

    <section class="featured">
      <div class="section-head">
        <h3>Featured Posts</h3>
      </div>
      <div class="slider" :class="{ single: visiblePosts.length === 1 }">
        <div
          v-for="(item, idx) in visiblePosts"
          :key="item.title + idx"
          class="post-card"
          :class="{ large: idx === 1 && visiblePosts.length > 1, small: idx !== 1 || visiblePosts.length <= 1 }"
          role="button"
          tabindex="0"
          @click="goToPost(item)"
          @keyup.enter="goToPost(item)"
        >
          <div class="img-wrap">
            <div v-if="item.locked" class="lock-wrap">
              <i class="pi pi-lock"></i>
            </div>
            <img v-else :src="item.image" :alt="item.title" />
            <div class="pill plan-pill">{{ pillLabel(item) }}</div>
            <div v-if="featuredPosts.length > 1 && idx === 0" class="inline-controls">
              <button @click="prevSlide" aria-label="Previous posts">
                <i class="pi pi-chevron-left"></i>
              </button>
              <button @click="nextSlide" aria-label="Next posts">
                <i class="pi pi-chevron-right"></i>
              </button>
            </div>
          </div>
          <h4>{{ item.title }}</h4>
        </div>
      </div>
    </section>

    <section class="regular">
      <div class="section-head">
        <h3>Check Out All My Posts Here</h3>
      </div>
      <div class="regular-grid">
        <div
          v-for="item in regularVisible"
          :key="`regular-${item.id}`"
          class="regular-card"
          role="button"
          tabindex="0"
          @click="goToPost(item)"
          @keyup.enter="goToPost(item)"
        >
          <div class="regular-img">
            <div v-if="item.locked" class="lock-wrap">
              <i class="pi pi-lock"></i>
            </div>
            <img v-else :src="item.image" :alt="item.title" />
            <div class="pill plan-pill">{{ pillLabel(item) }}</div>
          </div>
          <div class="regular-body">
            <h4>{{ item.title }}</h4>
            <p class="muted price">{{ priceLabel(item) }}</p>
            <p class="muted added">{{ addedLabel(item) }}</p>
          </div>
        </div>
      </div>
      <div class="load-more" v-if="regularHasMore">
        <button class="load-btn" @click="loadMoreRegular">Load More</button>
      </div>
    </section>

    <div v-if="planModal.open" class="modal-backdrop" @click.self="closePlanModal">
      <div class="modal">
        <div class="modal-head">
          <div>
            <h4>Please Login / Register</h4>
            <p class="muted">To unlock the content</p>
          </div>
          <div class="head-actions">
            <router-link class="arrow-btn" to="/login" aria-label="Go to login">
              <i class="pi pi-arrow-right"></i>
            </router-link>
            <button class="close-btn" @click="closePlanModal" aria-label="Close">
              <i class="pi pi-times"></i>
            </button>
          </div>
        </div>

        <div class="plan-list">
          <div v-if="planModal.loading" class="muted">Loading plans...</div>
          <div v-else-if="planModal.error" class="status error">{{ planModal.error }}</div>
          <template v-else>
            <div
              v-for="plan in planModal.plans.slice(0, 2)"
              :key="plan.id"
              class="plan-card"
            >
              <div class="plan-thumb" v-if="plan.plan_thumbnail_url">
                <img :src="resolveMedia(plan.plan_thumbnail_url)" :alt="plan.name" />
              </div>
              <h5>{{ plan.name }}</h5>
              <p class="muted" v-if="plan.subtitle">{{ plan.subtitle }}</p>

              <div class="badge" v-if="plan.badge_thumbnail_url">
                <span class="badge-title">Subscription Badge</span>
                <img :src="resolveMedia(plan.badge_thumbnail_url)" :alt="`${plan.name} badge`" />
              </div>

              <ul class="features" v-if="Array.isArray(plan.features)">
                <li v-for="(feat, i) in plan.features" :key="feat + i">{{ feat }}</li>
              </ul>

              <label class="price-select">
                Pricing
                <select>
                  <option v-if="plan.monthly_price" :value="plan.monthly_price">
                    Monthly (1 Month) - {{ formatPrice(plan.monthly_price) }}
                  </option>
                  <option v-if="plan.quarterly_price" :value="plan.quarterly_price">
                    Quarterly (3 Months) - {{ formatPrice(plan.quarterly_price) }}
                  </option>
                  <option v-if="plan.half_yearly_price" :value="plan.half_yearly_price">
                    Half Yearly (6 Months) - {{ formatPrice(plan.half_yearly_price) }}
                  </option>
                  <option v-if="plan.yearly_price" :value="plan.yearly_price">
                    Yearly (12 Months) - {{ formatPrice(plan.yearly_price) }}
                  </option>
                </select>
              </label>

              <button class="primary w-full" @click="goToCheckout(plan)">Subscribe Now</button>
            </div>
          </template>
        </div>
        <div class="see-all">
          <a :href="`/profile/${route.params.username}/subscription-plans`" class="link">SEE ALL PLANS</a>
        </div>
      </div>
    </div>

    <div v-if="ppvModal.open" class="modal-backdrop" @click.self="ppvModal.open = false">
      <div class="modal">
        <div class="modal-head">
          <div>
            <h4>Unlock Post</h4>
            <p class="muted">{{ ppvModal.title || 'This post is PPV.' }}</p>
          </div>
          <div class="head-actions">
            <button class="close-btn" @click="ppvModal.open = false" aria-label="Close">
              <i class="pi pi-times"></i>
            </button>
          </div>
        </div>
        <div class="modal-actions">
          <button class="primary w-full" @click="goToCheckoutPost">Unlock this post</button>
          <button class="primary alt w-full" @click="goToSubscriptionPlans">Subscribe Now</button>
        </div>
      </div>
    </div>

    <div v-if="viewModal.open" class="view-backdrop" @click.self="viewModal.open = false">
      <div class="view-modal">
        <div class="view-media">
          <img :src="viewModal.image" :alt="viewModal.title" />
        </div>
        <div class="view-body">
          <h3>{{ viewModal.title }}</h3>
          <p class="muted">{{ viewModal.description }}</p>
          <p class="muted small" v-if="viewModal.created_at">Added {{ new Date(viewModal.created_at).toLocaleString() }}</p>
          <button class="close-btn" @click="viewModal.open = false" aria-label="Close">
            <i class="pi pi-times"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api, { API_BASE_URL } from '../../services/api'
import CreatorHeader from '../../components/creator/CreatorHeader.vue'
import CreatorNav from '../../components/creator/CreatorNav.vue'
import SubscriberHeader from '../../components/subscriber/SubscriberHeader.vue'
import { useAuthStore } from '../../stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const loading = ref(true)
const isMobile = ref(false)
const profile = reactive({
  name: '',
  full_name: '',
  tagline: '',
  avatar_url: '',
  socials: [],
})

const featuredPosts = ref([])
const regularPosts = ref([])
const regularPage = ref(1)
const regularPerPage = 20
const regularVisible = computed(() => regularPosts.value.slice(0, regularPage.value * regularPerPage))
const regularHasMore = computed(() => regularPosts.value.length > regularVisible.value.length)
const ppvModal = reactive({
  open: false,
  slug: '',
  title: '',
  price: null,
})
const viewModal = reactive({
  open: false,
  title: '',
  description: '',
  image: '',
  created_at: '',
})
const startIndex = ref(0)
const visiblePosts = computed(() => {
  if (!featuredPosts.value.length) return []
  const showCount = isMobile.value ? 1 : Math.min(5, featuredPosts.value.length)
  const items = []
  for (let i = 0; i < showCount; i++) {
    items.push(featuredPosts.value[(startIndex.value + i) % featuredPosts.value.length])
  }
  return items
})

const defaultAvatar =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180" viewBox="0 0 100 100"><rect width="100" height="100" rx="18" fill="%23f3f4f6"/><circle cx="50" cy="38" r="18" fill="%239ca3af"/><path d="M20 86c4-16 24-20 30-20s26 4 30 20H20z" fill="%239ca3af"/></svg>'

const currentUser = ref(null)
const userRole = ref('guest') // guest | creator | subscriber
const userRoleClass = computed(() => {
  if (userRole.value === 'creator') return 'creator-view'
  if (userRole.value === 'subscriber') return 'subscriber-view'
  return ''
})

const planModal = reactive({
  open: false,
  loading: false,
  error: '',
  plans: [],
})

const fetchProfile = async () => {
  try {
    const username = route.params.username
    const { data } = await api.get(`/public/profile/${username}`)
    const payload = data?.data || {}
    Object.assign(profile, payload)
    if (profile.avatar_url && !profile.avatar_url.startsWith('http')) {
      const base = API_BASE_URL.replace(/\/api$/, '')
      profile.avatar_url = `${base}${profile.avatar_url.startsWith('/') ? '' : '/'}${profile.avatar_url}`
    }
    await loadCurrentUser()
    await fetchContent(username)
  } catch (e) {
    console.error('Failed to load profile', e)
  } finally {
    loading.value = false
  }
}

const fetchContent = async (username) => {
  try {
    const { data } = await api.get(`/public/content/${username}`)
    const list = data?.data || []
    const normalized = list.map((item) => ({
      id: item.id,
      title: item.title,
      slug: item.slug,
      image: resolveMedia(item.thumbnail_url || item.media_url),
      locked: item.locked ?? false,
      is_featured: !!item.is_featured,
      is_ppv: Boolean(item.is_ppv || item.ppv_price),
      ppv_price: item.ppv_price,
      subscription_tier: item.subscription_tier,
      description: item.description || '',
      created_at: item.created_at,
      media_url: resolveMedia(item.media_url),
    }))
    featuredPosts.value = normalized.filter((i) => i.is_featured)
    regularPosts.value = normalized.filter((i) => !i.is_featured)
  } catch (e) {
    console.error('Failed to load content', e)
  }
}

const onAvatarError = (e) => {
  e.target.src = defaultAvatar
}

const socialIcon = (platform = '') => {
  const name = platform.toLowerCase()
  if (name.includes('facebook')) return 'pi pi-facebook'
  if (name.includes('instagram')) return 'pi pi-instagram'
  if (name.includes('twitter') || name === 'x') return 'pi pi-twitter'
  if (name.includes('linkedin')) return 'pi pi-linkedin'
  if (name.includes('youtube')) return 'pi pi-youtube'
  return 'pi pi-external-link'
}

const resolveMedia = (url = '') => {
  if (!url) return ''
  const cleaned = url.toString().trim()
  if (cleaned.startsWith('http')) return cleaned
  const base = API_BASE_URL.replace(/\/api$/, '')
  return `${base}${cleaned.startsWith('/') ? '' : '/'}${cleaned}`
}

const prevSlide = () => {
  if (!featuredPosts.value.length) return
  startIndex.value = (startIndex.value - 1 + featuredPosts.value.length) % featuredPosts.value.length
}

const nextSlide = () => {
  if (!featuredPosts.value.length) return
  startIndex.value = (startIndex.value + 1) % featuredPosts.value.length
}

const loadMoreRegular = () => {
  regularPage.value += 1
}

const priceLabel = (item) => {
  if (item.is_ppv) return `$${formatPrice(item.ppv_price)}`
  if (item.subscription_tier) return formatPlan(item.subscription_tier)
  return 'Free'
}

const addedLabel = (item) => {
  if (!item.created_at) return ''
  const created = new Date(item.created_at)
  let expiry = ''
  if (item.ppv_expires_in_days) {
    const exp = new Date(created)
    exp.setDate(exp.getDate() + Number(item.ppv_expires_in_days))
    const now = new Date()
    expiry = now > exp ? 'Post Expired' : `Expiry in ${Math.ceil((exp - now) / (1000 * 60 * 60 * 24))} days`
  }
  return `Added ${created.toLocaleDateString()}${expiry ? ' ' + expiry : ''}`
}

const goToPost = (item) => {
  if (!item?.slug) return
  if (item.locked && userRole.value === 'guest') {
    if (item.is_ppv === true) {
      saveIntent({ type: 'ppv', creator: route.params.username, slug: item.slug, price: item.ppv_price })
    } else {
      saveIntent({ type: 'subscribe', creator: route.params.username })
    }
    router.push('/login')
    return
  }
  if (item.locked && item.is_ppv === true) {
    ppvModal.open = true
    ppvModal.slug = item.slug
    ppvModal.title = item.title
    ppvModal.price = item.ppv_price
    return
  }
  if (item.locked) {
    openPlanModal()
    return
  }
  openViewModal(item)
}

const openViewModal = (item) => {
  viewModal.open = true
  viewModal.title = item.title
  viewModal.description = item.description || ''
  viewModal.image = item.media_url || item.image
  viewModal.created_at = item.created_at
}

const detectMobile = () => {
  isMobile.value = window.innerWidth <= 900
}

const slugify = (name = '') => name.toString().trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
const formatPlan = (plan = '') => plan.toString().replace(/-/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase())
const formatPrice = (val) => {
  const num = Number(val || 0)
  return num.toFixed(2)
}
const saveIntent = (intent) => {
  try {
    localStorage.setItem('pending_intent', JSON.stringify(intent))
  } catch (e) {
    console.error('Failed to persist intent', e)
  }
}

const loadCurrentUser = async () => {
  const token = localStorage.getItem('auth_token')
  if (!token) {
    userRole.value = 'guest'
    currentUser.value = null
    return
  }
  try {
    const { data } = await api.get('/auth/profile')
    const u = data?.data || {}
    currentUser.value = u
    const roleNames = (u.roles || u.role_names || []).map((r) => (typeof r === 'string' ? r : r.name)).map((r) => r.toLowerCase())
    if (roleNames.includes('creator')) {
      userRole.value = 'creator'
    } else if (roleNames.includes('subscriber')) {
      userRole.value = 'subscriber'
    } else {
      userRole.value = 'guest'
    }
  } catch (err) {
    console.error('Failed to load current user', err)
    userRole.value = 'guest'
  }
}

const goCreatorAddPost = () => {
  if (!currentUser.value) return
  const slug = slugify(currentUser.value.name || 'creator')
  router.push({ name: 'CreatorCreatePost', params: { username: slug } }).catch(() => {})
}

const logout = async () => {
  await authStore.logout()
  try {
    delete api.defaults.headers.common.Authorization
  } catch {}
  router.push('/login')
}

const goSubscriberHome = () => {
  if (!currentUser.value) return
  const slug = slugify(currentUser.value.name || 'subscriber')
  router.push({ name: 'SubscriberDashboard', params: { username: slug } }).catch(() => {})
}

const goSubscriberSubs = () => {
  if (!currentUser.value) return
  const slug = slugify(currentUser.value.name || 'subscriber')
  router.push({ name: 'SubscriberSubscriptions', params: { username: slug } }).catch(() => {})
}

const goSubscriberFollowing = () => {
  if (!currentUser.value) return
  const slug = slugify(currentUser.value.name || 'subscriber')
  router.push({ name: 'SubscriberFollowing', params: { username: slug } }).catch(() => {})
}

const pillLabel = (item) => {
  if (item.is_ppv) {
    return item.ppv_price ? `$${formatPrice(item.ppv_price)}` : 'PPV'
  }
  if (item.subscription_tier) {
    return formatPlan(item.subscription_tier)
  }
  return 'Free'
}

const openPlanModal = async () => {
  planModal.open = true
  if (planModal.plans.length || planModal.loading) return
  planModal.loading = true
  planModal.error = ''
  const username = route.params.username
  const endpoints = [
    `/public/creator/${username}/plans`,
    `/public/subscriptions/${username}`,
  ]

  for (const path of endpoints) {
    try {
      const { data } = await api.get(path, { params: { limit: 2 } })
      const list = data?.data || []
      if (Array.isArray(list) && list.length) {
        planModal.plans = list.filter((p) => p.is_active !== false)
        break
      }
    } catch (e) {
      // try next endpoint
      planModal.error = 'Could not load plans.'
    }
  }

  planModal.loading = false
  if (planModal.plans.length) {
    planModal.error = ''
  }
}

const closePlanModal = () => {
  planModal.open = false
}

const goToCheckout = (plan) => {
  closePlanModal()
  if (userRole.value === 'guest') {
    saveIntent({ type: 'subscribe', creator: route.params.username })
    router.push('/login')
    return
  }
  router.push(`/checkout/${route.params.username}/${plan.slug}`)
}

const goToCheckoutPost = () => {
  if (!ppvModal.slug) return
  ppvModal.open = false
  if (userRole.value === 'guest') {
    saveIntent({ type: 'ppv', creator: route.params.username, slug: ppvModal.slug, price: ppvModal.price })
    router.push('/login')
    return
  }
  router.push({
    name: 'Checkout',
    params: { username: route.params.username, slug: ppvModal.slug },
    query: { type: 'ppv', price: ppvModal.price },
  }).catch(() => {})
}

const goToSubscriptionPlans = () => {
  ppvModal.open = false
  if (userRole.value === 'guest') {
    saveIntent({ type: 'subscribe', creator: route.params.username })
    router.push('/login')
    return
  }
  router.push({ name: 'PublicSubscriptionPlans', params: { username: route.params.username } }).catch(() => {})
}

onMounted(() => {
  detectMobile()
  window.addEventListener('resize', detectMobile)
  fetchProfile()
})

onUnmounted(() => {
  window.removeEventListener('resize', detectMobile)
})
</script>

<style scoped>
.public-profile {
  min-height: 100vh;
  display: flex;
  background: linear-gradient(180deg, #fce5dc 0%, #fff6f2 100%);
  position: relative;
  flex-direction: column;
  gap: 28px;
}

.public-profile.creator-view {
  padding: 24px;
}

.public-profile.subscriber-view,
.public-profile.guest-view,
.public-profile {
  padding: 0;
}

.card {
  background: #ffffff;
  border-radius: 22px;
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.15);
  max-width: 360px;
  width: 100%;
  padding: 22px 18px 18px;
  text-align: center;
  color: #2d1b16;
  border: 1px solid #f1d8cb;
  margin: 0 auto;
}

.blurred {
  filter: blur(2px);
  pointer-events: none;
}

.avatar-wrap {
  position: relative;
  border-radius: 18px;
  overflow: hidden;
  margin-bottom: 16px;
}

.avatar {
  width: 100%;
  height: 320px;
  object-fit: cover;
  border-radius: 18px;
  display: block;
}

.socials {
  position: absolute;
  bottom: 14px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 12px;
}

.social-img {
  display: inline-flex;
  width: 44px;
  height: 44px;
  border-radius: 14px;
  background: #fff;
  align-items: center;
  justify-content: center;
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.14);
  transition: transform 0.15s ease, box-shadow 0.15s ease, filter 0.15s ease;
}

.social-img:hover {
  transform: translateY(-2px);
  box-shadow: 0 16px 26px rgba(0, 0, 0, 0.18);
  filter: brightness(1.05);
}

.social-img img {
  width: 100%;
  border-radius: 5px;
}

.info h2 {
  margin: 0;
  font-size: 22px;
  font-weight: 800;
}

.tagline {
  margin: 6px 0 0;
  color: #d65a5a;
  font-weight: 700;
}

.featured {
  width: 100%;
  max-width: 1300px;
  margin: 0 auto;
}

.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.section-head h3 {
  margin: 0;
  font-size: 22px;
  font-weight: 800;
  color: #2d1b16;
}

.slider {
  display: flex;
  gap: 16px;
  justify-content: center;
  align-items: flex-end;
  flex-wrap: wrap;
}

.slider.single {
  justify-content: center;
}

.post-card {
  background: transparent;
  border-radius: 22px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
  width: calc((100% - 4 * 16px) / 5);
  min-width: 200px;
  max-width: 260px;
  cursor: pointer;
}

.post-card.large {
  width: calc((100% - 4 * 16px) / 5);
  max-width: 320px;
}

.post-card .img-wrap {
  position: relative;
  width: 100%;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 14px 28px rgba(0, 0, 0, 0.12);
}

.post-card img {
  width: 100%;
  height: 260px;
  object-fit: cover;
  border-radius: 20px;
  display: block;
}

.post-card.large img {
  height: 340px;
}

.lock-wrap {
  width: 100%;
  height: 260px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(245, 167, 168, 0.16), rgba(230, 236, 252, 0.5));
  border-radius: 20px;
  color: #2d1b16;
  font-size: 32px;
  box-shadow: inset 0 0 0 1px rgba(241, 216, 203, 0.6);
}

.post-card.large .lock-wrap {
  height: 340px;
}

.post-card h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 800;
  color: #2d1b16;
  text-align: center;
}

.plan-pill {
  position: absolute;
  right: 10px;
  bottom: 10px;
  background: rgba(255, 255, 255, 0.92);
  color: #4b2e2b;
  padding: 6px 10px;
  border-radius: 999px;
  font-weight: 700;
  border: 1px solid #f5d4c8;
  box-shadow: 0 4px 10px rgba(0,0,0,0.08);
}

.regular {
  padding-top: 60px;
  width: 100%;
  max-width: 1300px;
  margin: 0 auto;
}

.regular-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
}

@media (min-width: 1200px) {
  .regular-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

@media (min-width: 768px) and (max-width: 1199px) {
  .regular-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.regular-card {
  position: relative;
  background: linear-gradient(180deg, #fff7f2 0%, #fef0e8 100%);
  border-radius: 16px;
  box-shadow: 0 10px 22px rgba(0,0,0,0.08);
  overflow: hidden;
  border: 1px solid #f1d8cb;
  display: flex;
  flex-direction: column;
  cursor: pointer;
}

.regular-img {
  position: relative;
  width: 100%;
  height: 180px;
  overflow: hidden;
}

.regular-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.regular-body {
  padding: 12px 14px 14px;
}

.regular-body h4 {
  margin: 0 0 6px;
  font-size: 16px;
  font-weight: 800;
  color: #2d1b16;
}

.regular-body .price,
.regular-body .added {
  margin: 2px 0;
  font-size: 13px;
}

.load-more {
  margin: 14px 0 0;
  text-align: center;
}

.load-btn {
  padding: 10px 16px;
  border-radius: 12px;
  border: 1px solid #f5cbbb;
  background: #ffe8dd;
  color: #5a3b32;
  font-weight: 700;
  cursor: pointer;
}

.modal-actions {
  display: grid;
  gap: 12px;
}

.modal-actions .primary,
.modal-actions .ghost,
.modal-actions .primary.alt {
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
}

.modal-actions .primary:hover,
.modal-actions .ghost:hover,
.modal-actions .primary.alt:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 18px rgba(0,0,0,0.08);
}

.modal-actions .primary.alt {
  background: #fff7f2;
  color: #5a3b32;
  border: 1px solid #f5cbbb;
}

.view-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  z-index: 30;
}

.view-modal {
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 24px 60px rgba(0,0,0,0.2);
  display: grid;
  grid-template-columns: 70% 30%;
  max-width: 1100px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  position: relative;
}

.view-modal .view-body {
  overflow-y: auto;
}

.view-media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.view-body {
  padding: 18px;
  position: relative;
  background: linear-gradient(180deg, #fff8f4 0%, #ffece3 100%);
}

.view-body h3 {
  margin: 0 0 8px;
  color: #2d1b16;
}

.view-body p {
  margin: 4px 0;
}

.view-body .close-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  background: #fff;
  border: 1px solid #f1d8cb;
  color: #2d1b16;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 6px 14px rgba(0,0,0,0.1);
}

@media (max-width: 900px) {
  .view-modal {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 900px) {
  .post-card,
  .post-card.large {
    width: 100%;
    max-width: 360px;
  }

  .slider {
    flex-direction: column;
    align-items: center;
  }
}

.inline-controls {
  position: absolute;
  top: 12px;
  left: 12px;
  display: inline-flex;
  gap: 8px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 999px;
  padding: 6px 8px;
  box-shadow: 0 10px 18px rgba(0, 0, 0, 0.08);
  z-index: 2;
}

.inline-controls button {
  width: 30px;
  height: 30px;
  border-radius: 999px;
  border: 1px solid #f1d8cb;
  background: #fff;
  color: #2d1b16;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.inline-controls button:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 16px rgba(0, 0, 0, 0.12);
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  z-index: 20;
}

.modal {
  background: linear-gradient(135deg, #fff7f2, #ffe6e0);
  color: #2d1b16;
  border-radius: 18px;
  padding: 18px;
  max-width: 720px;
  width: 100%;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.18);
  border: 1px solid #f1d8cb;
}

.modal-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.modal-head h4 {
  margin: 0;
  font-size: 20px;
  font-weight: 800;
}

.modal-head .muted {
  margin: 4px 0 0;
}

.head-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.arrow-btn {
  background: #fff;
  border: 1px solid #f1d8cb;
  color: #2d1b16;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6px 14px rgba(0,0,0,0.08);
  text-decoration: none;
}

.close-btn {
  background: #fff;
  border: 1px solid #f1d8cb;
  color: #2d1b16;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 6px 14px rgba(0,0,0,0.08);
}

.plan-card {
  max-width: 300px;
  background: #fff;
  border: 1px solid #f1d8cb;
  border-radius: 14px;
  padding: 12px;
  display: grid;
  gap: 8px;
  margin-bottom: 12px;
  box-shadow: 0 12px 20px rgba(0,0,0,0.06);
}

.plan-card h5 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  text-align: center;
}

.plan-thumb img,
.badge img {
  border-radius: 10px;
}

.plan-thumb {
  display: flex;
  justify-content: center;
}

.plan-thumb img {
  max-height: 300px;
}

.badge img {
  max-height: 40px;
}

.badge-title {
  display: block;
  font-size: 12px;
  color: #8a6a5c;
  margin-bottom: 4px;
  font-weight: 700;
}

.features {
  list-style: none;
  padding: 0;
  margin: 0;
  color: #5a4035;
  font-size: 16px;
  font-weight: 600;
  border: dashed 1px #5a4035;
  padding: 5px 10px;
  border-radius: 5px;
}

.features li + li {
  margin-top: 2px;
}

.price-select select {
  width: 100%;
  background: #fff;
  color: #2d1b16;
  border: 1px solid #f1d8cb;
  border-radius: 10px;
  padding: 8px 10px;
  margin-bottom: 5px;
}

.primary.w-full {
  width: 100%;
  border: none;
  background: linear-gradient(135deg, #f5a7a8, #f7c8b4);
  color: #2d1b16;
  padding: 10px 12px;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 800;
}

.plan-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(260px, 1fr));
  gap: 12px;
  align-items: start;
}

.plan-list .status {
  grid-column: 1 / -1;
}

@media (max-width: 900px) {
  .plan-list {
    grid-template-columns: 1fr;
  }
}

.see-all {
  text-align: center;
  margin-top: 8px;
  border-top: 1px dashed #f5aba9;
  padding-top: 5px;
}

.link {
  color: #b25b4b;
  text-decoration: none;
  font-weight: 700;
}

.status.error {
  color: #b3261e;
}

.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.22);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  backdrop-filter: blur(2px);
}

.spinner {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: 5px solid rgba(255, 255, 255, 0.4);
  border-top-color: #f5a7a8;
  animation: spin 0.9s linear infinite;
}

.lock-wrap .pi-lock {
  font-size: 80px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
