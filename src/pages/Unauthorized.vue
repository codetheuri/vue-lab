<script setup>
import { useRouter } from 'vue-router'
import BaseButton from '../components/base/BaseButton.vue'

const router = useRouter()
const goDashboard = () => router.push('/')
</script>

<template>
  <div class="container py-5 text-center d-flex justify-content-center align-items-center" style="min-height: 80vh;">
    <div class="card shadow-sm border p-5 rounded-4" style="max-width: 500px; width: 100%;">
      <div class="mb-3">
        <i class="bi bi-shield-lock-fill text-danger display-2"></i>
      </div>
      <h1 class="h3 fw-bold text-dark mb-2">403 — Access Denied</h1>
      <p class="text-secondary small mb-4">
        You do not have the required permissions to access this administrative view. Please contact your system administrator if you require access.
      </p>
      <div>
        <BaseButton
          variant="primary"
          size="md"
          text="Return to Dashboard"
          icon="bi bi-house-door"
          @click="goDashboard"
        />
      </div>
    </div>
  </div>
</template>