<template>
  <div class="min-h-screen bg-gray-50">
    <nav class="bg-white shadow mb-8">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <router-link to="/dashboard" class="text-blue-600 hover:underline">← Back to Dashboard</router-link>
      </div>
    </nav>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 class="text-3xl font-bold mb-8">Manage Your Subscriptions</h1>

      <div class="mb-4">
        <router-link
          to="/subscriptions/create"
          class="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
        >
          + Create New Subscription
        </router-link>
      </div>

      <div v-if="isLoading" class="text-center py-12">
        <p class="text-gray-600">Loading subscriptions...</p>
      </div>

      <div v-else-if="subscriptions.length === 0" class="bg-white p-8 rounded-lg shadow text-center">
        <p class="text-gray-600 mb-4">No subscriptions yet</p>
        <router-link to="/subscriptions/create" class="text-blue-600 hover:underline">Create your first subscription</router-link>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="subscription in subscriptions" :key="subscription.id" class="bg-white p-6 rounded-lg shadow">
          <h3 class="text-lg font-bold mb-2">{{ subscription.name }}</h3>
          <p class="text-gray-600 mb-4 line-clamp-2">{{ subscription.description }}</p>
          <div class="mb-4">
            <div class="flex justify-between mb-2">
              <span class="text-sm text-gray-600">Monthly:</span>
              <span class="font-bold">${{ subscription.monthly_price }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-gray-600">Yearly:</span>
              <span class="font-bold">${{ subscription.yearly_price }}</span>
            </div>
          </div>
          <div class="flex gap-2">
            <router-link
              :to="`/subscriptions/${subscription.id}/edit`"
              class="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition text-center text-sm"
            >
              Edit
            </router-link>
            <button
              @click="deleteSubscription(subscription.id)"
              class="flex-1 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition text-sm"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useSubscriptionStore } from '../../stores/subscription'

const subscriptionStore = useSubscriptionStore()
const { subscriptions, isLoading } = subscriptionStore

onMounted(() => {
  subscriptionStore.getAll()
})

const deleteSubscription = async (id) => {
  if (confirm('Are you sure you want to delete this subscription?')) {
    try {
      await subscriptionStore.remove(id)
    } catch (error) {
      alert('Failed to delete subscription')
    }
  }
}
</script>
