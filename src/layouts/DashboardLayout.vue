<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const isSidebarOpen = ref(false)

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}

const closeSidebar = () => {
  isSidebarOpen.value = false
}

// Current page title from route meta
const pageTitle = computed(() => route.meta.title || 'Overview')

// Logout action
const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}
</script>

<template>
  <div class="dashboard-wrapper">
    <!-- Mobile Backdrop -->
    <div
      v-if="isSidebarOpen"
      class="sidebar-backdrop d-lg-none"
      @click="closeSidebar"
      aria-hidden="true"
    ></div>

    <!-- Sidebar -->
    <aside
      class="dashboard-sidebar"
      :class="{ 'sidebar-open': isSidebarOpen }"
      aria-label="Main Navigation"
    >
      <!-- Sidebar Brand Header -->
      <div class="sidebar-brand d-flex align-items-center justify-content-between px-3">
        <router-link to="/" class="d-flex align-items-center text-white text-decoration-none" @click="closeSidebar">
          <span class="d-inline-flex align-items-center justify-content-center bg-primary text-white rounded p-2 me-2">
            <i class="bi bi-layers-half fs-5"></i>
          </span>
          <div>
            <div class="fw-bold lh-sm fs-6 text-white">Vue Component Lab</div>
            <small class="text-secondary" style="font-size: 0.725rem;">Admin Workspace</small>
          </div>
        </router-link>

        <!-- Close button for mobile -->
        <button
          type="button"
          class="btn btn-sm btn-outline-secondary d-lg-none text-light border-0"
          aria-label="Close sidebar"
          @click="closeSidebar"
        >
          <i class="bi bi-x-lg"></i>
        </button>
      </div>

      <!-- Navigation Links -->
      <nav class="p-3 flex-grow-1">
        <div class="text-uppercase small fw-bold text-secondary px-2 mb-2" style="font-size: 0.72rem; letter-spacing: 0.05em;">
          Navigation
        </div>
        <ul class="nav flex-column gap-1 list-unstyled mb-0">
          <li class="nav-item">
            <router-link to="/" class="sidebar-link" @click="closeSidebar">
              <i class="bi bi-speedometer2"></i>
              <span>Dashboard</span>
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/employees" class="sidebar-link" @click="closeSidebar">
              <i class="bi bi-people"></i>
              <span>Employees</span>
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/products" class="sidebar-link" @click="closeSidebar">
              <i class="bi bi-box-seam"></i>
              <span>Products</span>
            </router-link>
          </li>
        </ul>
      </nav>

      <!-- Sidebar Footer / Environment Badge & Logout -->
      <div class="p-3 border-top border-secondary border-opacity-25 d-flex flex-column gap-2">
        <div class="d-flex align-items-center justify-content-between px-2 py-1 bg-dark bg-opacity-50 rounded">
          <small class="text-secondary d-flex align-items-center">
            <i class="bi bi-terminal me-1 text-primary"></i> Vue 3 + Vite
          </small>
          <span class="badge bg-success-subtle text-success border border-success-subtle">Ready</span>
        </div>

        <button
          type="button"
          class="btn btn-outline-light btn-sm w-100 d-flex align-items-center justify-content-center gap-2 mt-1"
          @click="handleLogout"
        >
          <i class="bi bi-box-arrow-right"></i> Sign Out
        </button>
      </div>
    </aside>

    <!-- Main Content Area -->
    <div class="dashboard-main">
      <!-- Top Navigation Bar -->
      <header class="dashboard-topbar d-flex align-items-center justify-content-between px-3 px-md-4">
        <div class="d-flex align-items-center gap-3">
          <!-- Mobile Sidebar Toggle -->
          <button
            type="button"
            class="btn btn-light border d-lg-none p-1 px-2"
            aria-label="Toggle navigation"
            @click="toggleSidebar"
          >
            <i class="bi bi-list fs-5"></i>
          </button>

          <!-- Breadcrumbs / Active Page Title -->
          <nav aria-label="breadcrumb">
            <ol class="breadcrumb mb-0 small">
              <li class="breadcrumb-item text-secondary">
                <router-link to="/" class="text-decoration-none text-secondary">Home</router-link>
              </li>
              <li class="breadcrumb-item active fw-medium text-dark" aria-current="page">
                {{ pageTitle }}
              </li>
            </ol>
          </nav>
        </div>

        <!-- Topbar Right: Dynamic User Profile from Pinia Auth Store -->
        <div class="d-flex align-items-center gap-3">
          <div class="d-none d-sm-block text-end lh-1">
            <div class="fw-semibold small text-dark">{{ authStore.user?.name || 'Guest User' }}</div>
            <small class="text-muted" style="font-size: 0.75rem;">{{ authStore.user?.role || 'Viewer' }}</small>
          </div>

          <!-- User Avatar -->
          <div
            class="avatar-circle bg-primary-subtle text-primary border border-primary-subtle shadow-sm d-flex align-items-center justify-content-center fw-bold"
            :title="`${authStore.user?.name || 'Guest'} (${authStore.user?.role || 'Viewer'})`"
            role="img"
            :aria-label="`${authStore.user?.name || 'Guest'} profile avatar`"
          >
            {{ authStore.userInitials }}
          </div>
        </div>
      </header>

      <!-- Dynamic Page Content Slot -->
      <main class="dashboard-content p-3 p-md-4">
        <slot>
          <router-view />
        </slot>
      </main>
    </div>
  </div>
</template>