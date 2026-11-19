<script setup>
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from './stores/authStore'
import { useSettingsStore } from './stores/settingsStore'
import DashboardLayout from './layouts/DashboardLayout.vue'
import BaseToast from './components/base/BaseToast.vue'

const route = useRoute()
const authStore = useAuthStore()

// Initialize global settings & apply saved dark/light theme immediately on app boot
useSettingsStore()

// Verify saved session against the server on startup when a token exists
onMounted(async () => {
  if (localStorage.getItem('vue_lab_token')) {
    await authStore.verifySession()
  }
})

// Hide dashboard layout on standalone auth pages (/login, /forgot-password)
const isStandalonePage = computed(() =>
  ['/login', '/forgot-password'].includes(route.path) || Boolean(route.meta?.public)
)
</script>

<template>
  <div id="app">
    <!-- Standalone view for Login / Forgot Password (no sidebar, no dashboard layout) -->
    <router-view v-if="isStandalonePage" />

    <!-- Dashboard Shell for Authenticated Pages -->
    <DashboardLayout v-else>
      <router-view />
    </DashboardLayout>

    <!-- Global Toast container mounted at the root level -->
    <BaseToast />
  </div>
</template>