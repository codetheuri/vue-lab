<script setup>
import { useRouter } from 'vue-router'
import BaseButton from '../components/base/BaseButton.vue'

const router = useRouter()

const goHome = () => {
  router.push('/')
}
</script>

<template>
  <div class="container d-flex flex-column align-items-center justify-content-center min-vh-100 text-center py-5">
    <div class="mb-4">
      <span class="display-1 fw-bold text-primary opacity-75">404</span>
    </div>
    <h1 class="h3 fw-bold text-dark mb-2">Page Not Found</h1>
    <p class="text-secondary mb-4" style="max-width: 400px;">
      The page you are looking for doesn't exist or has been moved. Check the URL or head back home.
    </p>
    <div>
      <BaseButton
        variant="primary"
        size="md"
        text="Back to Dashboard"
        icon="bi bi-speedometer2"
        @click="goHome"
      />
    </div>
  </div>
</template>