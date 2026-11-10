import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import Dashboard from '../pages/Dashboard.vue'
import Employees from '../pages/Employees.vue'
import Products from '../pages/Products.vue'
import Login from '../pages/Login.vue'

const routes = [
  { 
    path: '/login', 
    component: Login, 
    meta: { title: 'Sign In', guestOnly: true } 
  },
  { 
    path: '/', 
    component: Dashboard, 
    meta: { requiresAuth: true, title: 'Dashboard' } 
  },
  { 
    path: '/employees', 
    component: Employees, 
    meta: { requiresAuth: true, title: 'Employees' } 
  },
  { 
    path: '/products', 
    component: Products, 
    meta: { requiresAuth: true, title: 'Products' } 
  },
  // Catch-all redirect to home or login
  { 
    path: '/:pathMatch(.*)*', 
    redirect: '/' 
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation Guard
router.beforeEach((to, from) => {
  const authStore = useAuthStore()

  // Update document title if specified in meta
  if (to.meta.title) {
    document.title = `${to.meta.title} | Vue-lab`
  }

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    // Redirect to login if unauthenticated
    return '/login'
  } 
  
  if (to.meta.guestOnly && authStore.isAuthenticated) {
    // Redirect to home if logged in user tries to visit login page
    return '/'
  }
})

export default router