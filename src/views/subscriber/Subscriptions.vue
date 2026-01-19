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

    <div class="content">
      <h2>My Subscriptions</h2>
      <p class="muted">Coming soon.</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import SubscriberHeader from '../../components/subscriber/SubscriberHeader.vue'

const router = useRouter()
const route = useRoute()

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

const handleLogout = () => {
  localStorage.removeItem('auth_token')
  localStorage.removeItem('user')
  router.push('/login')
}

const goHome = () => router.push(`/subscriber/${route.params.username}`)
const goProfile = () => router.push(`/subscriber/${route.params.username}/my-account`)
const goFollowing = () => router.push(`/subscriber/${route.params.username}/following`)
</script>

<style scoped>
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

.muted {
  color: #8a6457;
  margin: 4px 0 0;
}
</style>
