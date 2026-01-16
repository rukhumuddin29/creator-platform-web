<template>
  <nav class="header-nav relative z-50 bg-black/40 backdrop-blur-md border-b border-white/10">
    <div class="mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
      <!-- Logo and App Name (Left) -->
      <router-link to="/" class="flex items-center gap-2 group">
        <div class="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg group-hover:scale-110 transition-transform duration-300 shadow-lg">
          <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
          </svg>
        </div>
        <h1 class="text-xl font-bold bg-gradient-to-r from-purple-200 to-pink-200 bg-clip-text text-transparent group-hover:from-purple-100 group-hover:to-pink-100 transition-all">Creator Hub</h1>
      </router-link>

      <!-- Navigation Links (Right) -->
      <div class="flex items-center space-x-8 main-nav-links">
        <router-link to="/register" class="text-sm font-semibold text-white/80 hover:text-white transition-colors duration-300">
          SIGNUP
        </router-link>
        <router-link v-if="!authStore.isAuthenticated" to="/login" class="text-sm font-semibold text-white/80 hover:text-white transition-colors duration-300">
          LOGIN
        </router-link>
        <a href="#features" class="text-sm font-semibold text-white/80 hover:text-white transition-colors duration-300">
          HOW IT WORKS
        </a>
        <router-link v-if="authStore.isAuthenticated" to="/dashboard" class="px-6 py-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg">
          Dashboard
        </router-link>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()
</script>
