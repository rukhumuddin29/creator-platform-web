<template>
  <div class="subscriber-page settings-page">
    <SubscriberHeader
      :name="displayName"
      :avatar="headerAvatar"
      @logout="handleLogout"
      @home="goHome"
      @profile="() => {}"
      @subscriptions="goSubscriptions"
      @following="goFollowing"
    />

    <div class="settings-layout">
      <aside class="tabs">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          class="tab"
          :class="{ active: activeTab === tab.key }"
          @click="activeTab = tab.key"
        >
          {{ tab.label }}
        </button>
      </aside>

      <section class="tab-content">
        <div v-if="activeTab === 'profile'" class="card">
          <h3>My Profile</h3>
          <p class="muted">Update your profile information.</p>
          <div v-if="status.message" class="status" :class="status.type">{{ status.message }}</div>

          <form class="form-grid" @submit.prevent="saveProfile">
            <label>
              First Name
              <input v-model="form.firstName" type="text" required />
            </label>
            <label>
              Last Name
              <input v-model="form.lastName" type="text" required />
            </label>
            <label>
              Date of Birth
              <input v-model="form.dob" type="date" />
            </label>
            <label>
              Contact Number
              <input v-model="form.contactNumber" type="tel" />
            </label>
            <label>
              Alternate Contact Number
              <input v-model="form.altContactNumber" type="tel" />
            </label>
            <label>
              Alternate Email
              <input v-model="form.altEmail" type="email" />
            </label>
            <label class="full">
              Address
              <textarea v-model="form.address" rows="2"></textarea>
            </label>
            <label class="full">
              Bio
              <textarea v-model="form.bio" rows="3"></textarea>
            </label>
            <label class="full">
              Avatar
              <input type="file" accept="image/*" @change="onAvatarChange" />
              <div class="avatar-preview" v-if="form.avatarPreview">
                <img :src="form.avatarPreview" alt="Avatar preview" @error="onAvatarError" />
              </div>
            </label>

            <div class="actions full">
              <button type="submit" class="primary" :disabled="saving">
                {{ saving ? 'Saving...' : 'Save Changes' }}
              </button>
              <button type="button" class="ghost" @click="resetForm">Cancel</button>
            </div>
          </form>
        </div>

        <div v-else-if="activeTab === 'password'" class="card">
          <h3>Update Password</h3>
          <p class="muted">Keep your account secure by updating your password regularly.</p>
          <div v-if="passwordStatus.message" class="status" :class="passwordStatus.type">
            {{ passwordStatus.message }}
          </div>

          <form class="form-grid" @submit.prevent="savePassword">
            <label class="full">
              Current Password
              <input v-model="passwordForm.current" type="password" autocomplete="current-password" required />
            </label>
            <label class="full">
              New Password
              <input v-model="passwordForm.new" type="password" autocomplete="new-password" required />
            </label>
            <label class="full">
              Confirm New Password
              <input v-model="passwordForm.confirm" type="password" autocomplete="new-password" required />
            </label>

            <div class="actions full">
              <button type="submit" class="primary" :disabled="passwordSaving">
                {{ passwordSaving ? 'Updating...' : 'Update Password' }}
              </button>
              <button type="button" class="ghost" @click="resetPasswordForm">Cancel</button>
            </div>
          </form>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import SubscriberHeader from '../../components/subscriber/SubscriberHeader.vue'
import api from '../../services/api'

const router = useRouter()
const route = useRoute()

const tabs = [
  { key: 'profile', label: 'My Profile' },
  { key: 'password', label: 'Update Password' },
]

const activeTab = ref('profile')

const status = reactive({ message: '', type: '' })
const passwordStatus = reactive({ message: '', type: '' })
const saving = ref(false)
const passwordSaving = ref(false)

const emptyForm = () => ({
  firstName: '',
  lastName: '',
  dob: '',
  contactNumber: '',
  altContactNumber: '',
  altEmail: '',
  address: '',
  bio: '',
  avatarFile: null,
  avatarPreview: '',
})

const form = reactive(emptyForm())

const normalizeDate = (value) => {
  if (!value) return ''
  if (typeof value === 'string') {
    return value.includes('T') ? value.split('T')[0] : value
  }
  if (value instanceof Date) {
    return value.toISOString().split('T')[0]
  }
  return ''
}

const passwordForm = reactive({
  current: '',
  new: '',
  confirm: '',
})

const displayName = computed(() => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    return user?.name || 'Subscriber'
  } catch {
    return 'Subscriber'
  }
})

const headerAvatar = computed(() => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    return user?.avatar_url || ''
  } catch {
    return ''
  }
})

const handleLogout = () => {
  localStorage.removeItem('auth_token')
  localStorage.removeItem('user')
  router.push('/login')
}

const goHome = () => router.push(`/subscriber/${route.params.username}`)
const goSubscriptions = () => router.push(`/subscriber/${route.params.username}/subscriptions`)
const goFollowing = () => router.push(`/subscriber/${route.params.username}/following`)

const resetForm = () => {
  Object.assign(form, emptyForm())
  loadProfile()
}

const resetPasswordForm = () => {
  passwordForm.current = ''
  passwordForm.new = ''
  passwordForm.confirm = ''
  passwordStatus.message = ''
  passwordStatus.type = ''
}

const onAvatarChange = (e) => {
  const file = e.target.files?.[0]
  form.avatarFile = file || null
  if (file) {
    form.avatarPreview = URL.createObjectURL(file)
  }
}

const onAvatarError = (e) => {
  e.target.src = ''
}

const hydrateFromLocal = () => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    const info = JSON.parse(localStorage.getItem('user_information') || '{}')
    const base = (import.meta.env.VITE_BACKEND_URL || '').replace(/\/$/, '')

    form.firstName = info.first_name || form.firstName || user.first_name || ''
    form.lastName = info.last_name || form.lastName || user.last_name || ''
    form.dob = normalizeDate(info.dob || form.dob || user.dob)
    form.contactNumber = info.contact_number || form.contactNumber || ''
    form.altContactNumber = info.alt_contact_number || form.altContactNumber || ''
    form.altEmail = info.alt_email || form.altEmail || ''
    form.address = info.address || form.address || ''
    form.bio = info.bio || form.bio || user.bio || ''
    if (user) {
      if (user.avatar_url && !form.avatarPreview) {
        form.avatarPreview = `${base}${user.avatar_url.startsWith('/') ? '' : '/'}${user.avatar_url}`
      }
    }
  } catch (e) {
    // ignore
  }
}

const loadProfile = async () => {
  try {
    const { data } = await api.get('/user-information')
    const payload = data?.data?.data || data?.data || data || {}
    const info =
      payload.information ||
      payload.user?.information ||
      payload.user_information ||
      payload || {}
    const user = payload.user || {}
    form.firstName = info.first_name || ''
    form.lastName = info.last_name || ''
    form.dob = normalizeDate(info.dob || user.dob)
    form.contactNumber = info.contact_number || user.contact_number || ''
    form.altContactNumber = info.alt_contact_number || user.alt_contact_number || ''
    form.altEmail = info.alt_email || user.alt_email || ''
    form.address = info.address || user.address || ''
    form.bio = info.bio || user.bio || ''
    const base = (import.meta.env.VITE_BACKEND_URL || '').replace(/\/$/, '')
    const avatarUrl = info.avatar_url || user.avatar_url
    form.avatarPreview = avatarUrl ? `${base}${avatarUrl.startsWith('/') ? '' : '/'}${avatarUrl}` : ''
    // cache for other pages
    const cached = JSON.parse(localStorage.getItem('user') || '{}')
    localStorage.setItem('user_information', JSON.stringify(info))
    localStorage.setItem('user', JSON.stringify({ ...cached, ...user, ...info }))
    // If nothing in user-information, hydrate from profile endpoint
    if (!info.first_name && !info.last_name && !info.contact_number && !info.dob) {
      const profile = await api.get('/auth/profile')
      const profileUser = profile?.data?.data || {}
      form.firstName = form.firstName || profileUser.first_name || profileUser.name?.split(' ')?.[0] || ''
      form.lastName =
        form.lastName ||
        (profileUser.name?.includes(' ') ? profileUser.name.split(' ').slice(1).join(' ') : '') ||
        ''
      form.bio = form.bio || profileUser.bio || ''
      form.dob = form.dob || normalizeDate(profileUser.dob)
      if (profileUser.avatar_url && !form.avatarPreview) {
        form.avatarPreview = `${base}${profileUser.avatar_url.startsWith('/') ? '' : '/'}${profileUser.avatar_url}`
      }
      localStorage.setItem('user', JSON.stringify({ ...cached, ...profileUser }))
    }
  } catch (error) {
    console.error(error)
    status.message = 'Could not load profile.'
    status.type = 'error'
    hydrateFromLocal()
  }
}

const saveProfile = async () => {
  try {
    saving.value = true
    status.message = ''
    const payload = {
      first_name: form.firstName,
      last_name: form.lastName,
      dob: form.dob,
      contact_number: form.contactNumber,
      alt_contact_number: form.altContactNumber,
      alt_email: form.altEmail,
      address: form.address,
      bio: form.bio,
    }

    const formData = new FormData()
    Object.entries(payload).forEach(([key, value]) => formData.append(key, value ?? ''))
    if (form.avatarFile) {
      formData.append('avatar', form.avatarFile)
    }

    await api.post('/user-information', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })

    status.message = 'Profile saved successfully.'
    status.type = 'success'
    loadProfile()
  } catch (error) {
    console.error(error)
    status.message = 'Could not save profile.'
    status.type = 'error'
  } finally {
    saving.value = false
  }
}

const savePassword = async () => {
  if (passwordForm.new !== passwordForm.confirm) {
    passwordStatus.message = 'New password and confirmation do not match.'
    passwordStatus.type = 'error'
    return
  }

  passwordSaving.value = true
  try {
    // Placeholder for future API; surface friendly message meanwhile
    passwordStatus.message = 'Password update will be available soon.'
    passwordStatus.type = 'info'
  } catch (error) {
    passwordStatus.message = 'Could not update password.'
    passwordStatus.type = 'error'
  } finally {
    passwordSaving.value = false
  }
}

onMounted(() => {
  loadProfile()
})
</script>

<style scoped>
.settings-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #fce5dc 0%, #ffffff 50%);
  color: #55423d;
  font-family: 'Trebuchet MS', 'Lucida Sans Unicode', 'Lucida Grande', 'Lucida Sans', Arial, sans-serif;
}

.settings-layout {
  display: grid;
  grid-template-columns: 1fr 4fr;
  gap: 18px;
  padding: 18px 22px 28px;
}

.tabs {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.tab {
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid #f1d8cb;
  background: #fff;
  color: #5a4035;
  text-align: left;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, transform 0.2s;
}

.tab:hover {
  background: #f7d1c4;
  transform: translateY(-1px);
}

.tab.active {
  background: #f5a7a8;
  color: #fff;
  border-color: #f19c9f;
}

.tab-content {
  background: #fff;
  border-radius: 16px;
  border: 1px solid #f1d8cb;
  padding: 18px 20px 22px;
  box-shadow: 0 10px 18px rgba(0, 0, 0, 0.06);
}

.card h3 {
  margin: 0 0 6px;
}

.muted {
  color: #8a6457;
  margin: 0 0 12px;
}

.status {
  padding: 10px 12px;
  border-radius: 10px;
  margin-bottom: 12px;
  font-weight: 600;
}

.status.success {
  background: #e9f9f1;
  color: #1f7a4d;
  border: 1px solid #b6e3c9;
}

.status.error {
  background: #fdecea;
  color: #b3261e;
  border: 1px solid #f5c6c0;
}

.status.info {
  background: #eef3ff;
  color: #314e9b;
  border: 1px solid #cdd8ff;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px 14px;
}

.form-grid label {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-weight: 600;
  color: #5a4035;
}

.form-grid input,
.form-grid textarea {
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid #e6cfc0;
  background: #fff;
  color: #5a4035;
}

.form-grid .full {
  grid-column: span 2;
}

.avatar-preview img {
  max-width: 160px;
  max-height: 160px;
  border-radius: 14px;
  border: 1px solid #e6cfc0;
  margin-top: 6px;
}

.actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.primary {
  background: #f5a7a8;
  color: #fff;
  border: none;
  padding: 10px 16px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 700;
}

.primary:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.ghost {
  background: transparent;
  border: 1px solid #e6cfc0;
  color: #5a4035;
  padding: 10px 14px;
  border-radius: 10px;
  cursor: pointer;
}
</style>
