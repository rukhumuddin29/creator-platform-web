<template>
  <div class="min-h-screen bg-[#05080f] relative overflow-hidden flex items-center justify-center px-4">
    <div class="absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-b from-transparent via-[#0a1020] to-[#0b1630]" />
    <div class="absolute inset-0">
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(64,115,255,0.35),transparent_35%)]" />
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_30%_70%,rgba(13,27,74,0.35),transparent_40%)]" />
    </div>

    <div class="relative w-full max-w-md">
      <div class="login-card bg-[#0f1625]/90 border border-white/5 shadow-[0_20px_60px_rgba(0,0,0,0.45)] rounded-2xl p-8 backdrop-blur">
        <div class="text-center mb-8">
          <div class="mx-auto w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-900/50">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 7l9-4 9 4-9 4-9-4z" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 7v10l9 4 9-4V7" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 11v10" />
            </svg>
          </div>
          <h1 class="text-2xl font-semibold text-white mt-4">Welcome back</h1>
          <p class="text-sm text-gray-400 mt-2">Please login to continue to your account.</p>
        </div>

        <form @submit.prevent="handleLogin" class="space-y-6 form-container">
          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-300">Email</label>
            <div class="relative">
              <i class="pi pi-envelope text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"></i>
              <input
                v-model="email"
                type="email"
                required
                class="input-field pl-10"
                placeholder="admin@example.com"
              />
            </div>
          </div>

          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-300">Password</label>
            <div class="relative">
              <i class="pi pi-lock text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"></i>
              <input
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                required
                class="input-field pl-10 pr-11"
                placeholder="********"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 transition"
              >
                <svg v-if="showPassword" class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M2 2l20 20M10.6 10.6A2.5 2.5 0 0 0 12 14.5m2.4-.9a2.5 2.5 0 0 0-3-3" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 5c-4.5 0-8 4-8 7 0 1.3.6 2.6 1.6 3.7m3.1 2.2a9.4 9.4 0 0 0 3.3.6c4.5 0 8-4 8-7 0-1-.2-2-.7-3" />
                </svg>
                <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 5c-4.5 0-8 4-8 7s3.5 7 8 7 8-4 8-7-3.5-7-8-7z" />
                  <circle cx="12" cy="12" r="2.5" />
                </svg>
              </button>
            </div>
          </div>

          <div class="flex items-center gap-2 text-gray-300">
            <input id="remember" type="checkbox" class="h-4 w-4 rounded border-white/20 bg-[#0b1220] text-blue-500 focus:ring-blue-500/40" v-model="remember" />
            <label for="remember" class="text-sm select-none">Keep me logged in</label>
          </div>

          <button
            type="submit"
            :disabled="isLoading"
            class="w-full h-11 rounded-lg bg-[#3b82f6] hover:bg-[#1d4ed8] text-white font-semibold transition shadow-lg shadow-blue-900/50 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <span v-if="!isLoading">Sign in</span>
            <span v-else class="flex items-center gap-2">
              <svg class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z" />
              </svg>
              <span>Signing in...</span>
            </span>
          </button>

          <p v-if="errorMessage" class="text-sm text-red-400 text-center">{{ errorMessage }}</p>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const remember = ref(false)
const showPassword = ref(false)
const isLoading = ref(false)
const errorMessage = ref('')

const handleLogin = async () => {
  isLoading.value = true
  errorMessage.value = ''

  try {
    await authStore.login(email.value, password.value)
    router.push(authStore.getDashboardPath())
  } catch (error) {
    errorMessage.value = authStore.error || 'Login failed. Please try again.'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
@reference "../../index.css";

.input-field {
  @apply w-full h-11 rounded-lg bg-[#0b1220] border border-white/10 text-white placeholder:text-gray-500 pl-4 pr-4 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition;
}
.login-card {
  padding: 35px 30px;
  min-width: 500px;
}
.form-container {
  display: grid;
  gap: 20px;
}
.input-field{
  padding-left: 40px;
}
</style>
