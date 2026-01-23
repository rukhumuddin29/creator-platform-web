<template>
  <div class="login-page">
    <div class="login-card">
      <header class="login-header">
        <div class="logo-circle">🌟</div>
        <div>
          <h1>Creator Hub</h1>
          <p>Sign in to manage your creator or subscriber account.</p>
        </div>
      </header>

      <form class="login-form" @submit.prevent="handleLogin">
        <div v-if="errorMessage" class="alert error">
          {{ errorMessage }}
        </div>

        <label class="field">
          <span>Email</span>
          <input v-model="email" type="email" required placeholder="you@example.com" />
        </label>

        <label class="field">
          <span>Password</span>
          <div class="password-wrap">
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              required
              placeholder="••••••••"
            />
            <button type="button" class="ghost icon-btn" @click="showPassword = !showPassword">
              <i :class="showPassword ? 'pi pi-eye-slash' : 'pi pi-eye'"></i>
            </button>
          </div>
        </label>

        <button type="submit" :disabled="isLoading" class="primary">
          <span v-if="!isLoading">Sign In</span>
          <span v-else>Signing in…</span>
        </button>
      </form>

      <footer class="login-footer">
        <p>
          Don't have an account?
          <router-link to="/register">Create one now</router-link>
        </p>
      </footer>
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
const showPassword = ref(false)
const isLoading = ref(false)
const errorMessage = ref('')

const handleLogin = async () => {
  isLoading.value = true
  errorMessage.value = ''
  try {
    await authStore.login(email.value, password.value)
    const intent = authStore.consumePendingIntent?.() || null
    if (intent?.type === 'ppv' && intent.creator && intent.slug) {
      router.push({ name: 'Checkout', params: { username: intent.creator, slug: intent.slug } })
    } else if (intent?.type === 'subscribe' && intent.creator) {
      router.push({ name: 'PublicSubscriptionPlans', params: { username: intent.creator } })
    } else {
      router.push(authStore.getDashboardPath())
    }
  } catch (error) {
    errorMessage.value = authStore.error || 'Login failed. Please try again.'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: linear-gradient(180deg, #fce5dc 0%, #ffffff 45%);
  font-family: 'Trebuchet MS', 'Lucida Sans Unicode', 'Lucida Grande', 'Lucida Sans', Arial, sans-serif;
  color: #55423d;
}

.login-card {
  width: min(480px, 100%);
  background: #ffffff;
  border-radius: 18px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.12);
  padding: 20px 22px;
  border: 1px solid #f2d6ca;
}

.login-header {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 14px;
}

.logo-circle {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #f5a7a8, #f7c8b4);
  display: grid;
  place-items: center;
  font-size: 20px;
  color: #fff;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12);
}

.login-header h1 {
  margin: 0 0 4px;
  font-size: 24px;
  color: #4a362f;
}

.login-header p {
  margin: 0;
  color: #8a6457;
  font-size: 14px;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 10px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field span {
  font-weight: 700;
  color: #5a4035;
  font-size: 14px;
}

.field input {
  border: 1px solid #e6cfc0;
  border-radius: 10px;
  padding: 12px 12px;
  background: #fff7f2;
  color: #55423d;
  font-size: 15px;
}

.field input:focus {
  outline: 2px solid #f5a7a8;
  border-color: transparent;
}

.password-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
}

.password-wrap input {
  flex: 1;
}

.ghost {
  background: transparent;
  border: 1px solid #e6cfc0;
  color: #6d4f43;
  padding: 10px 12px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 700;
}

.icon-btn {
  padding: 10px;
  height: 45px;
  width: 45px;
  display: grid;
  place-items: center;
}

.primary {
  width: 100%;
  border: none;
  border-radius: 12px;
  padding: 12px;
  font-weight: 700;
  cursor: pointer;
  background: linear-gradient(135deg, #f5a7a8, #f7c8b4);
  color: #fff;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.12);
}

.primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.alert.error {
  background: #fde8e8;
  border: 1px solid #f5b3b3;
  color: #a33a3a;
  padding: 10px 12px;
  border-radius: 10px;
  font-weight: 600;
}

.login-footer {
  text-align: center;
  margin-top: 12px;
  color: #6d4f43;
}

.login-footer a {
  color: #d16a7a;
  font-weight: 700;
  text-decoration: none;
}

.login-footer a:hover {
  text-decoration: underline;
}
</style>
