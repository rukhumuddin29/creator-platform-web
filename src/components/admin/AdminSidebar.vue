<template>
  <aside
    :class="[
      'bg-[#0e131d] text-gray-200 border-r border-white/5 h-screen flex flex-col transition-all duration-300 rounded-tr-3xl overflow-hidden',
      collapsed ? 'w-18 is-collapsed' : 'w-72',
    ]"
  >
    <div class="flex items-center justify-between px-4 py-4 border-b border-white/5 sidebar-header-top">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-900/40">
          <i class="pi pi-bolt text-white text-lg"></i>
        </div>
        <span v-if="!collapsed" class="font-semibold text-white text-lg">Katalyst</span>
      </div>
      <button
        type="button"
        class="p-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-gray-300 transition collapse-button"
        @click="$emit('toggle')"
      >
        <i class="pi" :class="collapsed ? 'pi-chevron-right' : 'pi-chevron-left'"></i>
      </button>
    </div>

    <div class="flex-1 overflow-y-auto py-6 space-y-6 nav-menu-items">
      <div class="space-y-2" v-for="section in sections" :key="section.title">
        <p v-if="!collapsed" class="px-4 text-[11px] font-semibold text-gray-500 uppercase tracking-[0.08em] pb-2">
          {{ section.title }}
        </p>
        <div class="space-y-1">
          <RouterLink
            v-for="item in section.items"
            :key="item.label"
            :to="item.to"
            :class="[
              'w-full flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-xl transition menu-item',
              isActive(item.to) ? 'bg-white/10 text-white border border-white/10' : 'text-gray-300 hover:bg-white/5',
            ]"
          >
            <i :class="['pi', item.icon, 'text-base']"></i>
            <span v-if="!collapsed">{{ item.label }}</span>
          </RouterLink>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { useRoute } from 'vue-router'

defineProps({
  collapsed: {
    type: Boolean,
    default: false,
  },
})

const route = useRoute()

const sections = [
  {
    title: 'Dashboards',
    items: [
      { icon: 'pi-th-large', label: 'Dashboard', to: '/admin/dashboard' },
      { icon: 'pi-users', label: 'Users', to: '/admin/users' },
      { icon: 'pi-id-card', label: 'Subscriptions', to: '/admin/subscriptions' },
      { icon: 'pi-key', label: 'Roles & Permissions', to: '/admin/roles-permissions' },
      { icon: 'pi-star', label: 'Creator Roles', to: '/admin/creator-roles' },
      { icon: 'pi-at', label: 'Social Media Platforms', to: '/admin/social-platforms' },
    ],
  },
]

const isActive = (path) => route.path.startsWith(path)
</script>

<style scoped>
.sidebar-header-top {
  padding: 15px 10px;
}
.collapse-button {
  width: 32px;
  height: 32px;
}
.is-collapsed .collapse-button {
  position: absolute;
  left: 80px;
}
.nav-menu-items{
  padding: 15px;
}
</style>
