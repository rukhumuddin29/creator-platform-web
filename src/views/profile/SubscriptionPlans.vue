<template>
  <div class="plans-page">
    <header class="page-head">
      <h2>Subscription Plans</h2>
      <p class="muted">Choose the right plan for {{ username }}</p>
    </header>

    <div v-if="loading" class="status muted">Loading plans...</div>
    <div v-else-if="error" class="status error">{{ error }}</div>

    <div class="plan-grid" v-else>
      <div v-for="plan in plans" :key="plan.id" class="plan-card">
        <div class="plan-thumb" v-if="plan.plan_thumbnail_url">
          <img :src="resolveMedia(plan.plan_thumbnail_url)" :alt="plan.name" />
        </div>
        <h5>{{ plan.name }}</h5>
        <p class="muted" v-if="plan.subtitle">{{ plan.subtitle }}</p>

        <div class="badge" v-if="plan.badge_thumbnail_url">
          <span class="badge-title">Subscription Badge</span>
          <img :src="resolveMedia(plan.badge_thumbnail_url)" :alt="`${plan.name} badge`" />
        </div>

        <ul class="features" v-if="Array.isArray(plan.features)">
          <li v-for="(feat, i) in plan.features" :key="feat + i">• {{ feat }}</li>
        </ul>

        <label class="price-select">
          Pricing
          <select>
            <option v-if="plan.monthly_price" :value="plan.monthly_price">
              Monthly (1 Month) - {{ formatPrice(plan.monthly_price) }}
            </option>
            <option v-if="plan.quarterly_price" :value="plan.quarterly_price">
              Quarterly (3 Months) - {{ formatPrice(plan.quarterly_price) }}
            </option>
            <option v-if="plan.half_yearly_price" :value="plan.half_yearly_price">
              Half Yearly (6 Months) - {{ formatPrice(plan.half_yearly_price) }}
            </option>
            <option v-if="plan.yearly_price" :value="plan.yearly_price">
              Yearly (12 Months) - {{ formatPrice(plan.yearly_price) }}
            </option>
          </select>
        </label>

        <button class="primary w-full">Subscribe Now</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import api, { API_BASE_URL } from '../../services/api'

const route = useRoute()
const username = route.params.username

const plans = ref([])
const loading = ref(true)
const error = ref('')

const resolveMedia = (url = '') => {
  if (!url) return ''
  const cleaned = url.toString().trim()
  if (cleaned.startsWith('http')) return cleaned
  const base = API_BASE_URL.replace(/\/api$/, '')
  return `${base}${cleaned.startsWith('/') ? '' : '/'}${cleaned}`
}

const formatPrice = (val) => {
  if (val === null || val === undefined || val === '') return 'N/A'
  const num = Number(val)
  return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const loadPlans = async () => {
  loading.value = true
  error.value = ''
  const endpoints = [
    `/public/creator/${username}/plans`,
    `/public/subscriptions/${username}`,
  ]

  for (const path of endpoints) {
    try {
      const { data } = await api.get(path)
      const list = data?.data || []
      if (Array.isArray(list) && list.length) {
        plans.value = list.filter((p) => p.is_active !== false)
        break
      }
    } catch (e) {
      error.value = 'Could not load plans.'
    }
  }

  if (!plans.value.length && !error.value) {
    error.value = 'No plans available.'
  }

  loading.value = false
}

onMounted(loadPlans)
</script>

<style scoped>
.plans-page {
  min-height: 100vh;
  padding: 32px 20px 48px;
  background: linear-gradient(180deg, #fce5dc 0%, #fff6f2 100%);
  color: #2d1b16;
}

.page-head h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 800;
}

.page-head{
  text-align: center;
}

.muted {
  color: #8a6a5c;
}

.status {
  padding: 12px;
  border-radius: 12px;
  border: 1px solid #f1d8cb;
  background: #fff;
  max-width: 680px;
  margin-top: 12px;
}

.status.error {
  color: #b3261e;
  background: #ffecec;
}

.plan-grid {
  margin-top: 20px;
  display: grid;
  grid-template-columns: repeat(3, minmax(260px, 1fr));
  gap: 16px;
  justify-content: center;
  justify-items: center;
}

@media (max-width: 1100px) {
  .plan-grid {
    grid-template-columns: repeat(2, minmax(260px, 1fr));
  }
}

@media (max-width: 720px) {
  .plan-grid {
    grid-template-columns: 1fr;
  }
}

.plan-card {
  background: #fff;
  border: 1px solid #f1d8cb;
  border-radius: 14px;
  padding: 12px;
  display: grid;
  gap: 8px;
  box-shadow: 0 12px 20px rgba(0,0,0,0.06);
  max-width: 500px;
}

.plan-card h5 {
  margin: 0;
  font-size: 18px;
  font-weight: 800;
  text-align: center;
}

.plan-thumb {
  display: flex;
  justify-content: center;
}

.plan-thumb img,
.badge img {
  border-radius: 10px;
}

.plan-thumb img {
  max-height: 260px;
}

.badge img {
  max-height: 40px;
}

.badge-title {
  display: block;
  font-size: 12px;
  color: #8a6a5c;
  margin-bottom: 4px;
  font-weight: 700;
}

.features {
  list-style: none;
  padding: 0;
  margin: 0;
  color: #5a4035;
  font-size: 15px;
  font-weight: 600;
  border: dashed 1px #5a4035;
  padding: 5px 10px;
  border-radius: 5px;
}

.features li + li {
  margin-top: 2px;
}

.price-select select {
  width: 100%;
  background: #fff;
  color: #2d1b16;
  border: 1px solid #f1d8cb;
  border-radius: 10px;
  padding: 8px 10px;
}

.primary.w-full {
  width: 100%;
  border: none;
  background: linear-gradient(135deg, #f5a7a8, #f7c8b4);
  color: #2d1b16;
  padding: 10px 12px;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 800;
}

@media (min-width: 1200px) {
  .plan-card {
    min-width: 500px;
  }
}

@media (max-width: 640px) {
  .plans-page {
    padding: 24px 14px 32px;
  }
}
</style>
