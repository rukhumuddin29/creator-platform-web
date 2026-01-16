<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script setup>
import { useAuthStore } from './stores/auth'
import { onMounted } from 'vue'

const authStore = useAuthStore()

onMounted(() => {
  // Initialize auth state from localStorage
  if (authStore.token) {
    authStore.getProfile().catch(() => {
      authStore.logout()
    })
  }
})
</script>

<style>
:root {
  --primary: #3b82f6;
  --primary-dark: #1e40af;
  --secondary: #10b981;
  --danger: #ef4444;
  --warning: #f59e0b;
  --text-primary: #1f2937;
  --text-secondary: #6b7280;
  --border: #e5e7eb;
  --bg-light: #f9fafb;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
  overflow-x: hidden;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  background-color: var(--bg-light);
  color: var(--text-primary);
  overflow-x: hidden;
  width: 100%;
  min-height: 100vh;
}

html, body, #app {
  width: 100%;
  min-height: 100vh;
}

#app {
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
}
</style>
