import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue'),
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/auth/Login.vue'),
    meta: { requiresGuest: true },
  },
  {
    path: '/secret-admin-login',
    name: 'AdminLogin',
    component: () => import('../views/auth/AdminLogin.vue'),
    meta: { requiresGuest: true },
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/auth/Register.vue'),
    meta: { requiresGuest: true },
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('../views/Dashboard.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/admin/dashboard',
    name: 'AdminDashboard',
    component: () => import('../views/admin/Dashboard.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: '/admin/roles-permissions',
    name: 'AdminRolesPermissions',
    component: () => import('../views/admin/RolesPermissions.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: '/admin/creator-roles',
    name: 'AdminCreatorRoles',
    component: () => import('../views/admin/CreatorRoles.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: '/admin/users',
    name: 'AdminUsers',
    component: () => import('../views/admin/Users.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: '/admin/users/:id',
    name: 'AdminUserDetail',
    component: () => import('../views/admin/UserDetail.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: '/admin/social-platforms',
    name: 'AdminSocialPlatforms',
    component: () => import('../views/admin/SocialPlatforms.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: '/creator/:username',
    name: 'CreatorDashboard',
    component: () => import('../views/creator/Dashboard.vue'),
    props: true,
    meta: { requiresAuth: true, requiresCreator: true },
  },
  {
    path: '/creator/:username/create-post',
    name: 'CreatorCreatePost',
    component: () => import('../views/creator/CreatePost.vue'),
    props: true,
    meta: { requiresAuth: true, requiresCreator: true },
  },
  {
    path: '/creator/:username/settings',
    name: 'CreatorSettings',
    component: () => import('../views/creator/Settings.vue'),
    props: true,
    meta: { requiresAuth: true, requiresCreator: true },
  },
  {
    path: '/creator/:username/my-posts',
    name: 'CreatorPosts',
    component: () => import('../views/creator/Posts.vue'),
    props: true,
    meta: { requiresAuth: true, requiresCreator: true },
  },
  {
    path: '/creator/:username/my-posts/:id/edit',
    name: 'CreatorEditPost',
    component: () => import('../views/creator/CreatePost.vue'),
    props: true,
    meta: { requiresAuth: true, requiresCreator: true },
  },
  {
    path: '/subscriber/:username',
    name: 'SubscriberDashboard',
    component: () => import('../views/subscriber/Dashboard.vue'),
    meta: { requiresAuth: true, requiresSubscriber: true },
    props: true,
  },
  {
    path: '/subscriber/:username/my-account',
    name: 'SubscriberAccount',
    component: () => import('../views/subscriber/MyAccount.vue'),
    meta: { requiresAuth: true, requiresSubscriber: true },
    props: true,
  },
  {
    path: '/subscriber/:username/subscriptions',
    name: 'SubscriberSubscriptions',
    component: () => import('../views/subscriber/Subscriptions.vue'),
    meta: { requiresAuth: true, requiresSubscriber: true },
    props: true,
  },
  {
    path: '/subscriber/:username/following',
    name: 'SubscriberFollowing',
    component: () => import('../views/subscriber/Following.vue'),
    meta: { requiresAuth: true, requiresSubscriber: true },
    props: true,
  },
  {
    path: '/subscriptions',
    name: 'Subscriptions',
    component: () => import('../views/subscriptions/SubscriptionList.vue'),
    meta: { requiresAuth: true, requiresCreator: true },
  },
  {
    path: '/subscriptions/create',
    name: 'CreateSubscription',
    component: () => import('../views/subscriptions/SubscriptionForm.vue'),
    meta: { requiresAuth: true, requiresCreator: true },
  },
  {
    path: '/subscriptions/:id/edit',
    name: 'EditSubscription',
    component: () => import('../views/subscriptions/SubscriptionForm.vue'),
    meta: { requiresAuth: true, requiresCreator: true },
  },
  {
    path: '/content',
    name: 'Content',
    component: () => import('../views/content/ContentList.vue'),
    meta: { requiresAuth: true, requiresCreator: true },
  },
  {
    path: '/content/create',
    name: 'CreateContent',
    component: () => import('../views/content/ContentForm.vue'),
    meta: { requiresAuth: true, requiresCreator: true },
  },
  {
    path: '/content/:id/edit',
    name: 'EditContent',
    component: () => import('../views/content/ContentForm.vue'),
    meta: { requiresAuth: true, requiresCreator: true },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/NotFound.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Navigation guards
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  const targetDashboard = authStore.getDashboardPath ? authStore.getDashboardPath() : '/dashboard'

  // Redirect base dashboard to role-specific destination
  if (to.path === '/dashboard' && authStore.isAuthenticated && to.fullPath !== targetDashboard) {
    return next(targetDashboard)
  }

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return next('/login')
  }

  if (to.meta.requiresGuest && authStore.isAuthenticated) {
    return next(targetDashboard)
  }

  if (to.meta.requiresAdmin && !authStore.isAdmin) {
    return next(targetDashboard)
  }

  if (to.meta.requiresCreator && !authStore.isCreator) {
    return next(targetDashboard)
  }

  if (to.meta.requiresSubscriber && !authStore.isSubscriber) {
    return next(targetDashboard)
  }

  next()
})

export default router
