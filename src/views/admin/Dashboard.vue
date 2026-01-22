<template>
  <div class="min-h-screen flex bg-[#080d16] text-white admin-shell">
    <AdminSidebar :collapsed="isSidebarCollapsed" @toggle="isSidebarCollapsed = !isSidebarCollapsed" />

    <div class="flex-1 flex flex-col overflow-hidden">
      <AdminHeader @notify="handleNotify" @profile="handleProfile" @logout="handleLogout" />

      <main class="p-4 md:p-6 space-y-6 overflow-y-auto admin-dashboard-main">
        <section class="bg-gradient-to-r from-[#1a2235] via-[#1d2640] to-[#1f2d4b] rounded-3xl border border-white/5 px-6 md:px-8 py-8 md:py-10 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
          <div class="flex flex-wrap items-center justify-between gap-6 sec-padding">
            <div class="flex items-center gap-4">
              <div class="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center border border-white/10 shadow-inner shadow-black/30">
                <i class="pi pi-user text-2xl text-white"></i>
              </div>
              <div class="space-y-2 main-hero-area">
                <p class="text-sm text-gray-300">
                  Creator Hub Workspace
                  <Tag value="Dev" severity="warning" class="ml-2" />
                </p>
                <h2 class="text-3xl font-semibold">Welcome back, Admin!</h2>
                <div class="flex items-center gap-3 text-sm text-gray-200">
                  <span class="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full hero-pill">
                    <i class="pi pi-users text-blue-200"></i>
                    <span>{{ heroCounts.creators }} Creators</span>
                  </span>
                  <span class="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full hero-pill">
                    <i class="pi pi-sitemap text-purple-200"></i>
                    <span>{{ heroCounts.subscribers }} Subscribers</span>
                  </span>
                </div>
              </div>
            </div>
            <Button label="Refresh" icon="pi pi-refresh" class="p-button-outlined p-button-sm" />
          </div>
        </section>

        <section class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <div
            v-for="stat in stats"
            :key="stat.title"
            class="bg-[#0f1625] sec-padding border border-white/5 rounded-2xl p-4 flex items-center justify-between shadow-[0_12px_30px_rgba(0,0,0,0.35)]"
          >
            <div class="flex items-center gap-3">
              <div :class="['w-12 h-12 rounded-2xl flex items-center justify-center', stat.iconBg]">
                <i :class="['pi', stat.icon, 'text-xl']"></i>
              </div>
              <div>
                <p class="text-sm text-gray-400">{{ stat.title }}</p>
                <p class="text-2xl font-bold text-white">{{ stat.value }}</p>
              </div>
            </div>
            <div
              class="px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1"
              :class="stat.trend.includes('-') ? 'bg-rose-900/50 text-rose-200' : 'bg-emerald-900/50 text-emerald-200'"
            >
              <i :class="stat.trend.includes('-') ? 'pi pi-arrow-down-left' : 'pi pi-arrow-up-right'"></i>
              <span>{{ stat.trend }}</span>
            </div>
          </div>
        </section>

        <section class="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <div class="bg-[#0f1625] sec-padding border border-white/5 rounded-2xl p-5 space-y-4 shadow-[0_12px_30px_rgba(0,0,0,0.35)]">
            <div class="flex items-center justify-between mb-2">
              <h3 class="text-lg font-semibold">Recent Creators</h3>
              <span class="text-sm text-gray-400">Latest 10</span>
            </div>
            <table class="w-full text-sm text-gray-200 table-auto">
              <thead class="text-gray-400 text-xs uppercase tracking-wide">
                <tr class="border-b border-white/5">
                  <th class="py-2 text-left">Name</th>
                  <th class="py-2 text-left">Email</th>
                  <th class="py-2 text-left">No. Posts</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="creator in recentCreators" :key="creator.id" class="border-b border-white/5 last:border-b-0">
                  <td class="py-2 flex items-center gap-3">
                    <img :src="creator.avatar" class="w-10 h-10 rounded-full object-cover table-avatar" alt="creator" />
                    <span class="font-semibold text-white">{{ creator.name }}</span>
                  </td>
                  <td class="py-2 text-gray-300">{{ creator.email }}</td>
                  <td class="py-2 text-gray-300">{{ creator.posts ?? 0 }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="bg-[#0f1625] sec-padding border border-white/5 rounded-2xl p-5 space-y-4 shadow-[0_12px_30px_rgba(0,0,0,0.35)]">
            <div class="flex items-center justify-between mb-2">
              <h3 class="text-lg font-semibold">Recent Subscribers</h3>
              <span class="text-sm text-gray-400">Latest 10</span>
            </div>
            <table class="w-full text-sm text-gray-200 table-auto">
              <thead class="text-gray-400 text-xs uppercase tracking-wide">
                <tr class="border-b border-white/5">
                  <th class="py-2 text-left">Name</th>
                  <th class="py-2 text-left">Email</th>
                  <th class="py-2 text-left">Subscriptions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="sub in recentSubscribers" :key="sub.id" class="border-b border-white/5 last:border-b-0">
                  <td class="py-2 flex items-center gap-3">
                    <img :src="sub.avatar" class="w-10 h-10 rounded-full object-cover table-avatar" alt="subscriber" />
                    <span class="font-semibold text-white">{{ sub.name }}</span>
                  </td>
                  <td class="py-2 text-gray-300">{{ sub.email }}</td>
                  <td class="py-2 text-gray-300">{{ sub.subscriptions ?? 0 }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import AdminSidebar from '../../components/admin/AdminSidebar.vue'
import AdminHeader from '../../components/admin/AdminHeader.vue'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import './admin-dashboard.css'
import api from '../../services/api'

const router = useRouter()
const authStore = useAuthStore()
const isSidebarCollapsed = ref(false)
const stats = ref([
  { key: 'users', icon: 'pi-users', title: 'Total Users', value: '0', trend: '', iconBg: 'bg-blue-900/40 text-blue-200' },
  { key: 'posts', icon: 'pi-file', title: 'Total Posts', value: '0', trend: '', iconBg: 'bg-emerald-900/40 text-emerald-200' },
  { key: 'revenue', icon: 'pi-dollar', title: 'Total Revenue', value: '0', trend: '', iconBg: 'bg-amber-900/40 text-amber-200' },
  { key: 'active_subscribers', icon: 'pi-sitemap', title: 'Active Subscribers', value: '0', trend: '', iconBg: 'bg-indigo-900/40 text-indigo-200' },
])

const heroCounts = ref({ creators: 0, subscribers: 0 })
const recentCreators = ref([])
const recentSubscribers = ref([])

const handleLogout = async () => {
  await authStore.logout()
  const loginPath = authStore.getLoginPath ? authStore.getLoginPath() : '/login'
  router.push(loginPath)
}

const handleNotify = () => {
  // placeholder for future notifications action
}

const handleProfile = () => {
  router.push('/admin/dashboard')
}

const formatTrend = (delta) => {
  if (!delta) return ''
  const sign = delta > 0 ? '+' : ''
  return `${sign}${delta}`
}

const loadStats = async () => {
  try {
    const { data } = await api.get('/admin/dashboard/stats')
    const payload = data?.data || {}

    heroCounts.value = {
      creators: payload.creators?.total ?? 0,
      subscribers: payload.subscribers?.total ?? 0,
    }

    const map = {
      users: payload.users,
      posts: payload.posts,
      revenue: payload.revenue,
      active_subscribers: payload.active_subscribers,
    }

    recentCreators.value = (payload.recent_creators || []).map((c) => ({
      id: c.id,
      name: c.name,
      email: c.email,
      avatar: c.avatar_url,
    }))

    recentSubscribers.value = (payload.recent_subscribers || []).map((s) => ({
      id: s.id,
      name: s.name,
      email: s.email,
      avatar: s.avatar_url,
    }))

    stats.value = stats.value.map((item) => {
      const src = map[item.key] || { total: 0, delta: 0 }
      return {
        ...item,
        value: item.key === 'revenue' ? `$${Number(src.total).toFixed(2)}` : src.total ?? 0,
        trend: formatTrend(src.delta ?? 0),
      }
    })
  } catch (err) {
    console.error('Failed to load admin stats', err)
  }
}

onMounted(() => {
  loadStats()
})
</script>
