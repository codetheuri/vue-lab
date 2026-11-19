<script setup>
import { ref } from 'vue'
import BaseInput from '../components/base/BaseInput.vue'
import BaseButton from '../components/base/BaseButton.vue'

const email = ref('')
const emailError = ref('')
const submitted = ref(false)
const submitting = ref(false)

const handleSubmit = async () => {
  emailError.value = ''

  if (!email.value || !email.value.trim()) {
    emailError.value = 'Email address is required.'
    return
  }
  if (!email.value.includes('@')) {
    emailError.value = 'Please enter a valid email address.'
    return
  }

  submitting.value = true
  await new Promise(resolve => setTimeout(resolve, 400))
  submitting.value = false
  submitted.value = true
}
</script>

<template>
  <div class="min-vh-100 d-flex align-items-center justify-content-center bg-light p-3">
    <div class="card shadow-sm border" style="max-width: 420px; width: 100%;">
      <div class="card-body p-4">
        <h1 class="h4 fw-bold text-dark mb-1">Forgot Password</h1>
        <p class="text-secondary small mb-4">
          Enter your account email and we will send password recovery instructions.
        </p>

        <div v-if="submitted" class="alert alert-success small mb-4" role="alert">
          If an account matches <strong>{{ email }}</strong>, password reset instructions have been dispatched.
        </div>

        <form v-else @submit.prevent="handleSubmit">
          <BaseInput
            label="Email Address"
            type="email"
            v-model="email"
            placeholder="name@company.com"
            :error="emailError"
          />

          <div class="d-grid mt-3">
            <BaseButton
              type="submit"
              variant="primary"
              size="md"
              text="Send Reset Link"
              :loading="submitting"
            />
          </div>
        </form>

        <div class="text-center mt-4">
          <router-link to="/login" class="small text-decoration-none">
            Back to Sign In
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>