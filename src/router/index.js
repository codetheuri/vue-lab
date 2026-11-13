import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/authStore'

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
  
  if (to.meta.title) {
    document.title = `${to.meta.title} | Vue Component Lab`
  }

  if (to.meta.adminOnly && (!authStore.isAuthenticated || !authStore.isAdmin)) {
    if (!authStore.isAuthenticated) {
      return { path: '/login', query: { redirect: to.fullPath } }
    }
    return '/'
  }

  if (to.path !== '/login' && !authStore.isAuthenticated) {
    return { path: '/login', query: { redirect: to.fullPath } }
  }
  
  if (to.path === '/login' && authStore.isAuthenticated) {
    return '/'
  }
})

export default router