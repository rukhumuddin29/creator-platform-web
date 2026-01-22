<template>
  <div class="min-h-screen flex bg-[#080d16] text-white admin-shell">
    <AdminSidebar :collapsed="isSidebarCollapsed" @toggle="isSidebarCollapsed = !isSidebarCollapsed" />
    <div class="flex-1 flex flex-col overflow-hidden">
      <AdminHeader @logout="handleLogout" />
      <main class="p-4 md:p-6 space-y-6 overflow-y-auto admin-dashboard-main">
        <div class="bg-[#0f1625] sec-padding border border-white/5 rounded-2xl p-5 space-y-4 shadow-[0_12px_30px_rgba(0,0,0,0.35)]">
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-lg font-semibold">Subscriptions</h3>
            <span class="text-sm text-gray-400">Showing {{ rows.length }}</span>
          </div>
          <table class="w-full text-sm text-gray-200 table-auto">
            <thead class="text-gray-400 text-xs uppercase tracking-wide">
              <tr class="border-b border-white/5">
                <th class="py-2 text-left">Subscriber</th>
                <th class="py-2 text-left">Creator</th>
                <th class="py-2 text-left">Plan</th>
                <th class="py-2 text-left">Term</th>
                <th class="py-2 text-left">Subscription Date</th>
                <th class="py-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in rows" :key="row.id" class="border-b border-white/5 last:border-b-0">
                <td class="py-2 flex items-center gap-3">
                  <img :src="row.subscriber_avatar" class="w-10 h-10 rounded-full object-cover table-avatar" alt="subscriber" />
                  <div>
                    <p class="font-semibold text-white">{{ row.subscriber_name }}</p>
                    <p class="text-xs text-gray-400">{{ row.subscriber_email }}</p>
                  </div>
                </td>
                <td class="py-2">
                  <p class="font-semibold text-white">{{ row.creator_name }}</p>
                </td>
                <td class="py-2">
                  <p class="font-semibold text-white">{{ row.plan }}</p>
                  <p class="text-xs text-gray-400">{{ formatPrice(row.price) }}</p>
                </td>
                <td class="py-2 text-gray-300">{{ row.term }}</td>
                <td class="py-2 text-gray-300">{{ formatDate(row.subscribed_at) }}</td>
                <td class="py-2">
                  <span :class="['px-3 py-1 rounded-full text-xs font-semibold', row.status === 'active' ? 'bg-emerald-900/40 text-emerald-200' : 'bg-rose-900/40 text-rose-200']">
                    {{ row.status }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AdminSidebar from '../../components/admin/AdminSidebar.vue'
import AdminHeader from '../../components/admin/AdminHeader.vue'
import { useAuthStore } from '../../stores/auth'
import api from '../../services/api'
import './admin-dashboard.css'

const router = useRouter()
const authStore = useAuthStore()
const isSidebarCollapsed = ref(false)
const rows = ref([])

const formatPrice = (val) => {
  const num = Number(val || 0)
  return num ? `$${num.toFixed(2)}` : '$0.00'
}

const formatDate = (val) => {
  if (!val) return ''
  const d = new Date(val)
  return d.toLocaleDateString()
}

const loadData = async () => {
  try {
    const { data } = await api.get('/admin/subscriptions')
    rows.value = data?.data || []
  } catch (err) {
    console.error('Failed to load subscriptions', err)
  }
}

const handleLogout = async () => {
  await authStore.logout()
  const loginPath = authStore.getLoginPath ? authStore.getLoginPath() : '/login'
  router.push(loginPath)
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.table-auto th,
.table-auto td {
  padding-right: 10px;
}
</style>
