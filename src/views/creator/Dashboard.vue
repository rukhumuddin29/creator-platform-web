<template>
  <div class="creator-page">
<CreatorHeader :name="displayName" :avatar="headerAvatar" @add="handleAddPost" />
    <CreatorNav :username="username" />

    <section class="stats">
      <div class="stat-card empty"></div>
      <div class="stat-card main">
        <div class="stat-row" v-for="stat in statEntries" :key="stat.label">
          <span class="stat-label">{{ stat.label.toUpperCase() }}</span>
          <span class="stat-value" :class="{ pulse: animate }">{{ stat.value }}</span>
        </div>
      </div>
      <div class="stat-card empty"></div>
    </section>

    <section class="content">
      <h2 class="section-title">Featured posts</h2>
      <div class="cards">
        <article class="card" v-for="post in posts" :key="post.title">
          <span class="badge">{{ post.category }}</span>
          <img :src="post.image" :alt="post.title">
          <div class="card-footer">
            <div class="author">
              <img class="avatar small" src="https://images.unsplash.com/photo-1506084868230-bb9d95c24759?auto=format&fit=crop&w=60&q=80" alt="">
              <span>{{ displayName }}, {{ post.date }}</span>
            </div>
          </div>
        </article>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import CreatorHeader from '../../components/creator/CreatorHeader.vue'
import CreatorNav from '../../components/creator/CreatorNav.vue'
import { contentService } from '../../services'
import api from '../../services/api'

const route = useRoute()
const router = useRouter()
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

const posts = [
  {
    title: 'Lifestyle',
    category: 'Lifestyle',
    image: 'https://images.unsplash.com/photo-1504198453319-5ce911bafcde?auto=format&fit=crop&w=800&q=80',
    date: 'September 16, 2022',
  },
  {
    title: 'Travel',
    category: 'Travel',
    image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80',
    date: 'September 15, 2022',
  },
  {
    title: 'Knitting',
    category: 'Knitting',
    image: 'https://images.unsplash.com/photo-1504198458649-3128b932f49b?auto=format&fit=crop&w=800&q=80',
    date: 'September 14, 2022',
  },
]

const handleAddPost = () => {
  router.push({ name: 'CreatorCreatePost', params: { username: username.value } })
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

const animate = ref(false)

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
    const { data } = await api.get('/auth/profile')
    const profile = data?.data || data
    internalState.value.subscribers = profile?.subscriber_count ?? 0
  } catch {
    internalState.value.subscribers = 0
  }

  internalState.value.follows = 0 // placeholder for future logic
  animate.value = true
  setTimeout(() => (animate.value = false), 1200)
}

onMounted(() => {
  loadStats()
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

.section-title {
  text-align: center;
  margin: 24px 0 16px;
  font-size: 26px;
}

.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
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
  height: 260px;
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
}

.author {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #6d4f43;
}

.stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(180px, 1fr));
  gap: 12px;
  margin: 12px 0 4px;
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
</style>
