import api from './api'

export const authService = {
  register(data) {
    return api.post('/auth/register', data)
  },

  login(email, password) {
    return api.post('/auth/login', { email, password })
  },

  logout() {
    return api.post('/auth/logout')
  },

  getProfile() {
    return api.get('/auth/profile')
  },

  updateProfile(data) {
    return api.put('/auth/profile', data)
  },
}

export const subscriptionService = {
  getAll(page = 1, perPage = 15) {
    return api.get('/subscriptions', {
      params: { page, per_page: perPage },
    })
  },

  create(data) {
    const isFormData = data instanceof FormData
    return api.post('/subscriptions', data, isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : undefined)
  },

  get(id) {
    return api.get(`/subscriptions/${id}`)
  },

  update(id, data) {
    const isFormData = data instanceof FormData
    const method = isFormData ? 'post' : 'put'
    const url = isFormData ? `/subscriptions/${id}?_method=PUT` : `/subscriptions/${id}`
    return api[method](url, data, isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : undefined)
  },

  delete(id) {
    return api.delete(`/subscriptions/${id}`)
  },

  getMine() {
    return api.get('/my-subscriptions')
  },
}

export const contentService = {
  getAll(page = 1, perPage = 15) {
    return api.get('/content', {
      params: { page, per_page: perPage },
    })
  },

  create(data) {
    const isFormData = data instanceof FormData
    return api.post('/content', data, isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : undefined)
  },

  get(id) {
    return api.get(`/content/${id}`)
  },

  update(id, data) {
    const isFormData = data instanceof FormData
    const method = isFormData ? 'post' : 'put'
    const url = isFormData ? `/content/${id}?_method=PUT` : `/content/${id}`
    return api[method](url, data, isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : undefined)
  },

  publish(id) {
    return api.post(`/content/${id}/publish`)
  },

  delete(id) {
    return api.delete(`/content/${id}`)
  },
}

export const billingService = {
  get() {
    return api.get('/billing-details')
  },
  save(data) {
    return api.post('/billing-details', data)
  },
}

export const checkoutService = {
  createIntent(subscriptionSlug, billingPeriod) {
    return api.post('/checkout/intent', {
      subscription_slug: subscriptionSlug,
      billing_period: billingPeriod,
    })
  },
  getPublicPlan(slug) {
    return api.get(`/public/subscription/${slug}`)
  },
  complete(paymentId, paymentIntentId = '') {
    return api.post('/checkout/complete', { payment_id: paymentId, payment_intent: paymentIntentId })
  },
}

export const creatorSubscriberService = {
  getAll(page = 1, perPage = 24) {
    return api.get('/creator-subscribers', { params: { page, per_page: perPage } })
  },
}
