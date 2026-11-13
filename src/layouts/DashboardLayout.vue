<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '../stores/authStore'
import { useProductStore } from '../stores/productStore'
import { useToast } from '../composables/useToast'
import { navItems } from '../config/navigation'
import BaseModal from '../components/base/BaseModal.vue'
import BaseInput from '../components/base/BaseInput.vue'
import BaseSelect from '../components/base/BaseSelect.vue'
import BaseButton from '../components/base/BaseButton.vue'
import BaseBadge from '../components/base/BaseBadge.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const productStore = useProductStore()
const { showInfo, showSuccess } = useToast()

const { products } = storeToRefs(productStore)

// Total problem inventory items (Low Stock + Out of Stock)
const problemProducts = computed(() => {
  return products.value.filter(p => Number(p.stock) < 10)
})

const alertCount = computed(() => problemProducts.value.length)

// Alerts Modal State
const isAlertsModalOpen = ref(false)

const openAlertsModal = () => {
  isAlertsModalOpen.value = true
}

const goToProducts = () => {
  isAlertsModalOpen.value = false
  router.push('/products')
}

const isSidebarOpen = ref(false)

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}

const closeSidebar = () => {
  isSidebarOpen.value = false
}

// Current page title from route meta
const pageTitle = computed(() => route.meta.title || 'Overview')

/// Logout action with toast feedback
const handleLogout = async () => {
  await authStore.logout()
  showInfo('You have signed out successfully.')
  router.push('/login')
}
// Profile Modal State & Logic
const isProfileModalOpen = ref(false)
const profileForm = ref({
  name: '',
  role: 'Viewer'
})

const roleOptions = [
  { value: 'Admin', label: 'Admin (Full Access)' },
  { value: 'Viewer', label: 'Viewer (Read-Only)' }
]

const openProfileModal = () => {
  if (authStore.user) {
    profileForm.value = {
      name: authStore.user.name || '',
      role: authStore.user.role || 'Viewer'
    }
  }
  isProfileModalOpen.value = true
}

const saveProfile = () => {
  authStore.updateProfile({
    name: profileForm.value.name,
    role: profileForm.value.role
  })
  showSuccess('User profile updated successfully!')
  isProfileModalOpen.value = false
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

      <!-- Config-Driven Navigation Links -->
      <nav class="p-3 flex-grow-1">
        <div class="text-uppercase small fw-bold text-secondary px-2 mb-2" style="font-size: 0.72rem; letter-spacing: 0.05em;">
          Navigation
        </div>
        <ul class="nav flex-column gap-1 list-unstyled mb-0">
          <template v-for="item in navItems" :key="item.path">
            <li class="nav-item" v-if="!item.adminOnly || authStore.isAdmin">
              <router-link :to="item.path" class="sidebar-link" @click="closeSidebar">
                <i :class="item.icon"></i>
                <span>{{ item.label }}</span>
              </router-link>
            </li>
          </template>
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

        <!-- Topbar Right: Notification Bell & User Profile Trigger -->
        <div class="d-flex align-items-center gap-3">
          <!-- Low Stock Notification Bell -->
          <div class="position-relative">
            <button
              type="button"
              class="btn btn-light border position-relative p-2 rounded-circle d-flex align-items-center justify-content-center"
              style="width: 38px; height: 38px;"
              title="View inventory alerts"
              @click="openAlertsModal"
            >
              <i class="bi bi-bell fs-6 text-secondary"></i>
              <span
                v-if="alertCount > 0"
                class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                style="font-size: 0.65rem;"
              >
                {{ alertCount }}
              </span>
            </button>
          </div>

          <!-- Dynamic User Profile Trigger -->
          <div 
            class="d-flex align-items-center gap-3 user-profile-trigger p-1 rounded hover-bg" 
            style="cursor: pointer;"
            title="Click to edit profile & test role permissions"
            @click="openProfileModal"
          >
            <div class="d-none d-sm-block text-end lh-1">
              <div class="fw-semibold small text-dark">{{ authStore.user?.name || 'Guest User' }}</div>
              <small class="text-muted" style="font-size: 0.75rem;">{{ authStore.user?.role || 'Viewer' }}</small>
            </div>

            <!-- User Avatar -->
            <div
              class="avatar-circle bg-primary-subtle text-primary border border-primary-subtle shadow-sm d-flex align-items-center justify-content-center fw-bold"
              role="img"
              :aria-label="`${authStore.user?.name || 'Guest'} profile avatar`"
            >
              {{ authStore.userInitials }}
            </div>
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

    <!-- Inventory Alerts Modal -->
    <BaseModal
      :show="isAlertsModalOpen"
      title="Inventory Alerts"
      subtitle="Products requiring immediate stock attention (Under stock threshold)."
      @close="isAlertsModalOpen = false"
    >
      <div v-if="problemProducts.length === 0" class="text-center py-4 text-muted small">
        <i class="bi bi-check-circle-fill text-success fs-3 d-block mb-2"></i>
        All inventory items are well-stocked! No low stock alerts.
      </div>

      <div v-else class="vstack gap-3" style="max-height: 350px; overflow-y: auto;">
        <div 
          v-for="item in problemProducts" 
          :key="item.id"
          class="d-flex align-items-center justify-content-between p-2 rounded border bg-light"
        >
          <div>
            <div class="fw-semibold text-dark small">{{ item.name }}</div>
            <div class="text-muted" style="font-size: 0.75rem;">SKU: {{ item.sku }}</div>
          </div>
          <div class="d-flex align-items-center gap-2">
            <span class="text-secondary small">Stock: <strong>{{ item.stock }}</strong></span>
            <BaseBadge :variant="item.stock === 0 ? 'danger' : 'warning'">
              {{ item.stock === 0 ? 'Out of Stock' : 'Low Stock' }}
            </BaseBadge>
          </div>
        </div>
      </div>

      <div class="d-flex justify-content-between align-items-center mt-4 pt-2 border-top">
        <BaseButton
          type="button"
          variant="secondary"
          size="sm"
          text="Close"
          @click="isAlertsModalOpen = false"
        />
        <BaseButton
          type="button"
          variant="primary"
          size="sm"
          text="Go to Products"
          icon="bi bi-box-seam"
          @click="goToProducts"
        />
      </div>
    </BaseModal>

    <!-- My Profile Modal -->
    <BaseModal
      :show="isProfileModalOpen"
      title="My Profile"
      subtitle="Update display settings and test role-based access permissions."
      @close="isProfileModalOpen = false"
    >
      <form @submit.prevent="saveProfile">
        <BaseInput
          label="Display Name"
          v-model="profileForm.name"
          placeholder="e.g. Alex Morgan"
        />

        <BaseSelect
          label="Account Role (Permission Testing)"
          v-model="profileForm.role"
          :options="roleOptions"
        />

        <div class="p-2 bg-light rounded border text-muted small mt-3">
          <i class="bi bi-info-circle me-1 text-primary"></i>
          <strong>Testing Tip:</strong> Switching your role to <strong>Viewer</strong> will hide CRUD actions across all modules instantly.
        </div>

        <div class="d-flex justify-content-end gap-2 mt-4">
          <BaseButton
            type="button"
            variant="secondary"
            size="sm"
            text="Cancel"
            @click="isProfileModalOpen = false"
          />
          <BaseButton
            type="submit"
            variant="primary"
            size="sm"
            text="Save Changes"
          />
        </div>
      </form>
    </BaseModal>
  </div>
</template>

<style scoped>
.hover-bg:hover {
  background-color: rgba(0, 0, 0, 0.04);
  transition: background-color 0.2s ease;
}
</style>