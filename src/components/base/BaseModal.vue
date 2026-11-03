<script setup>
defineProps({
  show: {
    type: Boolean,
    default: false
  }, 
  buttonText: {
    type: String,
    default: 'Add Product'
  },
  title: {
    type: String,
    default: 'Modal Title'
  },
  subtitle: {
    type: String,
    default: ''
  },
  saveButtonText: {
    type: String,
    default: 'Save'
  },
  cancelButtonText: {
    type: String,
    default: 'Cancel'
  }
})
</script>

<template>
  <div
    v-if="show"
    class="modal fade show d-block"
    tabindex="-1"
    style="background-color: rgba(0, 0, 0, 0.5);"
    @click.self="$emit('close')"
  >
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content shadow">
        <div class="modal-header">
          <div>
            <h5 class="modal-title mb-0">{{ title }}</h5>
            <small v-if="subtitle" class="text-muted">{{ subtitle }}</small>
          </div>
          <button
            type="button"
            class="btn-close"
            @click="$emit('close')"
          ></button>
        </div>
        <div class="modal-body">
          <slot />
        </div>
      </div>
    </div>
  </div>
</template>