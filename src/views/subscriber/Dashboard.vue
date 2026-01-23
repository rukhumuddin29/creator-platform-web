<template>
  <div class="subscriber-page">
    <SubscriberHeader
      :name="displayName"
      :avatar="headerAvatar"
      @logout="handleLogout"
      @home="goHome"
      @search="onSearch"
      @profile="goProfile"
      @subscriptions="goSubscriptions"
      @following="goFollowing"
    />

    <div class="dashboard-layout">
      <div class="content">
        <h2 class="welcome">Welcome back, {{ displayName }}!</h2>
        <p class="muted">Your personalized subscriber dashboard.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import SubscriberHeader from '../../components/subscriber/SubscriberHeader.vue'
import { useAuthStore } from '../../stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const username = computed(() => route.params.username || '')

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

const onSearch = (term) => {
  // placeholder search action
}

const goProfile = () => router.push(`/subscriber/${username.value}/my-account`)
const goSubscriptions = () => router.push(`/subscriber/${username.value}/subscriptions`)
const goFollowing = () => router.push(`/subscriber/${username.value}/following`)
const goHome = () => router.push(`/subscriber/${username.value}`)
</script>

<style scoped>
.dashboard-layout {
  padding: 18px 22px 28px;
}

.subscriber-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #fce5dc 0%, #ffffff 40%);
  color: #55423d;
  font-family: 'Trebuchet MS', 'Lucida Sans Unicode', 'Lucida Grande', 'Lucida Sans', Arial, sans-serif;
}

.content {
  margin-top: 16px;
  background: #fff;
  border-radius: 14px;
  padding: 16px 18px;
  border: 1px solid #f1d8cb;
}

.welcome {
  margin: 0;
  font-size: 22px;
}

.muted {
  color: #8a6457;
  margin: 4px 0 0;
}
</style>
