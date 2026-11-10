<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import BaseInput from '../components/base/BaseInput.vue'
import BaseButton from '../components/base/BaseButton.vue'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const errors = ref({
  email: '',
  password: ''
})
const loginError = ref('')
const successMessage = ref('')

const handleLogin = () => {
  // Clear previous messages
  loginError.value = ''
  successMessage.value = ''

  // Validate fields
  errors.value.email = !email.value.trim() ? 'Email Address required' : ''
  errors.value.password = !password.value ? 'Password required' : ''

  if (errors.value.email || errors.value.password) {
    return
  }

  // Attempt login via Pinia store
  const success = authStore.login(email.value, password.value)

  if (success) {
    successMessage.value = 'Login successful! Welcome back.'
    setTimeout(() => {
      router.push('/')
    }, 800)
  } else {
    loginError.value = 'Invalid email or password. Please check credentials below.'
  }
}
</script>

<template>
  <div class="container-fluid min-vh-100 d-flex align-items-center justify-content-center bg-light">
    <div class="row w-100 justify-content-center">
      <div class="col-md-5 col-lg-4">
        
        <!-- Login Card -->
        <div class="card shadow-sm border-0 rounded-4 p-4">
          <div class="text-center mb-4">
            <h2 class="fw-bold text-dark">Vue-lab Portal</h2>
            <p class="text-muted small">Please sign in to your account</p>
          </div>

          <!-- Alert Toasts / Banners -->
          <div v-if="successMessage" class="alert alert-success py-2 small text-center" role="alert">
            {{ successMessage }}
          </div>
          <div v-if="loginError" class="alert alert-danger py-2 small text-center" role="alert">
            {{ loginError }}
          </div>

          <form @submit.prevent="handleLogin">
            <BaseInput
              v-model="email"
              label="Email Address"
              type="email"
              placeholder="Enter your email"
              :error="errors.email"
            />

            <BaseInput
              v-model="password"
              label="Password"
              type="password"
              placeholder="Enter your password"
              :error="errors.password"
            />

            <div class="d-grid mt-3">
              <BaseButton variant="primary" type="submit">
                Sign In
              </BaseButton>
            </div>
          </form>

          <!-- Demo Credentials Helper Box -->
          <div class="mt-4 pt-3 border-top text-muted small">
            <p class="fw-semibold mb-2 text-dark">Demo Credentials for Testing:</p>
            <div class="p-2 bg-light rounded-3 mb-2">
              <span class="d-block fw-semibold text-secondary">Admin Account:</span>
              <code>admin@company.com</code> / <code>admin123</code>
            </div>
            <div class="p-2 bg-light rounded-3">
              <span class="d-block fw-semibold text-secondary">Viewer Account:</span>
              <code>staff@company.com</code> / <code>staff123</code>
            </div>
          </div>

        </div>

      </div>
    </div>
  </div>
</template>