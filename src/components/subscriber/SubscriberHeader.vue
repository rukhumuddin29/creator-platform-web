<template>
  <header class="subscriber-header">
    <div class="brand">
      <img class="avatar" :src="computedAvatar" alt="User avatar" />
      <h2 class="name">{{ name }}</h2>
    </div>

    <div class="center">
      <h1 class="title">Subscriber Zone</h1>
      <div class="search-wrap">
        <button class="home-btn" @click="$emit('home')" aria-label="Go to dashboard">
          <i class="pi pi-home"></i>
        </button>
        <span class="search-icon">
          <i class="pi pi-search"></i>
        </span>
        <input
          v-model="searchTerm"
          type="text"
          placeholder="Search..."
          @keyup.enter="$emit('search', searchTerm)"
        />
      </div>
    </div>

    <div class="actions">
      <div class="dropdown" @click="toggleMenu" @keydown.enter="toggleMenu" tabindex="0">
        <button class="icon-btn" aria-label="Profile menu">
          <svg viewBox="0 0 24 24" class="user-icon" aria-hidden="true">
            <path
              fill="currentColor"
              d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-3.33 0-6 1.4-6 3.1V19a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-1.9C18 15.4 15.33 14 12 14Z"
            />
          </svg>
        </button>
        <div v-if="open" class="menu">
          <button @click="$emit('profile')">My Profile</button>
          <button @click="$emit('subscriptions')">My Subscriptions</button>
          <button @click="$emit('following')">Following</button>
        </div>
      </div>
      <button class="icon-btn" @click="$emit('logout')" aria-label="Logout">
        <svg viewBox="0 0 24 24" class="power-icon" aria-hidden="true">
          <path fill="currentColor" d="M11 2h2v10h-2z"></path>
          <path fill="currentColor" d="M7.05 4.05 8.46 5.5A6 6 0 1 0 17 11h2a8 8 0 1 1-13.95-6.95z"></path>
        </svg>
      </button>
    </div>
  </header>
</template>

<script setup>
import { computed, ref, onMounted, onBeforeUnmount } from 'vue'

const DEFAULT_AVATAR =
  'data:image/webp;base64,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'

const props = defineProps({
  name: { type: String, default: 'Subscriber' },
  avatar: { type: String, default: '' },
})

const searchTerm = ref('')
const open = ref(false)

const computedAvatar = computed(() => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    const url = props.avatar || user?.avatar_url
    if (!url) return DEFAULT_AVATAR
    if (url.startsWith('http')) return url
    const base = (import.meta.env.VITE_BACKEND_URL || '').replace(/\/$/, '')
    return base ? `${base}${url.startsWith('/') ? '' : '/'}${url}` : url
  } catch {
    return DEFAULT_AVATAR
  }
})

const toggleMenu = (event) => {
  open.value = !open.value
  event?.stopPropagation()
}

const handleClickOutside = (e) => {
  if (!open.value) return
  const dropdown = e.target.closest('.dropdown')
  if (!dropdown) open.value = false
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.subscriber-header {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  align-items: center;
  padding: 14px 20px;
  background: linear-gradient(180deg, #fce5dc 0%, #fff6f2 100%);
  border-bottom: 1px solid #f1d8cb;
  color: #55423d;
  font-family: 'Trebuchet MS', 'Lucida Sans Unicode', 'Lucida Grande', 'Lucida Sans', Arial, sans-serif;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
}

.avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #f7c8b4;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.12);
}

.name {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #5a4035;
}

.center {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.title {
  margin: 0;
  font-size: 28px;
  font-weight: 800;
  color: #574037;
}

.search-wrap {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  width: min(520px, 100%);
  min-width: 320px;
  position: relative;
}

.search-wrap input {
  width: 100%;
  min-width: 500px;
  padding: 10px 12px 10px 34px;
  border-radius: 12px;
  border: 1px solid #e6cfc0;
  background: #fff;
  color: #55423d;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.08);
}

.search-icon {
  position: absolute;
  left: 45px;
  color: #8a6457;
  font-size: 14px;
  display: inline-flex;
  align-items: center;
}

.home-btn {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  border: 1px solid #f1b9a5;
  background: #fff7f2;
  color: #5a4035;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  padding: 0 15px;
}

.home-btn:hover {
  background: #f5a7a8;
  color: #fff;
  border-color: #f5a7a8;
}

.actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
}

.icon-btn {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  border: 1px solid #f1b9a5;
  background: #fff7f2;
  color: #5a4035;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
  cursor: pointer;
}

.icon-btn:hover {
  background: #f5a7a8;
  color: #fff;
  border-color: #f5a7a8;
}

.dropdown {
  position: relative;
}

.menu {
  position: absolute;
  right: 0;
  top: 48px;
  background: #fff;
  border: 1px solid #f1d8cb;
  border-radius: 12px;
  box-shadow: 0 10px 18px rgba(0, 0, 0, 0.12);
  overflow: hidden;
  min-width: 180px;
  z-index: 20;
}

.menu button {
  width: 100%;
  padding: 10px 12px;
  border: none;
  background: #fff;
  text-align: left;
  color: #5a4035;
  cursor: pointer;
}

.menu button:hover {
  background: #f7d1c4;
}

.power-icon,
.user-icon {
  width: 18px;
  height: 18px;
}
</style>
