<template>
  <div class="min-h-screen bg-gray-50">
    <nav class="bg-white shadow">
      <div class="mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <h1 class="text-2xl font-bold text-blue-600">Creator Hub</h1>
        <div class="flex items-center gap-4">
          <span class="text-gray-700">Welcome, {{ authStore.user?.name }}</span>
          <button
            @click="handleLogout"
            class="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>

    <div class="mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div v-if="authStore.isCreator" class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <router-link
          to="/subscriptions"
          class="bg-white p-6 rounded-lg shadow hover:shadow-lg transition cursor-pointer"
        >
          <h2 class="text-xl font-bold mb-2">Subscriptions</h2>
          <p class="text-gray-600">Manage your subscription tiers</p>
        </router-link>

        <router-link to="/content" class="bg-white p-6 rounded-lg shadow hover:shadow-lg transition cursor-pointer">
          <h2 class="text-xl font-bold mb-2">Content</h2>
          <p class="text-gray-600">Create and manage your content</p>
        </router-link>
      </div>

      <div class="bg-white p-6 rounded-lg shadow">
        <h2 class="text-2xl font-bold mb-4">Profile</h2>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="text-sm text-gray-600">Name</label>
            <p class="text-lg font-medium">{{ authStore.user?.name }}</p>
          </div>
          <div>
            <label class="text-sm text-gray-600">Email</label>
            <p class="text-lg font-medium">{{ authStore.user?.email }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const handleLogout = async () => {
  const target = authStore.getLoginPath()
  await authStore.logout()
  router.push(target)
}
</script>
