import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import { useSettingsStore } from '../stores/settingsStore'
import { usePermissions } from '../composables/usePermissions'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../pages/Login.vue'),
    meta: { title: 'Sign In' }
  },
  {
    path: '/',
    name: 'Dashboard',
    component: () => import('../pages/Dashboard.vue'),
    meta: { title: 'Dashboard Overview' }
  },
  {
    path: '/employees',
    name: 'Employees',
    component: () => import('../pages/Employees.vue'),
    meta: { title: 'Employee Directory' }
  },
  {
    path: '/employees/:id',
    name: 'EmployeeDetail',
    component: () => import('../pages/EmployeeDetail.vue'),
    meta: { title: 'Employee Profile' }
  },
  {
    path: '/products',
    name: 'Products',
    component: () => import('../pages/Products.vue'),
    meta: { title: 'Product Inventory' }
  },
  {
    path: '/activity',
    name: 'ActivityLog',
    component: () => import('../pages/ActivityLog.vue'),
    meta: { title: 'System Activity Audit Log', adminOnly: true }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('../pages/Settings.vue'),
    meta: { title: 'System Settings', adminOnly: true }
  },
  {
    path: '/unauthorized',
    name: 'Unauthorized',
    component: () => import('../pages/Unauthorized.vue'),
    meta: { title: 'Access Denied' }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../pages/NotFound.vue'),
    meta: { title: 'Page Not Found' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  linkActiveClass: 'active',
  linkExactActiveClass: 'active'
})

router.beforeEach((to) => {
  const authStore = useAuthStore()
  const settingsStore = useSettingsStore()
  const { isAdmin } = usePermissions()
  
  if (to.meta.title) {
    const brand = settingsStore.workspaceName || 'Vue Component Lab'
    document.title = `${to.meta.title} | ${brand}`
  }

  if (to.path !== '/login' && !authStore.isAuthenticated) {
    return { path: '/login', query: { redirect: to.fullPath } }
  }

  if (to.meta.adminOnly && !isAdmin.value) {
    return '/unauthorized'
  }
  
  if (to.path === '/login' && authStore.isAuthenticated) {
    return '/'
  }
})

export default router