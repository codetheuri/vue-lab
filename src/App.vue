<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useSettingsStore } from './stores/settingsStore'
import DashboardLayout from './layouts/DashboardLayout.vue'
import BaseToast from './components/base/BaseToast.vue' 

const route = useRoute()

// Initialize global settings & apply saved dark/light theme immediately on app boot
useSettingsStore()

// Check if current page is login so we can hide the dashboard shell
const isLoginPage = computed(() => route.path === '/login')
</script>

<template>
  <div id="app">
    <!-- Standalone view for Login (no sidebar, no dashboard layout) -->
    <router-view v-if="isLoginPage" />

    <!-- Dashboard Shell for Authenticated Pages -->
    <DashboardLayout v-else>
      <router-view />
    </DashboardLayout>

    <!-- Global Toast container mounted at the root level -->
    <BaseToast />
  </div>
</template>