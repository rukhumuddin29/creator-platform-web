<template>
  <div class="creator-page settings-page">
    <CreatorHeader :name="displayName" :avatar="headerAvatar" :tagline="headerTagline" @add="handleAddPost" />
    <CreatorNav :username="username" />

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
        <div v-if="activeTab === 'account'" class="card">
          <h3>My Account</h3>
          <p class="muted">Update your profile information.</p>
          <div v-if="status.message" class="status" :class="status.type">{{ status.message }}</div>

          <form class="form-grid" @submit.prevent="saveAccount">
            <label>
              First Name
              <input v-model="form.firstName" type="text" required>
            </label>
            <label>
              Last Name
              <input v-model="form.lastName" type="text" required>
            </label>
            <label>
              Date of Birth
              <input v-model="form.dob" type="date">
            </label>
            <label>
              Contact Number
              <input v-model="form.contactNumber" type="tel">
            </label>
            <label>
              Alternate Contact Number
              <input v-model="form.altContactNumber" type="tel">
            </label>
            <label>
              Alternate Email
              <input v-model="form.altEmail" type="email">
            </label>
            <label class="full">
              Address
              <textarea v-model="form.address" rows="2"></textarea>
            </label>
            <label>
              Tag line
              <input v-model="form.tagline" type="text">
            </label>
            <label class="full">
              Bio
              <textarea v-model="form.bio" rows="3"></textarea>
            </label>
            <label class="full">
              Avatar
              <input type="file" accept="image/*" @change="onAvatarChange">
              <div class="avatar-preview" v-if="form.avatarPreview">
                <img :src="form.avatarPreview" alt="Avatar preview" @error="onAvatarError">
              </div>
            </label>

            <div class="actions full">
              <button type="submit" class="primary">Save Changes</button>
              <button type="button" class="ghost" @click="resetForm">Cancel</button>
            </div>
          </form>
        </div>

        <div v-else-if="activeTab === 'plans'" class="card">
          <h3>My Subscription Plans</h3>
          <p class="muted">Create or update your subscription offering.</p>
          <div v-if="planStatus.message" class="status" :class="planStatus.type">{{ planStatus.message }}</div>

          <div v-if="plans.length" class="plan-pills">
            <button
              v-for="plan in plans"
              :key="plan.id"
              type="button"
              class="pill"
              :class="{ active: subscriptionForm.id === plan.id }"
              @click="setPlanForm(plan)"
            >
              {{ plan.name }}
            </button>
            <button type="button" class="pill ghost-pill" @click="setPlanForm(null)">+ New Plan</button>
          </div>

          <form class="form-grid" @submit.prevent="savePlan">
            <label class="full">
              Plan name
              <input v-model="subscriptionForm.name" type="text" required @input="subscriptionForm.slug = slugify(subscriptionForm.name)">
            </label>

            <label class="full">
              Subtitle
              <input v-model="subscriptionForm.subtitle" type="text" placeholder="Great for loyal supporters">
            </label>

            <label>
              Slug
              <input v-model="subscriptionForm.slug" type="text" required readonly>
              <small class="muted">Slug is auto-generated from the plan name.</small>
            </label>

            <div class="switch-field">
              <label for="plan-status">Status</label>
              <button
                id="plan-status"
                type="button"
                class="toggle-btn"
                :class="{ active: subscriptionForm.is_active }"
                @click="subscriptionForm.is_active = !subscriptionForm.is_active"
                :aria-pressed="subscriptionForm.is_active"
              >
                <span class="dot"></span>
              </button>
              <span class="muted">{{ subscriptionForm.is_active ? 'Active' : 'Inactive' }}</span>
            </div>

            <label class="full">
              Description
              <textarea v-model="subscriptionForm.description" rows="3" required placeholder="Describe what's included"></textarea>
            </label>

            <label>
              Monthly price ($)
              <input v-model.number="subscriptionForm.monthly_price" type="number" step="0.01" min="0" required placeholder="9.99">
            </label>

            <label>
              Quarterly price ($)
              <input v-model.number="subscriptionForm.quarterly_price" type="number" step="0.01" min="0" placeholder="24.99">
            </label>

            <label>
              Half-yearly price ($)
              <input v-model.number="subscriptionForm.half_yearly_price" type="number" step="0.01" min="0" placeholder="49.99">
            </label>

            <label>
              Yearly price ($)
              <input v-model.number="subscriptionForm.yearly_price" type="number" step="0.01" min="0" required placeholder="99.99">
            </label>

            <label>
              Plan order
              <input v-model.number="subscriptionForm.plan_order" type="number" min="0" placeholder="0">
              <small class="muted">Lower numbers show first.</small>
            </label>

            <label>
              Tier level
              <input v-model.number="subscriptionForm.tier_level" type="number" min="1" placeholder="1">
              <small class="muted">Higher tier unlocks lower tiers.</small>
            </label>

            <label class="full">
              Features (one per line)
              <textarea
                v-model="featuresText"
                rows="4"
                placeholder="Ad-free content&#10;Exclusive videos&#10;Early access"
              ></textarea>
            </label>

            <label>
              Plan thumbnail
              <input type="file" accept="image/*" @change="e => onPlanThumbChange(e)">
              <div class="avatar-preview" v-if="subscriptionForm.plan_thumbnail_preview">
                <img :src="subscriptionForm.plan_thumbnail_preview" alt="Plan thumbnail">
              </div>
            </label>

            <label>
              Badge thumbnail
              <input type="file" accept="image/*" @change="e => onBadgeThumbChange(e)">
              <div class="avatar-preview" v-if="subscriptionForm.badge_thumbnail_preview">
                <img :src="subscriptionForm.badge_thumbnail_preview" alt="Badge thumbnail">
              </div>
            </label>

            <div class="actions full">
              <button type="submit" class="primary" :disabled="planLoading">
                {{ planLoading ? 'Saving...' : 'Save Plan' }}
              </button>
              <button type="button" class="ghost" @click="resetPlan">Cancel</button>
            </div>
          </form>
        </div>

        <div v-else-if="activeTab === 'payout'" class="card">
          <h3>My Payout Settings</h3>
          <p class="muted">Add your legal details to receive payouts.</p>
          <div v-if="payoutStatus.message" class="status" :class="payoutStatus.type">{{ payoutStatus.message }}</div>

          <form class="form-grid" @submit.prevent="savePayout">
            <label>
              Legal Firstname (*As per pancard)
              <input v-model="payoutForm.first_name" type="text" required autocomplete="off">
            </label>
            <label>
              Legal Lastname (*As per pancard)
              <input v-model="payoutForm.last_name" type="text" required autocomplete="off">
            </label>
            <label>
              Email Address (for payout updates)
              <input v-model="payoutForm.email" type="email" required autocomplete="off">
            </label>
            <label class="full">
              Full Current Address
              <textarea v-model="payoutForm.address" rows="3" required></textarea>
            </label>
            <label>
              Pancard Number
              <input v-model="payoutForm.pan_number" type="text" required autocomplete="off" @input="onPanInput">
            </label>

            <label>
              Govt Approved Identity
              <select v-model="payoutForm.govt_id_type" required>
                <option value="" disabled>Select document</option>
                <option v-for="opt in govtIdOptions" :key="opt" :value="opt">{{ opt }}</option>
              </select>
            </label>

            <label class="full">
              Upload identity image
              <input type="file" accept="image/*" @change="onGovtIdImageChange">
              <small v-if="payoutForm.govt_id_type === 'Aadhaar Card'" class="muted warning">
                The image should have both front and back.
              </small>
              <div class="avatar-preview" v-if="payoutForm.govt_id_preview">
                <img :src="payoutForm.govt_id_preview" alt="Govt ID preview">
              </div>
            </label>

            <div class="full payout-mode">
              <span class="label">Payment Mode</span>
              <div class="mode-buttons">
                <button
                  type="button"
                  class="mode-option"
                  :class="{ active: payoutForm.payment_mode === 'bank' }"
                  @click="payoutForm.payment_mode = 'bank'"
                  aria-pressed="payoutForm.payment_mode === 'bank'"
                >
                  <span class="mode-dot"></span>
                  <span class="mode-text">Bank</span>
                </button>
                <button
                  type="button"
                  class="mode-option"
                  :class="{ active: payoutForm.payment_mode === 'upi' }"
                  @click="payoutForm.payment_mode = 'upi'"
                  aria-pressed="payoutForm.payment_mode === 'upi'"
                >
                  <span class="mode-dot"></span>
                  <span class="mode-text">UPI</span>
                </button>
              </div>
            </div>

            <template v-if="payoutForm.payment_mode === 'bank'">
              <label>
                Account Number
                <input v-model="payoutForm.account_number" type="text" required autocomplete="off">
              </label>
              <label>
                Confirm Account Number
                <input v-model="payoutForm.account_number_confirm" type="text" required autocomplete="off">
              </label>
              <label>
                Bank Name
                <input v-model="payoutForm.bank_name" type="text" required autocomplete="off">
              </label>
              <label>
                IFSC Code
                <input v-model="payoutForm.ifsc" type="text" required autocomplete="off">
              </label>
            </template>

            <label v-else class="full">
              UPI ID
              <input v-model="payoutForm.upi_id" type="text" required autocomplete="off">
            </label>

            <div class="actions full">
              <button type="submit" class="primary">Save Payout Details</button>
              <button type="button" class="ghost" @click="resetPayout">Cancel</button>
            </div>
          </form>
        </div>

        <div v-else-if="activeTab === 'social'" class="card social-card">
          <h3>My Social Media</h3>
          <p class="muted">Add the platforms where your audience can follow you.</p>
          <div v-if="socialStatus.message" class="status" :class="socialStatus.type">{{ socialStatus.message }}</div>

          <div v-if="!showSocialForm && !socialLinks.length" class="empty-social">
            <button type="button" class="add-button" @click="openSocialForm()">
              <span class="plus">+</span>
            </button>
            <p class="muted">Connect your first social profile.</p>
          </div>

          <div v-else>
            <div class="social-list" v-if="socialLinks.length">
              <div v-for="link in socialLinks" :key="link.id || link.social_media_platform_id" class="social-row">
                <div>
                  <div class="platform-name">{{ platformName(link.social_media_platform_id) }}</div>
                  <a :href="link.profile_url" target="_blank" rel="noopener" class="platform-url">{{ link.profile_url }}</a>
                </div>
                <div class="row-actions">
                  <span class="pill" :class="{ active: link.status }">{{ link.status ? 'Active' : 'Inactive' }}</span>
                  <button type="button" class="ghost" @click="openSocialForm(link)">Edit</button>
                </div>
              </div>
            </div>

            <div class="actions full" v-if="!showSocialForm">
              <button type="button" class="primary" @click="openSocialForm()">Add Social Link</button>
            </div>

            <form v-if="showSocialForm" class="form-grid social-form" @submit.prevent="saveSocialLink">
              <label class="full">
                Platform
                <select v-model="socialForm.social_media_platform_id" required>
                  <option value="" disabled>Select a platform</option>
                  <option v-for="platform in socialPlatforms" :key="platform.id" :value="platform.id">
                    {{ platform.name }}
                  </option>
                </select>
              </label>

              <label class="full">
                Profile URL
                <input v-model="socialForm.profile_url" type="url" required placeholder="https://platform.com/yourname">
              </label>

              <label class="full">
                Description
                <textarea v-model="socialForm.description" rows="3" placeholder="Optional short note"></textarea>
              </label>

              <div class="switch-field">
                <label for="social-status">Status</label>
                <button
                  id="social-status"
                  type="button"
                  class="toggle-btn"
                  :class="{ active: socialForm.status }"
                  @click="socialForm.status = !socialForm.status"
                  :aria-pressed="socialForm.status"
                >
                  <span class="dot"></span>
                </button>
                <span class="muted status-text">{{ socialForm.status ? 'Active' : 'Inactive' }}</span>
              </div>

              <div class="actions full">
                <button type="submit" class="primary">Save Social Link</button>
                <button type="button" class="ghost" @click="cancelSocialForm">Cancel</button>
              </div>
            </form>
          </div>
        </div>

        <div v-else class="card placeholder">
          <h3>{{ currentTabLabel }}</h3>
          <p class="muted">Content for this tab will be added next.</p>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import CreatorHeader from '../../components/creator/CreatorHeader.vue'
import CreatorNav from '../../components/creator/CreatorNav.vue'
import api, { API_BASE_URL } from '../../services/api'
import { subscriptionService } from '../../services'

const route = useRoute()
const router = useRouter()
const username = computed(() => route.params.username || 'creator')
const displayName = computed(() => decodeURIComponent(username.value))
const DEFAULT_AVATAR = "data:image/webp;base64,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"
const DEFAULT_TAGLINE = 'Tiny stories from a big world'

const tabs = [
  { key: 'account', label: 'My Account' },
  { key: 'plans', label: 'My Subscription Plans' },
  { key: 'payout', label: 'My Payout Settings' },
  { key: 'social', label: 'My Social Media' },
  { key: 'faq', label: 'My FAQ\'s' },
]

const activeTab = ref('account')

const form = reactive({
  firstName: '',
  lastName: '',
  dob: '',
  contactNumber: '',
  altContactNumber: '',
  altEmail: '',
  address: '',
  tagline: '',
  bio: '',
  avatarFile: null,
  avatarPreview: '',
})

const status = reactive({
  message: '',
  type: 'success',
})

const planStatus = reactive({
  message: '',
  type: 'success',
})

const plans = ref([])

const subscriptionForm = reactive({
  id: null,
  name: '',
  subtitle: '',
  slug: '',
  description: '',
  monthly_price: '',
  quarterly_price: '',
  half_yearly_price: '',
  yearly_price: '',
  features: [],
  is_active: true,
   tier_level: 1,
  plan_order: 0,
  plan_thumbnail_file: null,
  badge_thumbnail_file: null,
  plan_thumbnail_preview: '',
  badge_thumbnail_preview: '',
})

const featuresText = ref('')
const planLoading = ref(false)

const currentPayload = reactive({
  info: null,
  user: null,
})

const socialPlatforms = ref([])
const socialLinks = ref([])
const showSocialForm = ref(false)
const socialStatus = reactive({
  message: '',
  type: 'success',
})
const payoutStatus = reactive({
  message: '',
  type: 'success',
})
const socialForm = reactive({
  id: null,
  social_media_platform_id: '',
  profile_url: '',
  description: '',
  status: true,
})
const payoutForm = reactive({
  first_name: '',
  last_name: '',
  email: '',
  address: '',
  pan_number: '',
  govt_id_type: '',
  govt_id_file: null,
  govt_id_preview: '',
  payment_mode: 'bank',
  account_number: '',
  account_number_confirm: '',
  bank_name: '',
  ifsc: '',
  upi_id: '',
})
const govtIdOptions = ['Aadhaar Card', 'Pancard', 'Driving License', 'Passport']

const headerAvatar = ref(DEFAULT_AVATAR)
const headerTagline = ref(DEFAULT_TAGLINE)

const handleAddPost = () => {
  router.push({ name: 'CreatorCreatePost', params: { username: username.value } })
}

const slugify = (value) =>
  value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const onAvatarChange = (event) => {
  const file = event.target.files?.[0]
  form.avatarFile = file || null
  if (file) {
    form.avatarPreview = URL.createObjectURL(file)
  } else {
    form.avatarPreview = ''
  }
}

const normalizeDate = (value) => {
  if (!value) return ''
  // handle ISO strings or Date objects
  const date = typeof value === 'string' ? value.split('T')[0] : value
  return date instanceof Date
    ? date.toISOString().split('T')[0]
    : date
}

const setFormFromData = (info = {}, user = {}) => {
  const resolveAvatar = (url) => {
    if (!url) return ''
    if (url.startsWith('http')) return url
    const base = API_BASE_URL.replace(/\/api$/, '')
    return `${base}${url}`
  }

  form.firstName = info.first_name || ''
  form.lastName = info.last_name || ''
  form.dob = normalizeDate(info.dob)
  form.contactNumber = info.contact_number || ''
  form.altContactNumber = info.alt_contact_number || ''
  form.altEmail = info.alt_email || ''
  form.address = info.address || ''
  form.tagline = info.tagline || ''
  form.bio = user.bio || ''
  form.avatarFile = null
  form.avatarPreview = resolveAvatar(user.avatar_url || '')

  headerAvatar.value = form.avatarPreview || DEFAULT_AVATAR
  headerTagline.value = form.tagline || DEFAULT_TAGLINE

  currentPayload.info = info
  currentPayload.user = user
}

const hydrateFromCache = () => {
  try {
    const cachedInfo = JSON.parse(localStorage.getItem('user_information') || '{}')
    const cachedUser = JSON.parse(localStorage.getItem('user') || '{}')
    if (Object.keys(cachedInfo).length || Object.keys(cachedUser).length) {
      setFormFromData(cachedInfo, cachedUser)
    }
  } catch (e) {
    // ignore cache issues
  }
}

const loadAccount = async () => {
  try {
    const { data } = await api.get('/user-information')
    const payload = data.data || data
    setFormFromData(payload.information || {}, payload.user || {})
    localStorage.setItem('user_information', JSON.stringify(payload.information || {}))
    const cachedUser = JSON.parse(localStorage.getItem('user') || '{}')
    localStorage.setItem('user', JSON.stringify({ ...cachedUser, ...(payload.user || {}) }))
    // If core fields are still empty, hydrate from profile endpoint
    if (!(payload?.information?.first_name || payload?.information?.contact_number || payload?.information?.dob)) {
      const profile = await api.get('/auth/profile')
      const user = profile?.data?.data || {}
      setFormFromData(payload.information || {}, user || {})
      localStorage.setItem('user', JSON.stringify({ ...cachedUser, ...user }))
    }
    status.message = ''
  } catch (error) {
    status.message = 'Could not load account information.'
    status.type = 'error'
    console.error(error)
    hydrateFromCache()
  }
}

const saveAccount = async () => {
  status.message = ''
  const formData = new FormData()
  formData.append('first_name', form.firstName)
  formData.append('last_name', form.lastName)
  formData.append('dob', form.dob)
  formData.append('contact_number', form.contactNumber)
  formData.append('alt_contact_number', form.altContactNumber)
  formData.append('alt_email', form.altEmail)
  formData.append('address', form.address)
  formData.append('tagline', form.tagline)
  formData.append('bio', form.bio)
  if (form.avatarFile) {
    formData.append('avatar', form.avatarFile)
  }

  try {
    const { data } = await api.post('/user-information', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    const payload = data.data || data
    setFormFromData(payload.information || {}, payload.user || {})
    status.message = 'Account details saved successfully.'
    status.type = 'success'
  } catch (error) {
    console.error(error)
    status.message = 'Failed to save account details.'
    status.type = 'error'
  }
}

const resetForm = () => {
  setFormFromData(currentPayload.info || {}, currentPayload.user || {})
}

const currentTabLabel = computed(() => tabs.find(t => t.key === activeTab.value)?.label || '')

const onAvatarError = () => {
  form.avatarPreview = DEFAULT_AVATAR
  headerAvatar.value = DEFAULT_AVATAR
}

const resolveMedia = (url) => {
  if (!url) return ''
  if (url.startsWith('http')) return url
  const base = API_BASE_URL.replace(/\/api$/, '')
  return `${base}${url}`
}

const platformName = (id) => {
  const found = socialPlatforms.value.find(p => p.id === id)
  return found ? found.name : 'Unknown'
}

const setPlanForm = (plan = null) => {
  subscriptionForm.id = plan?.id || null
  subscriptionForm.name = plan?.name || ''
  subscriptionForm.subtitle = plan?.subtitle || ''
  subscriptionForm.slug = plan?.slug || slugify(plan?.name || '')
  subscriptionForm.description = plan?.description || ''
  subscriptionForm.monthly_price = plan?.monthly_price ? Number(plan.monthly_price) : ''
  subscriptionForm.quarterly_price = plan?.quarterly_price ? Number(plan.quarterly_price) : ''
  subscriptionForm.half_yearly_price = plan?.half_yearly_price ? Number(plan.half_yearly_price) : ''
  subscriptionForm.yearly_price = plan?.yearly_price ? Number(plan.yearly_price) : ''
  subscriptionForm.features = plan?.features || []
  subscriptionForm.is_active = plan?.is_active ?? true
  subscriptionForm.tier_level = plan?.tier_level ? Number(plan.tier_level) : 1
  subscriptionForm.plan_order = plan?.plan_order ?? 0
  subscriptionForm.plan_thumbnail_file = null
  subscriptionForm.badge_thumbnail_file = null
  subscriptionForm.plan_thumbnail_preview = resolveMedia(plan?.plan_thumbnail_url || '')
  subscriptionForm.badge_thumbnail_preview = resolveMedia(plan?.badge_thumbnail_url || '')
  featuresText.value = (plan?.features || []).join('\n')
}

const loadPlans = async () => {
  planStatus.message = ''
  planLoading.value = true
  try {
    const { data } = await subscriptionService.getAll(1, 50)
    const list = data?.data || data?.data?.data || []
    plans.value = list
    setPlanForm(list[0] || null)
  } catch (err) {
    planStatus.message = 'You dont have any active subscription plan.'
    planStatus.type = 'error'
  } finally {
    planLoading.value = false
  }
}

const savePlan = async () => {
  planStatus.message = ''
  planLoading.value = true
  const formData = new FormData()
  formData.append('name', subscriptionForm.name)
  formData.append('subtitle', subscriptionForm.subtitle || '')
  formData.append('slug', subscriptionForm.slug || slugify(subscriptionForm.name))
  formData.append('description', subscriptionForm.description)
  formData.append('monthly_price', subscriptionForm.monthly_price || 0)
  formData.append('quarterly_price', subscriptionForm.quarterly_price || 0)
  formData.append('half_yearly_price', subscriptionForm.half_yearly_price || 0)
  formData.append('yearly_price', subscriptionForm.yearly_price || 0)
  formData.append('plan_order', subscriptionForm.plan_order ?? 0)
  formData.append('tier_level', subscriptionForm.tier_level || 1)
  formData.append('is_active', subscriptionForm.is_active ? 1 : 0)
  featuresText.value.split('\n').map(f => f.trim()).filter(Boolean).forEach(f => formData.append('features[]', f))
  if (subscriptionForm.plan_thumbnail_file) {
    formData.append('plan_thumbnail', subscriptionForm.plan_thumbnail_file)
  }
  if (subscriptionForm.badge_thumbnail_file) {
    formData.append('badge_thumbnail', subscriptionForm.badge_thumbnail_file)
  }

  try {
    if (subscriptionForm.id) {
      await subscriptionService.update(subscriptionForm.id, formData)
      planStatus.message = 'Subscription updated successfully.'
    } else {
      const { data } = await subscriptionService.create(formData)
      setPlanForm(data?.data || null)
      planStatus.message = 'Subscription created successfully.'
    }
    await loadPlans()
    planStatus.type = 'success'
  } catch (err) {
    planStatus.message = 'Failed to save subscription.'
    planStatus.type = 'error'
  } finally {
    planLoading.value = false
  }
}

const resetPlan = () => {
  setPlanForm(subscriptionForm.id ? { ...subscriptionForm, features: subscriptionForm.features } : null)
}

const onPlanThumbChange = (event) => {
  const file = event.target.files?.[0]
  subscriptionForm.plan_thumbnail_file = file || null
  subscriptionForm.plan_thumbnail_preview = file ? URL.createObjectURL(file) : subscriptionForm.plan_thumbnail_preview
}

const onBadgeThumbChange = (event) => {
  const file = event.target.files?.[0]
  subscriptionForm.badge_thumbnail_file = file || null
  subscriptionForm.badge_thumbnail_preview = file ? URL.createObjectURL(file) : subscriptionForm.badge_thumbnail_preview
}

const resetSocialForm = () => {
  socialForm.id = null
  socialForm.social_media_platform_id = ''
  socialForm.profile_url = ''
  socialForm.description = ''
  socialForm.status = true
}

const openSocialForm = (link = null) => {
  if (link) {
    socialForm.id = link.id || null
    socialForm.social_media_platform_id = link.social_media_platform_id
    socialForm.profile_url = link.profile_url
    socialForm.description = link.description || ''
    socialForm.status = !!link.status
  } else {
    resetSocialForm()
  }
  showSocialForm.value = true
}

const cancelSocialForm = () => {
  resetSocialForm()
  showSocialForm.value = false
}

const loadSocialPlatforms = async () => {
  try {
    const { data } = await api.get('/social-media-platforms')
    socialPlatforms.value = data?.data || data || []
  } catch (error) {
    console.error(error)
  }
}

const loadSocialLinks = async () => {
  try {
    const { data } = await api.get('/social-links')
    socialLinks.value = data?.data || data || []
  } catch (error) {
    console.error(error)
  }
}

const saveSocialLink = async () => {
  socialStatus.message = ''
  try {
    await api.post('/social-links', {
      social_media_platform_id: socialForm.social_media_platform_id,
      profile_url: socialForm.profile_url,
      description: socialForm.description,
      status: socialForm.status ? 1 : 0,
    })
    socialStatus.message = 'Social link saved.'
    socialStatus.type = 'success'
    await loadSocialLinks()
    cancelSocialForm()
  } catch (error) {
    console.error(error)
    socialStatus.message = 'Could not save social link.'
    socialStatus.type = 'error'
  }
}

const onGovtIdImageChange = (event) => {
  const file = event.target.files?.[0]
  payoutForm.govt_id_file = file || null
  payoutForm.govt_id_preview = file ? URL.createObjectURL(file) : ''
}

const onPanInput = () => {
  payoutForm.pan_number = payoutForm.pan_number.toUpperCase().slice(0, 10)
  const pattern = /^[A-Z]{0,5}[0-9]{0,4}[A-Z]?$/ // allows partial typing
  if (!pattern.test(payoutForm.pan_number)) {
    payoutStatus.message = 'PAN format: 5 letters, 4 digits, 1 letter (e.g., BHGPM8524H).'
    payoutStatus.type = 'error'
  } else {
    payoutStatus.message = ''
  }
}

const savePayout = () => {
  payoutStatus.message = ''
  if (payoutForm.payment_mode === 'bank' && payoutForm.account_number !== payoutForm.account_number_confirm) {
    payoutStatus.message = 'Account numbers do not match.'
    payoutStatus.type = 'error'
    return
  }

  const formData = new FormData()
  formData.append('first_name', payoutForm.first_name)
  formData.append('last_name', payoutForm.last_name)
  formData.append('email', payoutForm.email)
  formData.append('address', payoutForm.address)
  formData.append('pan_number', payoutForm.pan_number)
  formData.append('govt_id_type', payoutForm.govt_id_type)
  formData.append('payment_mode', payoutForm.payment_mode)
  if (payoutForm.payment_mode === 'bank') {
    formData.append('account_number', payoutForm.account_number)
    formData.append('account_number_confirm', payoutForm.account_number_confirm)
    formData.append('bank_name', payoutForm.bank_name)
    formData.append('ifsc', payoutForm.ifsc)
  } else {
    formData.append('upi_id', payoutForm.upi_id)
  }
  if (payoutForm.govt_id_file) {
    formData.append('govt_id_image', payoutForm.govt_id_file)
  }

  api.post('/payout-settings', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
    .then(({ data }) => {
      const payload = data?.data || data || {}
      if (payload.govt_id_url) {
        payoutForm.govt_id_preview = resolveMedia(payload.govt_id_url)
      }
      payoutStatus.message = 'Payout details saved.'
      payoutStatus.type = 'success'
    })
    .catch((error) => {
      console.error(error)
      payoutStatus.message = 'Failed to save payout details.'
      payoutStatus.type = 'error'
    })
}

const resetPayout = () => {
  payoutForm.first_name = ''
  payoutForm.last_name = ''
  payoutForm.email = ''
  payoutForm.address = ''
  payoutForm.pan_number = ''
  payoutForm.govt_id_type = ''
  payoutForm.govt_id_file = null
  payoutForm.govt_id_preview = ''
  payoutForm.payment_mode = 'bank'
  payoutForm.account_number = ''
  payoutForm.account_number_confirm = ''
  payoutForm.bank_name = ''
  payoutForm.ifsc = ''
  payoutForm.upi_id = ''
}

const loadPayout = async () => {
  try {
    const { data } = await api.get('/payout-settings')
    const payload = data?.data || data || {}
    if (!Object.keys(payload).length) return
    payoutForm.first_name = payload.first_name || ''
    payoutForm.last_name = payload.last_name || ''
    payoutForm.email = payload.email || ''
    payoutForm.address = payload.address || ''
    payoutForm.pan_number = payload.pan_number || ''
    payoutForm.govt_id_type = payload.govt_id_type || ''
    payoutForm.payment_mode = payload.payment_mode || 'bank'
    payoutForm.account_number = payload.account_number || ''
    payoutForm.account_number_confirm = payload.account_number || ''
    payoutForm.bank_name = payload.bank_name || ''
    payoutForm.ifsc = payload.ifsc || ''
    payoutForm.upi_id = payload.upi_id || ''
    payoutForm.govt_id_preview = payload.govt_id_url ? resolveMedia(payload.govt_id_url) : ''
  } catch (e) {
    console.error(e)
  }
}

onMounted(() => {
  loadAccount()
  loadPlans()
  loadSocialPlatforms()
  loadSocialLinks()
  loadPayout()
})
</script>

<style scoped>
.creator-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #fce5dc 0%, #ffffff 40%);
  color: #55423d;
  font-family: 'Trebuchet MS', 'Lucida Sans Unicode', 'Lucida Grande', 'Lucida Sans', Arial, sans-serif;
  padding: 24px;
}

.creator-page :deep(*) {
  font-family: inherit;
}

.settings-layout {
  display: grid;
  grid-template-columns: 1fr 4fr;
  gap: 20px;
  margin-top: 12px;
  min-height: 100vh;
}

.tabs {
  background: #fde9df;
  border-radius: 16px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 200px;
}

.tab {
  text-align: left;
  border: none;
  background: transparent;
  padding: 10px 12px;
  border-radius: 12px;
  font-weight: 700;
  color: #6d4f43;
  cursor: pointer;
  transition: all 0.15s ease;
}

.tab:hover {
  background: #f7d1c4;
}

.tab.active {
  background: linear-gradient(135deg, #f5a7a8, #f7c8b4);
  color: #fff;
  box-shadow: 0 6px 12px rgba(0,0,0,0.12);
}

.tab-content {
  background: #fff;
  border-radius: 18px;
  padding: 18px;
  box-shadow: 0 10px 18px rgba(0,0,0,0.08);
}

.card h3 {
  margin: 0 0 4px;
  font-size: 22px;
}

.muted {
  margin: 0 0 12px;
  color: #8a6457;
  font-size: 14px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 12px 16px;
}

label {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-weight: 600;
}

input,
textarea {
  border: 1px solid #e6cfc0;
  border-radius: 10px;
  padding: 10px 12px;
  background: #fff7f2;
  color: #55423d;
}

input:focus,
textarea:focus {
  outline: 2px solid #f5a7a8;
}

select {
  border: 1px solid #e6cfc0;
  border-radius: 14px;
  padding: 10px 42px 10px 14px;
  background: #fff;
  color: #55423d;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg width='14' height='9' viewBox='0 0 14 9' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L7 7.5L13 1.5' stroke='%237a5b4f' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 14px center;
  background-size: 14px;
  transition: box-shadow 0.2s ease, transform 0.15s ease, border-color 0.2s ease;
}

select:focus {
  outline: none;
  border-color: #f5a7a8;
  box-shadow: 0 6px 14px rgba(0,0,0,0.08);
  transform: translateY(-1px);
}

select:hover {
  border-color: #f5a7a8;
  box-shadow: 0 4px 12px rgba(0,0,0,0.06);
}

:deep(select option) {
  padding: 10px 12px;
  background: #fff7f2;
  color: #55423d;
}

:deep(select option:hover) {
  background: #fbe0d7;
  color: #4a362d;
}

.full {
  grid-column: 1 / -1;
}

.actions {
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: flex-start;
}

.primary {
  background: linear-gradient(135deg, #f5a7a8, #f7c8b4);
  color: #fff;
  border: none;
  padding: 10px 16px;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 700;
  box-shadow: 0 6px 12px rgba(0,0,0,0.12);
}

.ghost {
  background: transparent;
  color: #6d4f43;
  border: 1px solid #e6cfc0;
  padding: 10px 16px;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 700;
}

.avatar-preview {
  margin-top: 8px;
  padding: 8px;
  border: 1px dashed #e6cfc0;
  border-radius: 10px;
  background: #fffaf7;
}

.avatar-preview img {
  max-width: 160px;
  border-radius: 12px;
  box-shadow: 0 6px 12px rgba(0,0,0,0.12);
}

.placeholder {
  min-height: 200px;
  display: grid;
  align-items: center;
}

.status {
  margin: 8px 0 12px;
  padding: 10px 12px;
  border-radius: 12px;
  font-weight: 700;
}

.status.success {
  background: #e6f7e9;
  color: #2f7a3d;
  border: 1px solid #b6e2c1;
}

.status.error {
  background: #ffecec;
  color: #b3261e;
  border: 1px solid #f5c2c0;
}

.switch-field {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-top: 8px;
}

.toggle-btn {
  width: 48px;
  height: 26px;
  border-radius: 20px;
  background: #e6cfc0;
  position: relative;
  cursor: pointer;
  transition: background 0.2s ease;
  border: none;
}

.toggle-btn .dot {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #fff;
  position: absolute;
  top: 4px;
  left: 5px;
  transition: transform 0.2s ease;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

.toggle-btn.active {
  background: #f5a7a8;
}

.toggle-btn.active .dot {
  transform: translateX(20px);
}

.plan-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.pill {
  border: none;
  background: #f7d1c4;
  color: #5a4035;
  padding: 8px 12px;
  border-radius: 999px;
  font-weight: 700;
  cursor: pointer;
}

.pill.active {
  background: linear-gradient(135deg, #f5a7a8, #f7c8b4);
  color: #fff;
}

.ghost-pill {
  background: transparent;
  border: 1px dashed #e6cfc0;
}

.social-card .add-button {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  border: 2px dashed #f5a7a8;
  background: #fff7f2;
  color: #f06d7b;
  font-size: 28px;
  display: grid;
  place-items: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.social-card .add-button:hover {
  background: #ffe3da;
  box-shadow: 0 10px 18px rgba(0,0,0,0.08);
}

.social-card .plus {
  line-height: 1;
}

.empty-social {
  display: grid;
  place-items: center;
  gap: 10px;
  padding: 32px 0;
  text-align: center;
}

.social-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 12px;
}

.social-row {
  padding: 12px;
  border: 1px solid #f1d6c9;
  border-radius: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fffaf7;
  gap: 12px;
}

.platform-name {
  font-weight: 700;
  color: #5a4035;
}

.platform-url {
  color: #f06d7b;
  font-size: 14px;
  word-break: break-all;
}

.row-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.social-form {
  margin-top: 8px;
}

.pill {
  border-radius: 999px;
}

.pill.active {
  background: #d7f4dd;
  color: #2f7a3d;
}
.status-text{
  position: relative;
  top: 5px;
}

.warning {
  color: #b85c24;
}

.payout-mode {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.payout-mode .label {
  font-weight: 700;
  color: #6d4f43;
}

.mode-buttons {
  display: flex;
  gap: 12px;
}

.mode-option {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-radius: 18px;
  border: 2px solid #f7d1c4;
  background: #fff7f2;
  color: #5a4035;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.18s ease;
}

.mode-option .mode-dot {
  width: 14px;
  height: 14px;
  border-radius: 999px;
  border: 2px solid #f5a7a8;
  display: inline-block;
  position: relative;
}

.mode-option.active {
  background: linear-gradient(135deg, #f5a7a8, #f7c8b4);
  border-color: #f5a7a8;
  color: #fff;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12);
}

.mode-option.active .mode-dot {
  border-color: #fff;
}

.mode-option.active .mode-dot::after {
  content: '';
  position: absolute;
  inset: 3px;
  border-radius: 999px;
  background: #fff;
  opacity: 0.9;
}

.mode-option:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
}

@media (max-width: 900px) {
  .settings-layout {
    grid-template-columns: 1fr;
  }

  .tabs {
    flex-direction: row;
    flex-wrap: wrap;
  }

  .tab {
    flex: 1 1 45%;
    text-align: center;
  }
}
</style>
