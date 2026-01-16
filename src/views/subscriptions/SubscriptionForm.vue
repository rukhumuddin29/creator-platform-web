<template>
  <div class="creator-page subscriptions-page">
    <div class="page-header">
      <div>
        <p class="eyebrow">Subscriptions</p>
        <h1>{{ isEditMode ? 'Edit Subscription' : 'Create New Subscription' }}</h1>
        <p class="muted">Configure pricing, description, and perks for your plan.</p>
      </div>
      <router-link to="/subscriptions" class="ghost-btn">← Back to list</router-link>
    </div>

    <section class="card">
      <form @submit.prevent="handleSubmit" class="form-grid">
        <label class="full">
          Plan name
          <input v-model="formData.name" type="text" required placeholder="Premium Tier" @input="syncSlug">
        </label>

        <label>
          Slug
          <input v-model="formData.slug" type="text" required placeholder="premium-tier">
          <small class="muted">Used in URLs — auto-filled from name, but you can adjust.</small>
        </label>

        <div class="switch-field">
          <label>
            <span>Status</span>
            <div class="toggle" :class="{ active: formData.is_active }" @click="formData.is_active = !formData.is_active">
              <div class="dot"></div>
            </div>
          </label>
          <span class="muted">{{ formData.is_active ? 'Active' : 'Inactive' }}</span>
        </div>

        <label class="full">
          Description
          <textarea v-model="formData.description" rows="3" required placeholder="Describe what's included"></textarea>
        </label>

        <label>
          Monthly price ($)
          <input v-model.number="formData.monthly_price" type="number" step="0.01" min="0" required placeholder="9.99">
        </label>

        <label>
          Yearly price ($)
          <input v-model.number="formData.yearly_price" type="number" step="0.01" min="0" required placeholder="99.99">
        </label>

        <label class="full">
          Features (one per line)
          <textarea
            v-model="featuresText"
            rows="4"
            placeholder="Ad-free content&#10;Exclusive videos&#10;Early access"
          ></textarea>
        </label>

        <div class="actions full">
          <button type="submit" class="primary" :disabled="isLoading">
            {{ isLoading ? 'Saving...' : 'Save Subscription' }}
          </button>
          <router-link to="/subscriptions" class="ghost-btn">Cancel</router-link>
        </div>
      </form>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useSubscriptionStore } from '../../stores/subscription'

const router = useRouter()
const route = useRoute()
const subscriptionStore = useSubscriptionStore()

const formData = ref({
  name: '',
  slug: '',
  description: '',
  monthly_price: null,
  yearly_price: null,
  features: [],
  is_active: true,
})

const featuresText = ref('')
const isLoading = ref(false)

const isEditMode = computed(() => !!route.params.id)

const slugify = (value) =>
  value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const syncSlug = () => {
  if (!isEditMode.value) {
    formData.value.slug = slugify(formData.value.name)
  }
}

onMounted(async () => {
  if (isEditMode.value) {
    try {
      await subscriptionStore.get(route.params.id)
      const sub = subscriptionStore.currentSubscription
      formData.value = {
        name: sub.name,
        slug: sub.slug,
        description: sub.description,
        monthly_price: Number(sub.monthly_price),
        yearly_price: Number(sub.yearly_price),
        features: sub.features || [],
        is_active: !!sub.is_active,
      }
      featuresText.value = (sub.features || []).join('\n')
    } catch (error) {
      alert('Failed to load subscription')
      router.back()
    }
  } else {
    syncSlug()
  }
})

const handleSubmit = async () => {
  isLoading.value = true
  try {
    const payload = {
      ...formData.value,
      features: featuresText.value.split('\n').map((f) => f.trim()).filter(Boolean),
    }

    if (isEditMode.value) {
      await subscriptionStore.update(route.params.id, payload)
    } else {
      await subscriptionStore.create(payload)
    }
    router.push('/subscriptions')
  } catch (error) {
    alert('Failed to save subscription')
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.creator-page.subscriptions-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #fce5dc 0%, #ffffff 40%);
  color: #55423d;
  font-family: 'Trebuchet MS', 'Lucida Sans Unicode', 'Lucida Grande', 'Lucida Sans', Arial, sans-serif;
  padding: 24px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 12px;
  color: #8a6457;
  margin: 0 0 6px;
}

.page-header h1 {
  margin: 0;
  font-size: 28px;
}

.muted {
  color: #8a6457;
  margin: 4px 0 0;
}

.card {
  background: #fff;
  border-radius: 18px;
  padding: 18px;
  box-shadow: 0 10px 18px rgba(0, 0, 0, 0.08);
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 14px 16px;
}

label {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-weight: 700;
  color: #5a4035;
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

small.muted {
  font-weight: 500;
}

.full {
  grid-column: 1 / -1;
}

.switch-field {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding-top: 8px;
}

.toggle {
  width: 48px;
  height: 26px;
  border-radius: 20px;
  background: #e6cfc0;
  position: relative;
  cursor: pointer;
  transition: background 0.2s ease;
}

.toggle .dot {
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

.toggle.active {
  background: #f5a7a8;
}

.toggle.active .dot {
  transform: translateX(20px);
}

.actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.primary {
  background: linear-gradient(135deg, #f5a7a8, #f7c8b4);
  color: #fff;
  border: none;
  padding: 12px 16px;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 700;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.12);
}

.primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.ghost-btn {
  background: transparent;
  color: #6d4f43;
  border: 1px solid #e6cfc0;
  padding: 10px 16px;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 700;
  text-decoration: none;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .actions {
    flex-wrap: wrap;
  }
}
</style>
