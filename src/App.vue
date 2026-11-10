<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import DashboardLayout from './layouts/DashboardLayout.vue'
import BaseToast from './components/base/BaseToast.vue' 

const route = useRoute()

// Check if current page is login so we can hide the dashboard shell and global toast
const isLoginPage = computed(() => route.path === '/login')
</script>

<template>
  <!-- Standalone view for Login (no sidebar, no dashboard layout, no global toast) -->
  <router-view v-if="isLoginPage" />

  <!-- Dashboard Shell for Authenticated Pages -->
  <DashboardLayout v-else>
    <router-view />
    <!-- Global Toast container mounted within the dashboard layout -->
    <BaseToast />
  </DashboardLayout>
</template>