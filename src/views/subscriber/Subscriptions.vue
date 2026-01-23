<template>
  <div class="subscriber-page">
    <SubscriberHeader
      :name="displayName"
      :avatar="headerAvatar"
      @logout="handleLogout"
      @home="goHome"
      @profile="goProfile"
      @subscriptions="() => {}"
      @following="goFollowing"
    />
    <div class="dashboard-layout">
      <div class="content">
        <h2>My Subscriptions</h2>
        <p class="muted">All active plans you’re subscribed to.</p>

        <div v-if="status.message" class="status" :class="status.type">{{ status.message }}</div>

        <div class="subs-grid" v-if="subscriptions.length">
          <div v-for="item in subscriptions" :key="item.id" class="sub-card">
            <div class="thumb" v-if="item.subscription?.plan_thumbnail_url">
              <img :src="resolveMedia(item.subscription.plan_thumbnail_url)" :alt="item.subscription.name">
            </div>
            <h3>{{ item.subscription?.name }}</h3>
            <p class="muted">Status: {{ item.status }}</p>
            <div class="creator" v-if="item.creator">
              <span>Creator:</span>
              <a :href="item.creator.profile_url" class="link">{{ item.creator.name }}</a>
            </div>
            <p class="muted small" v-if="item.next_billing_date">Next billing: {{ formatDate(item.next_billing_date) }}</p>
          </div>
        </div>

        <div v-else class="muted">You have no active subscriptions yet.</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { subscriptionService } from '../../services'
import SubscriberHeader from '../../components/subscriber/SubscriberHeader.vue'
import { useAuthStore } from '../../stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const displayName = computed(() => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    return user?.name || 'Subscriber'
  } catch {
    return 'Subscriber'
  }
})

const headerAvatar = computed(() => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    return user?.avatar_url || ''
  } catch {
    return ''
  }
})

const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}

const goHome = () => router.push(`/subscriber/${route.params.username}`)
const goProfile = () => router.push(`/subscriber/${route.params.username}/my-account`)
const goFollowing = () => router.push(`/subscriber/${route.params.username}/following`)

const subscriptions = ref([])
const status = ref({ message: '', type: 'success' })

const resolveMedia = (url = '') => {
  if (!url) return ''
  if (url.startsWith('http')) return url
  const base = import.meta.env.VITE_BACKEND_URL?.replace(/\/api$/, '') || ''
  return `${base}${url.startsWith('/') ? '' : '/'}${url}`
}

const formatDate = (val) => new Date(val).toLocaleDateString()

const loadSubs = async () => {
  status.value = { message: '', type: 'success' }
  try {
    const { data } = await subscriptionService.getMine()
    subscriptions.value = data?.data || data || []
  } catch (e) {
    status.value = { message: 'Could not load subscriptions.', type: 'error' }
  }
}

onMounted(loadSubs)
</script>

<style scoped>
.subscriber-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #fce5dc 0%, #ffffff 40%);
  color: #55423d;
  font-family: 'Trebuchet MS', 'Lucida Sans Unicode', 'Lucida Grande', 'Lucida Sans', Arial, sans-serif;
}

.dashboard-layout {
  padding: 18px 22px 28px;
}

.content {
  margin-top: 16px;
  background: #fff;
  border-radius: 14px;
  padding: 16px 18px;
  border: 1px solid #f1d8cb;
}

.muted {
  color: #8a6457;
  margin: 4px 0 0;
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

.subs-grid {
  margin-top: 12px;
  display: grid;
  grid-template-columns: repeat(4, minmax(220px, 1fr));
  gap: 12px;
  justify-items: center;
}

.sub-card {
  border: 1px solid #f1d8cb;
  border-radius: 12px;
  padding: 12px;
  box-shadow: 0 8px 18px rgba(0,0,0,0.06);
}

.thumb img {
  width: 100%;
  border-radius: 10px;
  object-fit: cover;
}

.creator {
  margin-top: 6px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.link {
  color: #b25b4b;
  text-decoration: none;
  font-weight: 700;
}

.small {
  font-size: 12px;
}
</style>
