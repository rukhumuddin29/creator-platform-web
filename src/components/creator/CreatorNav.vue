<template>
  <nav class="creator-nav">
    <RouterLink
      v-for="item in computedItems"
      :key="item.label"
      :to="item.to"
      class="nav-link"
      :class="{ active: isActive(item) }"
    >
      {{ item.label }}
    </RouterLink>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

const props = defineProps({
  items: {
    type: Array,
    default: null,
  },
  username: {
    type: String,
    default: '',
  },
})

const route = useRoute()
const slug = computed(() => props.username || route.params.username || 'creator')

const defaultItems = computed(() => ([
  { label: 'Home', to: `/creator/${slug.value}` },
  { label: 'Products', to: '#' },
  { label: 'Subscribers', to: '#' },
  { label: 'My Settings', to: `/creator/${slug.value}/settings` },
]))

const computedItems = computed(() => {
  if (!props.items) return defaultItems.value
  return props.items.map(item => ({
    ...item,
    to: item.to || item.href || '#',
  }))
})

const isActive = (item) => route.path === item.to
</script>

<style scoped>

.creator-nav {
  display: flex;
  justify-content: center;
  gap: 24px;
  margin: 12px 0 24px;
  font-family: 'Trebuchet MS', 'Lucida Sans Unicode', 'Lucida Grande', 'Lucida Sans', Arial, sans-serif;
}

.nav-link {
  color: #6d4f43;
  text-decoration: none;
  font-weight: 600;
  padding: 8px 10px;
  border-radius: 10px;
}

.nav-link.active,
.nav-link:hover {
  background: #f7d1c4;
}
</style>
