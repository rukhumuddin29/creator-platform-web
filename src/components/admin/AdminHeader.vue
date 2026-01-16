<template>
  <header class="h-18 border-b border-white/5 bg-[#0d121d]/90 backdrop-blur flex items-center justify-end px-4 md:px-6">
    <div class="flex items-center gap-2 md:gap-3">
      <button
        class="p-2 rounded-full bg-white/5 border border-white/5 text-gray-300 hover:bg-white/10 transition"
        type="button"
        aria-label="Notifications"
        @click="$emit('notify')"
      >
        <i class="pi pi-bell"></i>
      </button>
      <button
        class="p-2 rounded-full bg-white/5 border border-white/5 text-gray-300 hover:bg-white/10 transition"
        type="button"
        aria-label="Profile"
        @click="$emit('profile')"
      >
        <i class="pi pi-user"></i>
      </button>
      <button
        class="p-2 rounded-full bg-white/5 border border-white/5 text-gray-300 hover:bg-white/10 transition"
        type="button"
        aria-label="Logout"
        @click="$emit('logout')"
      >
        <i class="pi pi-power-off"></i>
      </button>
    </div>
  </header>
</template>
