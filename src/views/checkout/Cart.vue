<template>
  <div class="cart-page">
    <div class="card">
      <div class="card-header">
        <div>
          <p class="eyebrow">Checkout</p>
          <h2>{{ plan?.name || 'Subscription' }}</h2>
          <p class="muted">Complete your purchase for {{ username }}.</p>
        </div>
        <div class="pill">{{ selectedPeriodLabel }}</div>
      </div>

      <div v-if="status.message" class="status" :class="status.type">{{ status.message }}</div>

      <div class="grid">
        <div class="plan-panel">
          <div class="plan-thumb" v-if="plan?.plan_thumbnail_url">
            <img :src="resolveMedia(plan.plan_thumbnail_url)" :alt="plan.name">
          </div>
          <h3>{{ plan?.name }}</h3>
          <p class="muted" v-if="plan?.subtitle">{{ plan.subtitle }}</p>

          <label>
            Billing period
            <select v-model="billingPeriod">
              <option
                v-for="option in billingOptions"
                :key="option.value"
                :value="option.value"
              >
                {{ option.label }}
              </option>
            </select>
          </label>

          <div class="price">
            <span>Total</span>
            <strong>{{ formattedAmount }}</strong>
          </div>
        </div>

        <form class="billing-form" @submit.prevent="submitCheckout">
          <div class="form-grid">
            <label>
              First name
              <input v-model="form.first_name" type="text" required autocomplete="given-name">
            </label>
            <label>
              Last name
              <input v-model="form.last_name" type="text" autocomplete="family-name">
            </label>
            <label class="full">
              Email
              <input v-model="form.email" type="email" required autocomplete="email">
            </label>
            <label class="full">
              Phone
              <input v-model="form.phone" type="tel" autocomplete="tel">
            </label>
            <label class="full">
              Address line 1
              <input v-model="form.address_line1" type="text" autocomplete="address-line1">
            </label>
            <label class="full">
              Address line 2
              <input v-model="form.address_line2" type="text" autocomplete="address-line2">
            </label>
            <label>
              City
              <input v-model="form.city" type="text" autocomplete="address-level2">
            </label>
            <label>
              State / Region
              <input v-model="form.state" type="text" autocomplete="address-level1">
            </label>
            <label>
              Postal code
              <input v-model="form.postal_code" type="text" autocomplete="postal-code">
            </label>
            <label>
              Country
              <input v-model="form.country" type="text" autocomplete="country-name">
            </label>
          </div>

          <div class="card-block">
            <label class="full">
              Card details
              <div ref="cardContainer" class="card-element"></div>
            </label>
            <small class="muted">We do not store your card. Payments are processed by Stripe.</small>
          </div>

          <div class="actions">
            <button type="submit" class="primary" :disabled="loading || processingPayment">
              <span v-if="loading || processingPayment" class="spinner"></span>
              {{ processingPayment ? 'Confirming payment...' : 'Proceed to payment' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { loadStripe } from '@stripe/stripe-js'
import { billingService, checkoutService } from '../../services'
import api from '../../services/api'

const route = useRoute()
const router = useRouter()
const username = route.params.username
const planSlug = route.params.slug
const checkoutType = computed(() => {
  const t = (route.query.type || '').toString().toLowerCase()
  return t === 'ppv' ? 'ppv' : 'subscription'
})
const queryPrice = computed(() => {
  const val = route.query.price
  const num = Number(val)
  return Number.isFinite(num) && num > 0 ? num : null
})

const status = reactive({ message: '', type: 'success' })
const plan = ref(null)
const billingPeriod = ref('monthly')
const loading = ref(false)
const processingPayment = ref(false)
const stripe = ref(null)
const elements = ref(null)
const card = ref(null)
const clientSecret = ref('')
const publishableKey = ref('')
const cardMounted = ref(false)
const paymentId = ref(null)
const cardContainer = ref(null)
const form = reactive({
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  address_line1: '',
  address_line2: '',
  city: '',
  state: '',
  postal_code: '',
  country: '',
})

const billingOptions = computed(() => {
  const options = []
  if (checkoutType.value === 'ppv') {
    const price =
      queryPrice.value ??
      plan.value?.ppv_price ??
      plan.value?.price ??
      plan.value?.amount
    if (price) {
      options.push({ value: 'one_time', label: `One-time - ${formatPrice(price)}`, amount: Number(price) })
    }
    return options
  }
  if (!plan.value) return options
  if (plan.value.monthly_price) options.push({ value: 'monthly', label: `Monthly - ${formatPrice(plan.value.monthly_price)}`, amount: Number(plan.value.monthly_price) })
  if (plan.value.quarterly_price) options.push({ value: 'quarterly', label: `Quarterly - ${formatPrice(plan.value.quarterly_price)}`, amount: Number(plan.value.quarterly_price) })
  if (plan.value.half_yearly_price) options.push({ value: 'half_yearly', label: `Half-yearly - ${formatPrice(plan.value.half_yearly_price)}`, amount: Number(plan.value.half_yearly_price) })
  if (plan.value.yearly_price) options.push({ value: 'yearly', label: `Yearly - ${formatPrice(plan.value.yearly_price)}`, amount: Number(plan.value.yearly_price) })
  return options
})

const selectedPeriodLabel = computed(() => {
  const found = billingOptions.value.find(o => o.value === billingPeriod.value)
  return found ? found.label : 'Billing'
})

const formattedAmount = computed(() => {
  const opt = billingOptions.value.find(o => o.value === billingPeriod.value)
  if (!opt) return ''
  if (opt.amount) return formatPrice(opt.amount)
  const parts = opt.label.split(' - ')
  return parts[1] || ''
})

const resolveMedia = (url = '') => {
  if (!url) return ''
  if (url.startsWith('http')) return url
  const base = import.meta.env.VITE_BACKEND_URL?.replace(/\/api$/, '') || ''
  return `${base}${url.startsWith('/') ? '' : '/'}${url}`
}

const formatPrice = (val) => {
  const num = Number(val || 0)
  return num.toLocaleString(undefined, { style: 'currency', currency: 'USD' })
}

const loadPlan = async () => {
  if (checkoutType.value === 'ppv') {
    // Build plan using query price first, then attempt to hydrate from public list (optional)
    let price = Number(queryPrice.value || 0)
    let thumb = ''
    let title = planSlug
    try {
      const { data } = await api.get(`/public/content/${username}`)
      const list = data?.data || []
      const post = list.find((p) => p.slug === planSlug)
      if (post) {
        title = post.title || title
        price = Number(post.ppv_price || post.price || post.amount || price)
        thumb = post.thumbnail_url || post.media_url || thumb
      }
    } catch (e) {
      console.warn('PPV post fetch failed, using query price', e)
    }

    if (!price || Number.isNaN(price)) {
      status.message = 'Could not load checkout details.'
      status.type = 'error'
      return
    }
    plan.value = {
      name: title || 'PPV Post',
      slug: planSlug,
      ppv_price: price,
      plan_thumbnail_url: thumb,
      subtitle: 'Pay per view',
    }
    billingPeriod.value = 'one_time'
    publishableKey.value = import.meta.env.VITE_STRIPE_KEY || ''
    await mountCard()
    return
  }

  const { data } = await checkoutService.getPublicPlan(planSlug)
  plan.value = data?.data || data
  const opts = billingOptions.value
  if (opts.length) billingPeriod.value = opts[0].value
  publishableKey.value = import.meta.env.VITE_STRIPE_KEY || ''
  await mountCard()
}

const loadBilling = async () => {
  try {
    const { data } = await billingService.get()
    const detail = data?.data || data
    Object.assign(form, detail || {})
  } catch (e) {
    // ignore if no billing yet or not authed
  }
}

const submitCheckout = async () => {
  status.message = ''
  if (!plan.value) return
  await mountCard()
  loading.value = true
  try {
    await billingService.save(form)
  } catch (e) {
    status.message = 'Please log in to continue checkout.'
    status.type = 'error'
    loading.value = false
    return router.push('/login')
  }

  try {
    const billingArg = checkoutType.value === 'ppv' ? null : billingPeriod.value
    const { data } = await checkoutService.createIntent(
      plan.value.slug,
      billingArg,
      { type: checkoutType.value, post_slug: checkoutType.value === 'ppv' ? plan.value.slug : undefined }
    )
    clientSecret.value = data?.data?.client_secret || data?.client_secret
    publishableKey.value = data?.data?.publishable_key || data?.publishable_key || publishableKey.value
    paymentId.value = data?.data?.payment_id || data?.payment_id
    cardMounted.value = !!card.value
    await confirmPayment()
  } catch (e) {
    status.message = e.response?.data?.message || 'Unable to start payment.'
    status.type = 'error'
  } finally {
    loading.value = false
  }
}

const mountCard = async (force = false) => {
  if (cardMounted.value && !force) return
  if (!publishableKey.value) {
    throw new Error('Missing Stripe publishable key')
  }
  if (!stripe.value || force) {
    stripe.value = await loadStripe(publishableKey.value)
    elements.value = null
    card.value = null
    cardMounted.value = false
  }
  if (!elements.value) {
    elements.value = stripe.value.elements()
  }
  if (!card.value && cardContainer.value) {
    card.value = elements.value.create('card', { hidePostalCode: true })
    card.value.mount(cardContainer.value)
    cardMounted.value = true
  }
}

const confirmPayment = async () => {
  if (!stripe.value || !card.value || !clientSecret.value) {
    await mountCard(true)
  }
  processingPayment.value = true
  status.message = ''
  try {
    const { error, paymentIntent } = await stripe.value.confirmCardPayment(clientSecret.value, {
      payment_method: {
        card: card.value,
        billing_details: {
          name: `${form.first_name || ''} ${form.last_name || ''}`.trim(),
          email: form.email,
          phone: form.phone,
          address: {
            line1: form.address_line1,
            line2: form.address_line2,
            city: form.city,
            state: form.state,
            postal_code: form.postal_code,
            country: form.country,
          },
        },
      },
    })

    if (error) {
      status.message = error.message || 'Payment failed.'
      status.type = 'error'
    } else if (paymentIntent?.status === 'succeeded') {
      status.message = 'Payment successful! Your subscription is active.'
      status.type = 'success'
      if (paymentId.value) {
        try {
          await checkoutService.complete(paymentId.value, paymentIntent.id)
        } catch (e) {
          // ignore completion failure; subscription list might still refresh later
        }
      }
      setTimeout(() => {
        status.message = 'You are being redirected to your subscriptions...'
        status.type = 'success'
      }, 500)
      setTimeout(() => {
        router.push(`/subscriber/${username}/subscriptions`)
      }, 2000)
    } else {
      status.message = 'Payment status: ' + (paymentIntent?.status || 'unknown')
      status.type = 'error'
    }
  } catch (err) {
    status.message = err.message || 'Payment failed.'
    status.type = 'error'
  } finally {
    processingPayment.value = false
  }
}

onMounted(async () => {
  try {
    await loadPlan()
    await loadBilling()
  } catch (e) {
    status.message = 'Could not load checkout details.'
    status.type = 'error'
  }
})
</script>

<style scoped>
.cart-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #fce5dc 0%, #fff6f2 100%);
  padding: 28px 20px 40px;
  color: #2d1b16;
}

.card {
  max-width: 1080px;
  margin: 0 auto;
  background: #fff;
  border-radius: 18px;
  padding: 20px;
  box-shadow: 0 16px 32px rgba(0,0,0,0.08);
  border: 1px solid #f1d8cb;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: 800;
  margin: 0;
  color: #8a6a5c;
}

.pill {
  background: #fff3ed;
  padding: 8px 14px;
  border-radius: 999px;
  border: 1px solid #f5c7b2;
  font-weight: 700;
  color: #6a4338;
}

.muted {
  color: #8a6a5c;
  margin: 4px 0 0;
}

.grid {
  display: grid;
  grid-template-columns: 340px 1fr;
  gap: 20px;
  margin-top: 16px;
}

.plan-panel {
  background: linear-gradient(135deg, #fff7f2, #ffe8e0);
  border: 1px solid #f1d8cb;
  border-radius: 14px;
  padding: 12px;
  display: grid;
  gap: 10px;
}

.plan-thumb {
  display: flex;
  justify-content: center;
}

.plan-thumb img {
  max-width: 260px;
  border-radius: 10px;
  box-shadow: 0 10px 20px rgba(0,0,0,0.08);
}

.price {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 16px;
}

.price strong {
  font-size: 20px;
  color: #5a4035;
}

.billing-form {
  background: #fff7f2;
  border: 1px solid #f1d8cb;
  border-radius: 14px;
  padding: 14px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
}

.form-grid label {
  display: grid;
  gap: 6px;
  font-weight: 700;
  color: #5a4035;
}

.form-grid input,
select {
  width: 100%;
  border: 1px solid #e9cbbb;
  border-radius: 10px;
  padding: 10px;
  background: #fff;
  color: #2d1b16;
}

.card-block {
  margin-top: 10px;
}

.card-element {
  width: 100%;
  border: 1px solid #e9cbbb;
  border-radius: 10px;
  padding: 12px;
  background: #fff;
}

.full {
  grid-column: 1 / -1;
}

.actions {
  margin-top: 12px;
  text-align: right;
}

.primary {
  background: linear-gradient(135deg, #f5a7a8, #f7c8b4);
  color: #2d1b16;
  border: 1px solid #f1d8cb;
  padding: 12px 18px;
  border-radius: 12px;
  font-weight: 800;
  cursor: pointer;
}

.primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.status {
  margin: 8px 0 12px;
  padding: 10px 12px;
  border-radius: 12px;
  font-weight: 700;
  border: 1px solid transparent;
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

.spinner {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid rgba(255,255,255,0.5);
  border-top-color: #fff;
  display: inline-block;
  margin-right: 6px;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 960px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
</style>
