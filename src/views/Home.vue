<template>
  <div class="body-pad min-h-screen bg-gradient-to-br from-slate-950 via-black to-slate-950 text-white overflow-hidden">
    <!-- Header Component -->
    <Header />

    <!-- Hero Section -->
    <div class="relative z-10">
      <div class="px-[50px] py-20 min-h-[90vh] flex items-center">
        <div class="w-full">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center w-full">
          <!-- Left Side: Content -->
          <div class="space-y-8 transform transition-all duration-1000" :class="{ 'translate-x-0 opacity-100': isVisible, '-translate-x-8 opacity-0': !isVisible }">
            <!-- Main Heading -->
            <div>
              <h2 class="text-6xl lg:text-7xl font-bold mb-6 leading-tight">
                <span class="block text-white">DO WHAT</span>
                <span class="block bg-gradient-to-r from-purple-200 via-pink-200 to-purple-200 bg-clip-text text-transparent">YOU LOVE</span>
              </h2>
            </div>

            <!-- Description -->
            <div class="space-y-4">
              <p class="text-lg text-white/80">Creator Hub empowers</p>
              <p class="text-xl font-semibold text-white">Digital Creators and Influencers</p>
              <p class="text-lg text-white/70">to turn their passion into their career.</p>
            </div>

            <!-- CTA Button -->
            <div class="pt-4">
              <router-link 
                v-if="!authStore.isAuthenticated"
                to="/register"
                class="inline-flex items-center justify-center px-8 py-3 rounded-full bg-lime-400 hover:bg-lime-500 text-black font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl"
              >
                GET STARTED
              </router-link>
              <router-link 
                v-else
                to="/dashboard"
                class="inline-flex items-center justify-center px-8 py-3 rounded-full bg-lime-400 hover:bg-lime-500 text-black font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl"
              >
                GO TO DASHBOARD
              </router-link>
            </div>
          </div>

          <!-- Right Side: Illustration Area -->
          <div class="relative h-full min-h-[500px] flex items-center justify-center transform transition-all duration-1000" :class="{ 'translate-x-0 opacity-100': isVisible, 'translate-x-8 opacity-0': !isVisible }" style="transition-delay: 200ms">
            <!-- Placeholder for illustration (will be a decorative element) -->
            <div class="relative w-full h-full flex items-center justify-center">
              <!-- Decorative gradient circle -->
              <div class="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-indigo-500/10 rounded-full blur-3xl"></div>
              
              <!-- Feature icons grid (simulating illustration) -->
              <div class="relative z-10 grid grid-cols-2 gap-8 p-8">
                <!-- Icon 1: Heart -->
                <div class="flex justify-center animate-float" style="animation-delay: 0s">
                  <div class="w-20 h-20 bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center transform hover:scale-110 transition-transform duration-300 shadow-lg">
                    <svg class="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                  </div>
                </div>

                <!-- Icon 2: Play -->
                <div class="flex justify-center animate-float" style="animation-delay: 200ms">
                  <div class="w-20 h-20 bg-gradient-to-br from-rose-500 to-pink-500 rounded-2xl flex items-center justify-center transform hover:scale-110 transition-transform duration-300 shadow-lg">
                    <svg class="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </div>
                </div>

                <!-- Icon 3: Star -->
                <div class="flex justify-center animate-float" style="animation-delay: 400ms">
                  <div class="w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center transform hover:scale-110 transition-transform duration-300 shadow-lg">
                    <svg class="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  </div>
                </div>

                <!-- Icon 4: Zap -->
                <div class="flex justify-center animate-float" style="animation-delay: 600ms">
                  <div class="w-20 h-20 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center transform hover:scale-110 transition-transform duration-300 shadow-lg">
                    <svg class="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                    </svg>
                  </div>
                </div>
              </div>

              <!-- Floating text badge -->
              <div class="absolute top-8 right-8 bg-white/10 backdrop-blur-md rounded-lg px-6 py-4 border border-white/20 text-center max-w-xs transform hover:scale-105 transition-transform duration-300">
                <h3 class="text-lg font-bold mb-2">All-in-One Platform</h3>
                <p class="text-sm text-white/80">Manage subscriptions, content, and engage with your audience seamlessly.</p>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>

    <!-- Features Section (single copy) -->

    <!-- Features Section -->
    <div id="features" class="relative z-10 px-[50px]">
      <div class="w-full py-32 mt-20">
        <h3 class="text-4xl font-bold text-center mb-20 bg-gradient-to-r from-purple-200 to-pink-200 bg-clip-text text-transparent">Why Choose Creator Hub?</h3>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-10">
          <!-- Feature 1 -->
          <div class="group relative">
            <div class="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
            <div class="relative backdrop-blur-xl bg-white/5 rounded-2xl p-10 border border-white/10 group-hover:border-white/30 transition-all duration-300 transform group-hover:scale-105">
              <div class="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-400 rounded-xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <h4 class="text-2xl font-bold mb-4">Easy Setup</h4>
              <p class="text-purple-100 leading-relaxed">Get started in minutes with our simple onboarding process. No complicated setup required.</p>
            </div>
          </div>

          <!-- Feature 2 -->
          <div class="group relative">
            <div class="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
            <div class="relative backdrop-blur-xl bg-white/5 rounded-2xl p-10 border border-white/10 group-hover:border-white/30 transition-all duration-300 transform group-hover:scale-105">
              <div class="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-400 rounded-xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2c6.627 0 12 5.373 12 12s-5.373 12-12 12S0 20.627 0 14 5.373 2 12 2zm0 2C6.477 4 2 8.477 2 14s4.477 10 10 10 10-4.477 10-10S17.523 4 12 4zm3.5 11c.828 0 1.5.672 1.5 1.5S16.328 18 15.5 18 14 17.328 14 16.5s.672-1.5 1.5-1.5zm-7 0c.828 0 1.5.672 1.5 1.5S9.328 18 8.5 18 7 17.328 7 16.5 7.672 15 8.5 15zm3.5-9c2.33 0 4.31 1.46 5.164 3.5H16.5c-.828 0-1.5.672-1.5 1.5s.672 1.5 1.5 1.5h1.164c-.854 2.04-2.834 3.5-5.164 3.5-3.038 0-5.5-2.462-5.5-5.5S9.462 6 12.5 6z"/>
                </svg>
              </div>
              <h4 class="text-2xl font-bold mb-4">Creator Support</h4>
              <p class="text-purple-100 leading-relaxed">24/7 support to help you succeed. Our team is always ready to assist with any questions.</p>
            </div>
          </div>

          <!-- Feature 3 -->
          <div class="group relative">
            <div class="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
            <div class="relative backdrop-blur-xl bg-white/5 rounded-2xl p-10 border border-white/10 group-hover:border-white/30 transition-all duration-300 transform group-hover:scale-105">
              <div class="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-400 rounded-xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                </svg>
              </div>
              <h4 class="text-2xl font-bold mb-4">Secure Payments</h4>
              <p class="text-purple-100 leading-relaxed">Stripe integration ensures secure and reliable payment processing for your peace of mind.</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <footer class="relative z-10 border-t border-white/10 bg-black/40 backdrop-blur-md mt-24 px-[50px]">
      <div class="w-full py-12 text-center text-purple-100">
        <p>© 2026 Creator Hub. All rights reserved. | Built with ❤️ for creators</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import Header from '../components/Header.vue'

const authStore = useAuthStore()
const isVisible = ref(false)

onMounted(() => {
  setTimeout(() => {
    isVisible.value = true
  }, 100)
})
</script>

<style scoped>
@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
}

.animate-float {
  animation: float 3s ease-in-out infinite;
}
</style>

<style scoped>
@keyframes blob {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  33% {
    transform: translate(30px, -50px) scale(1.1);
  }
  66% {
    transform: translate(-20px, 20px) scale(0.9);
  }
}

.animate-blob {
  animation: blob 7s infinite;
}

.animation-delay-2000 {
  animation-delay: 2s;
}

.animation-delay-4000 {
  animation-delay: 4s;
}
</style>
