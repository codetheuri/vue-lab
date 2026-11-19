<script setup>
import { ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '../stores/authStore'
import { useSettingsStore } from '../stores/settingsStore'
import { useToast } from '../composables/useToast'
import { isRequired, isEmail } from '../utils/validators'
import BaseInput from '../components/base/BaseInput.vue'
import BaseButton from '../components/base/BaseButton.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const settingsStore = useSettingsStore()
const { showSuccess } = useToast()

const { darkMode } = storeToRefs(settingsStore)
const { toggleDarkMode } = settingsStore

const email = ref('')
const password = ref('')
const errors = ref({
  email: '',
  password: ''
})
const loginError = ref('')

// Clear individual field errors reactively as user types
watch(email, (newVal) => {
  if (newVal.trim() && errors.value.email) errors.value.email = ''
  if (loginError.value) loginError.value = ''
})

watch(password, (newVal) => {
  if (newVal && errors.value.password) errors.value.password = ''
  if (loginError.value) loginError.value = ''
})

const handleLogin = async () => {
  loginError.value = ''

  // Validate fields using shared validators
  errors.value.email =
    isRequired(email.value, 'Email Address required') ||
    isEmail(email.value, 'Please enter a valid email address')
  errors.value.password = isRequired(password.value, 'Password required')

  if (errors.value.email || errors.value.password) {
    return
  }

  // Attempt login via Pinia store (async now)
  const success = await authStore.login(email.value, password.value)

  if (success) {
    showSuccess(`Welcome back, ${authStore.user?.name || 'User'}!`)
    const redirectPath = route.query.redirect || '/'
    setTimeout(() => {
      router.push(redirectPath)
    }, 400)
  } else {
    loginError.value = 'Invalid email or password. Please check credentials below.'
  }
}

// Quick fill helper for demo accounts
const fillDemo = (demoEmail, demoPass) => {
  email.value = demoEmail
  password.value = demoPass
  errors.value.email = ''
  errors.value.password = ''
  loginError.value = ''
}
</script>

<template>
  <div class="container-fluid min-vh-100 d-flex align-items-center justify-content-center bg-light position-relative">
    <!-- Quick Dark Mode Theme Toggle Button -->
    <button
      type="button"
      class="btn btn-light border p-2 rounded-circle d-flex align-items-center justify-content-center position-fixed top-0 end-0 m-3 m-md-4 shadow-sm"
      style="width: 40px; height: 40px; z-index: 1050;"
      :title="darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'"
      @click="toggleDarkMode"
    >
      <i :class="darkMode ? 'bi bi-sun-fill text-warning' : 'bi bi-moon-stars-fill text-secondary'" class="fs-6"></i>
    </button>

    <div class="row w-100 justify-content-center">
      <div class="col-md-6 col-lg-5">
        
        <!-- Login Card -->
        <div class="card shadow-sm border-0 rounded-4 p-4">
          <div class="text-center mb-4">
            <h2 class="fw-bold text-dark">Vue-lab Portal</h2>
            <p class="text-muted small">Please sign in to your account</p>
          </div>

          <!-- Alert Banner for Invalid Credentials -->
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

            <div class="d-flex justify-content-end mt-1 mb-2">
              <router-link to="/forgot-password" class="small text-decoration-none">
                Forgot password?
              </router-link>
            </div>

            <div class="d-grid mt-3">
              <BaseButton 
                variant="primary" 
                type="submit" 
                :loading="authStore.loading"
                :disabled="authStore.loading"
              >
                Sign In
              </BaseButton>
            </div>
          </form>

          <!-- Demo Credentials Helper Box -->
          <div class="mt-4 pt-3 border-top text-muted small">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <span class="fw-semibold text-dark">Demo Credentials (Click to auto-fill):</span>
            </div>
            
            <div class="vstack gap-2">
              <div 
                class="p-2 bg-light rounded-3 border d-flex justify-content-between align-items-center cursor-pointer hover-shadow"
                style="cursor: pointer;"
                @click="fillDemo('admin@company.com', 'admin123')"
                title="Click to fill Admin credentials"
              >
                <div>
                  <span class="d-block fw-semibold text-primary">Admin Account</span>
                  <code>admin@company.com</code> / <code>admin123</code>
                </div>
                <span class="badge bg-primary-subtle text-primary border">Fill</span>
              </div>

              <div 
                class="p-2 bg-light rounded-3 border d-flex justify-content-between align-items-center"
                style="cursor: pointer;"
                @click="fillDemo('manager@company.com', 'manager123')"
                title="Click to fill Manager credentials"
              >
                <div>
                  <span class="d-block fw-semibold text-success">Manager Account</span>
                  <code>manager@company.com</code> / <code>manager123</code>
                </div>
                <span class="badge bg-success-subtle text-success border">Fill</span>
              </div>

              <div 
                class="p-2 bg-light rounded-3 border d-flex justify-content-between align-items-center"
                style="cursor: pointer;"
                @click="fillDemo('staff@company.com', 'staff123')"
                title="Click to fill Viewer credentials"
              >
                <div>
                  <span class="d-block fw-semibold text-secondary">Viewer Account</span>
                  <code>staff@company.com</code> / <code>staff123</code>
                </div>
                <span class="badge bg-secondary-subtle text-secondary border">Fill</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  </div>
</template>