<template>
  <div class="admin-shell bg-[#080d16] text-white min-h-screen flex">
    <AdminSidebar :collapsed="collapsed" @toggle="collapsed = !collapsed" />
    <div class="flex-1 flex flex-col overflow-hidden">
      <AdminHeader @logout="handleLogout" @notify="noop" @profile="noop" />

      <main class="p-4 md:p-6 space-y-4 admin-dashboard-main overflow-y-auto">
        <div class="card header-card flex items-center justify-between">
          <div>
            <p class="text-xs uppercase tracking-[0.08em] text-gray-400">User details</p>
            <h2 class="text-2xl font-semibold">{{ user.name || 'User' }}</h2>
            <p class="text-gray-400 text-sm">{{ user.email }}</p>
          </div>
          <Tag v-if="user.role" :value="user.role" severity="info" />
        </div>

        <div class="card admin-table space-y-3">
          <h3 class="text-lg font-semibold head-block">Profile Information</h3>
          <div class="grid md:grid-cols-2 gap-3 text-sm">
            <div><span class="label">Name:</span> <span>{{ user.name || '—' }}</span></div>
            <div><span class="label">Email:</span> <span>{{ user.email || '—' }}</span></div>
            <div><span class="label">Role:</span> <span>{{ user.role || '—' }}</span></div>
            <div><span class="label">Status:</span> <span>{{ user.status ? 'Active' : 'Inactive' }}</span></div>
            <div><span class="label">Contact:</span> <span>{{ info.contact_number || '—' }}</span></div>
            <div><span class="label">Alt Contact:</span> <span>{{ info.alt_contact_number || '—' }}</span></div>
            <div><span class="label">Alt Email:</span> <span>{{ info.alt_email || '—' }}</span></div>
            <div class="md:col-span-2"><span class="label">Address:</span> <span>{{ info.address || '—' }}</span></div>
            <div class="md:col-span-2"><span class="label">Tagline:</span> <span>{{ info.tagline || '—' }}</span></div>
            <div class="md:col-span-2"><span class="label">Bio:</span> <span>{{ info.bio || '—' }}</span></div>
          </div>
        </div>

        <div v-if="payout" class="card admin-table space-y-3">
          <h3 class="text-lg font-semibold head-block">Payout Details (Creator)</h3>
          <div class="grid md:grid-cols-2 gap-3 text-sm">
            <div><span class="label">Name:</span> <span>{{ payout.first_name }} {{ payout.last_name }}</span></div>
            <div><span class="label">Email:</span> <span>{{ payout.email }}</span></div>
            <div class="md:col-span-2"><span class="label">Address:</span> <span>{{ payout.address }}</span></div>
            <div><span class="label">PAN:</span> <span>{{ payout.pan_number }}</span></div>
            <div><span class="label">Govt ID:</span> <span>{{ payout.govt_id_type }}</span></div>
            <div v-if="payout.govt_id_url" class="md:col-span-2">
              <span class="label">Govt ID Image:</span>
              <a :href="payout.govt_id_url" target="_blank" class="text-blue-300 underline ml-2">View</a>
            </div>
            <div><span class="label">Payment Mode:</span> <span>{{ payout.payment_mode }}</span></div>
            <template v-if="payout.payment_mode === 'bank'">
              <div><span class="label">Account #:</span> <span>{{ payout.account_number }}</span></div>
              <div><span class="label">Bank Name:</span> <span>{{ payout.bank_name }}</span></div>
              <div><span class="label">IFSC:</span> <span>{{ payout.ifsc }}</span></div>
            </template>
            <div v-else><span class="label">UPI ID:</span> <span>{{ payout.upi_id }}</span></div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AdminSidebar from '../../components/admin/AdminSidebar.vue'
import AdminHeader from '../../components/admin/AdminHeader.vue'
import Tag from 'primevue/tag'
import api, { API_BASE_URL } from '../../services/api'
import './admin-dashboard.css'

const collapsed = ref(false)
const user = reactive({ name: '', email: '', role: '', status: false })
const info = reactive({
  contact_number: '',
  alt_contact_number: '',
  alt_email: '',
  address: '',
  tagline: '',
  bio: '',
})
const payout = ref(null)

const route = useRoute()
const router = useRouter()

const resolveMedia = (url) => {
  if (!url) return ''
  if (url.startsWith('http')) return url
  const base = API_BASE_URL.replace(/\/api$/, '')
  return `${base}${url}`
}

const loadUser = async () => {
  const { id } = route.params
  try {
    const { data } = await api.get(`/admin/users/${id}`)
    const payload = data?.data || data || {}
    user.name = payload.name || ''
    user.email = payload.email || ''
    user.role = payload.role || ''
    user.status = payload.status
    Object.assign(info, payload.information || {})
    if (payload.role === 'creator' && payload.payout) {
      payout.value = {
        ...payload.payout,
        govt_id_url: payload.payout.govt_id_url ? resolveMedia(payload.payout.govt_id_url) : '',
      }
    } else {
      payout.value = null
    }
  } catch (e) {
    router.push('/admin/users')
  }
}

const handleLogout = async () => {
  await router.push('/secret-admin-login')
}

const noop = () => {}

onMounted(() => {
  loadUser()
})
</script>

<style scoped>
.label {
  font-weight: 700;
  color: #cbd5e1;
  margin-right: 6px;
}
.head-block {
  margin-bottom: 10px;
  border-bottom: 1px solid #272b34;
  padding-bottom: 8px;
}
</style>
