import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../pages/Dashboard.vue'
import Employees from '../pages/Employees.vue'
import EmployeeDetail from '../pages/EmployeeDetail.vue'
import Products from '../pages/Products.vue'
import Login from '../pages/Login.vue'
import NotFound from '../pages/NotFound.vue'
import { useAuthStore } from '../stores/authStore'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { title: 'Sign In' }
  },
  {
    path: '/',
    name: 'Dashboard',
    component: Dashboard,
    meta: { title: 'Dashboard Overview' }
  },
  {
    path: '/employees',
    name: 'Employees',
    component: Employees,
    meta: { title: 'Employee Directory' }
  },
  {
    path: '/employees/:id',
    name: 'EmployeeDetail',
    component: EmployeeDetail,
    meta: { title: 'Employee Profile' }
  },
  {
    path: '/products',
    name: 'Products',
    component: Products,
    meta: { title: 'Product Inventory' }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound,
    meta: { title: 'Page Not Found' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  linkActiveClass: 'active',
  linkExactActiveClass: 'active'
})

// Updated navigation guard returning values instead of using deprecated next()
router.beforeEach((to) => {
  const authStore = useAuthStore()
  
  if (to.meta.title) {
    document.title = `${to.meta.title} | Vue Component Lab`
  }

  if (to.path !== '/login' && !authStore.isAuthenticated) {
    return '/login'
  }
  
  if (to.path === '/login' && authStore.isAuthenticated) {
    return '/'
  }
})

export default router