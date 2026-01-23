<template>
  <div class="register-page">
    <div class="register-card">
      <header class="register-header">
        <div class="logo-circle">🌟</div>
        <div>
          <h1>Join Creator Hub</h1>
          <p>Become part of our creator community.</p>
        </div>
      </header>

      <form class="register-form" @submit.prevent="handleRegister">
        <div v-if="errorMessage" class="alert error">
          {{ errorMessage }}
        </div>

        <label class="field">
          <span>Full Name</span>
          <input v-model="name" type="text" required placeholder="John Doe" />
        </label>

        <label class="field">
          <span>Email Address</span>
          <input v-model="email" type="email" required placeholder="you@example.com" />
        </label>

        <label v-if="showRoleSelect" class="field">
          <span>I am a</span>
          <select v-model="role" required>
            <option value="">Select your role</option>
            <option value="creator">Content Creator</option>
            <option value="subscriber">Subscriber</option>
          </select>
        </label>

        <label class="field">
          <span>Password</span>
          <div class="password-wrap">
            <input v-model="password" :type="showPassword ? 'text' : 'password'" required placeholder="••••••••" />
            <button type="button" class="ghost icon-btn" @click="showPassword = !showPassword">
              <i :class="showPassword ? 'pi pi-eye-slash' : 'pi pi-eye'"></i>
            </button>
          </div>
        </label>

        <label class="field">
          <span>Confirm Password</span>
          <div class="password-wrap">
            <input
              v-model="passwordConfirmation"
              :type="showPasswordConfirm ? 'text' : 'password'"
              required
              placeholder="••••••••"
            />
            <button type="button" class="ghost icon-btn" @click="showPasswordConfirm = !showPasswordConfirm">
              <i :class="showPasswordConfirm ? 'pi pi-eye-slash' : 'pi pi-eye'"></i>
            </button>
          </div>
        </label>

        <button type="submit" :disabled="isLoading" class="primary">
          <span v-if="!isLoading">Create Account</span>
          <span v-else>Creating account…</span>
        </button>
      </form>

      <footer class="register-footer">
        <p>
          Already have an account?
          <router-link to="/login">Sign in here</router-link>
        </p>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../../stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const name = ref('')
const email = ref('')
const password = ref('')
const passwordConfirmation = ref('')
const role = ref('')
const showRoleSelect = ref(true)
const showPassword = ref(false)
const showPasswordConfirm = ref(false)
const isLoading = ref(false)
const errorMessage = ref('')

const handleRegister = async () => {
  if (password.value !== passwordConfirmation.value) {
    errorMessage.value = 'Passwords do not match'
    return
  }

  if (!role.value) {
    errorMessage.value = 'Please select a role'
    return
  }

  isLoading.value = true
  errorMessage.value = ''

  try {
    await authStore.register({
      name: name.value,
      email: email.value,
      password: password.value,
      password_confirmation: passwordConfirmation.value,
      role: role.value,
    })
    const intent = authStore.consumePendingIntent?.() || null
    if (intent?.type === 'ppv' && intent.creator && intent.slug) {
      router.push({ name: 'Checkout', params: { username: intent.creator, slug: intent.slug } })
    } else if (intent?.type === 'subscribe' && intent.creator) {
      router.push({ name: 'PublicSubscriptionPlans', params: { username: intent.creator } })
    } else {
      router.push(authStore.getDashboardPath())
    }
  } catch (error) {
    errorMessage.value = authStore.error || 'Registration failed. Please try again.'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  const param = (route.query.u || '').toString().toLowerCase()
  if (param === 's') {
    role.value = 'subscriber'
    showRoleSelect.value = false
  } else if (param === 'c') {
    role.value = 'creator'
    showRoleSelect.value = false
  } else {
    showRoleSelect.value = true
  }
})
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: linear-gradient(180deg, #fce5dc 0%, #ffffff 45%);
  font-family: 'Trebuchet MS', 'Lucida Sans Unicode', 'Lucida Grande', 'Lucida Sans', Arial, sans-serif;
  color: #55423d;
}

.register-card {
  width: min(520px, 100%);
  background: #ffffff;
  border-radius: 18px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.12);
  padding: 20px 22px;
  border: 1px solid #f2d6ca;
}

.register-header {
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

.register-header h1 {
  margin: 0 0 4px;
  font-size: 24px;
  color: #4a362f;
}

.register-header p {
  margin: 0;
  color: #8a6457;
  font-size: 14px;
}

.register-form {
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

.field input,
.field select {
  border: 1px solid #e6cfc0;
  border-radius: 10px;
  padding: 12px 12px;
  background: #fff7f2;
  color: #55423d;
  font-size: 15px;
}

.field input:focus,
.field select:focus {
  outline: 2px solid #f5a7a8;
  border-color: transparent;
}

.toggle-wrap {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 4px;
}

.toggle {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #6d4f43;
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

.alert.error {
  background: #fde8e8;
  border: 1px solid #f5b3b3;
  color: #a33a3a;
  padding: 10px 12px;
  border-radius: 10px;
  font-weight: 600;
}

.register-footer {
  text-align: center;
  margin-top: 12px;
  color: #6d4f43;
}

.register-footer a {
  color: #d16a7a;
  font-weight: 700;
  text-decoration: none;
}

.register-footer a:hover {
  text-decoration: underline;
}
</style>
