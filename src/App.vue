<!-- App.vue -->
<script setup>
import DashboardLayout from './layouts/DashboardLayout.vue'
import BaseToast from './components/base/BaseToast.vue' 
</script>

<template>
  <DashboardLayout>
    <router-view />
  </DashboardLayout>
  
  <!-- Global Toast container mounted at the root level -->
  <BaseToast />
</template>