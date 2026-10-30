import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../pages/Dashboard.vue'
import Employees from '../pages/Employees.vue'
import Products from '../pages/Products.vue'

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: Dashboard,
    meta: {
      title: 'Dashboard',
      description: 'Overview and team performance statistics'
    }
  },
  {
    path: '/employees',
    name: 'Employees',
    component: Employees,
    meta: {
      title: 'Employees',
      description: 'Directory and team member management'
    }
  },
  {
    path: '/products',
    name: 'Products',
    component: Products,
    meta: {
      title: 'Products',
      description: 'Inventory and internal equipment tracking'
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  linkActiveClass: 'active',
  linkExactActiveClass: 'active'
})

// Set document title dynamically based on active route
router.afterEach((to) => {
  const baseTitle = 'Vue Component Lab'
  document.title = to.meta.title ? `${to.meta.title} | ${baseTitle}` : baseTitle
})

export default router

