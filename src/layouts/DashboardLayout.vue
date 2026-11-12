<script setup>
import { navItems } from '../config/navigation'
import { useAuthStore } from '../stores/authStore'
import { useRoute, useRouter } from 'vue-router'
import { getInitials } from '../utils/formatters'

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}
</script>

<template>
  <div class="app-layout d-flex min-vh-100 bg-light">
    <!-- Sidebar -->
    <aside class="sidebar bg-white border-end d-flex flex-column" style="width: 260px; position: fixed; top: 0; bottom: 0; left: 0; z-index: 100;">
      <div class="sidebar-brand p-4 border-bottom d-flex align-items-center gap-2">
        <i class="bi bi-box-seam-fill text-primary fs-4"></i>
        <span class="fw-bold text-dark fs-5">Vue Component Lab</span>
      </div>

      <div class="sidebar-menu p-3 flex-grow-1">
        <div class="text-secondary small text-uppercase fw-semibold mb-2 px-2" style="font-size: 0.7rem;">
          Main Menu
        </div>
        <nav class="nav flex-column gap-1">
          <template v-for="item in navItems" :key="item.path">
            <router-link
              v-if="!item.adminOnly || authStore.isAdmin"
              :to="item.path"
              class="nav-link d-flex align-items-center gap-3 py-2 px-3 rounded fw-medium"
              :class="route.path === item.path ? 'active bg-primary text-white' : 'text-dark hover-bg-light'"
            >
              <i :class="[item.icon, 'fs-5']"></i>
              <span>{{ item.label }}</span>
            </router-link>
          </template>
        </nav>
      </div>

      <!-- User Profile Footer in Sidebar -->
      <div class="sidebar-footer p-3 border-top bg-light">
        <div class="d-flex align-items-center justify-content-between mb-2">
          <div class="d-flex align-items-center gap-2">
            <div class="bg-primary-subtle text-primary rounded-circle d-flex align-items-center justify-content-center fw-bold" style="width: 36px; height: 36px; font-size: 0.9rem;">
              {{ getInitials(authStore.user?.name) }}
            </div>
            <div style="overflow: hidden;">
              <div class="fw-semibold text-dark text-truncate small" style="max-width: 130px;">{{ authStore.user?.name || 'User' }}</div>
              <div class="text-secondary" style="font-size: 0.72rem;">{{ authStore.user?.role || 'User' }}</div>
            </div>
          </div>
        </div>
        <button 
          @click="handleLogout"
          class="btn btn-outline-danger btn-sm w-100 d-flex align-items-center justify-content-center gap-2"
        >
          <i class="bi bi-box-arrow-right"></i>
          <span>Sign Out</span>
        </button>
      </div>
    </aside>

    <!-- Main Content Area -->
    <div class="main-content flex-grow-1" style="margin-left: 260px;">
      <main class="p-4">
        <router-view />
      </main>
    </div>
  </div>
</template>

<style scoped>
.hover-bg-light:hover {
  background-color: #f8f9fa;
}
</style>