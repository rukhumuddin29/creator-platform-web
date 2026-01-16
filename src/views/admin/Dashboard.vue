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
              <div class="space-y-2">
                <p class="text-sm text-gray-300">
                  Katalyst Workspace
                  <Tag value="Dev" severity="warning" class="ml-2" />
                </p>
                <h2 class="text-3xl font-semibold">Welcome back, Admin!</h2>
                <div class="flex items-center gap-3 text-sm text-gray-200">
                  <span class="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full">
                    <i class="pi pi-users text-blue-200"></i>
                    <span>156 Creators</span>
                  </span>
                  <span class="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full">
                    <i class="pi pi-sitemap text-purple-200"></i>
                    <span>12 Subscribers</span>
                  </span>
                </div>
              </div>
            </div>
            <Button label="Retake tour" icon="pi pi-refresh" class="p-button-outlined p-button-sm" />
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
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold">Getting Started</h3>
              <span class="text-sm text-gray-400">2 of 5 completed</span>
            </div>
            <div class="h-2 rounded-full bg-white/5 overflow-hidden">
              <div class="h-full w-2/5 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
            </div>
            <div class="space-y-4">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                  <i class="pi pi-users text-blue-300"></i>
                </div>
                <div>
                  <p class="text-sm font-semibold">Invite users</p>
                  <p class="text-xs text-gray-400">Add team members to your workspace</p>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                  <i class="pi pi-cog text-emerald-300"></i>
                </div>
                <div>
                  <p class="text-sm font-semibold">Configure settings</p>
                  <p class="text-xs text-gray-400">Set up workspace defaults and preferences</p>
                </div>
              </div>
              <Button label="Go to" class="p-button-outlined p-button-sm" />
            </div>
          </div>

          <div class="bg-[#0f1625] sec-padding border border-white/5 rounded-2xl p-5 space-y-4 shadow-[0_12px_30px_rgba(0,0,0,0.35)]">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold">Recent Activity</h3>
              <Button label="View all" icon="pi pi-angle-right" iconPos="right" class="p-button-text p-button-sm text-gray-300" />
            </div>
            <div class="space-y-4">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                  <i class="pi pi-user-plus text-indigo-300"></i>
                </div>
                <div class="flex-1">
                  <p class="text-sm"><span class="font-semibold">Sarah Miller</span> invited <span class="font-semibold">Alex Johnson</span></p>
                  <p class="text-xs text-gray-400">15m ago</p>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                  <i class="pi pi-bolt text-emerald-300"></i>
                </div>
                <div class="flex-1">
                  <p class="text-sm"><span class="font-semibold">System</span> health check passed</p>
                  <p class="text-xs text-gray-400">1h ago</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import AdminSidebar from '../../components/admin/AdminSidebar.vue'
import AdminHeader from '../../components/admin/AdminHeader.vue'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import './admin-dashboard.css'

const router = useRouter()
const authStore = useAuthStore()
const isSidebarCollapsed = ref(false)
const stats = [
  { icon: 'pi-users', title: 'Total Users', value: '156', trend: '+12', iconBg: 'bg-blue-900/40 text-blue-200' },
  { icon: 'pi-user-plus', title: 'Active Users', value: '142', trend: '+8', iconBg: 'bg-emerald-900/40 text-emerald-200' },
  { icon: 'pi-envelope', title: 'Pending Invitations', value: '8', trend: '-3', iconBg: 'bg-amber-900/40 text-amber-200' },
  { icon: 'pi-sitemap', title: 'Active Subscribers', value: '12', trend: '+2', iconBg: 'bg-indigo-900/40 text-indigo-200' },
]

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
</script>
