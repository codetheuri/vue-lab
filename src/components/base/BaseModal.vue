<script setup>
/**
 * BaseModal.vue
 * 
 * Reusable modal dialog component supporting header, body, and footer slots.
 * Controls display via show prop and emits close events.
 */
defineProps({
  show: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: 'Modal Title'
  },
  size: {
    type: String,
    default: 'md' // sm, md, lg, xl
  }
})

const emit = defineEmits(['close'])

const handleBackdropClick = (e) => {
  if (e.target === e.currentTarget) {
    emit('close')
  }
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="show"
      class="modal fade show d-block"
      tabindex="-1"
      role="dialog"
      aria-modal="true"
      style="background-color: rgba(15, 23, 42, 0.5);"
      @click="handleBackdropClick"
    >
      <div :class="['modal-dialog', 'modal-dialog-centered', size !== 'md' ? `modal-${size}` : '']">
        <div class="modal-content shadow border-0">
          <div class="modal-header border-bottom">
            <slot name="header">
              <h5 class="modal-title fw-bold text-dark">{{ title }}</h5>
            </slot>
            <button
              type="button"
              class="btn-close"
              aria-label="Close"
              @click="$emit('close')"
            ></button>
          </div>

          <div class="modal-body p-4">
            <slot />
          </div>

          <div v-if="$slots.footer" class="modal-footer border-top bg-light">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

