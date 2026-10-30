<script setup>
/**
 * EmployeeForm.vue
 * 
 * Add / Edit Employee form component.
 * To be connected to BaseInput, BaseButton, and modal state in subsequent lessons.
 */
import { ref } from 'vue'

const props = defineProps({
  employee: {
    type: Object,
    default: () => ({
      name: '',
      email: '',
      department: 'Engineering',
      role: '',
      status: 'Active'
    })
  }
})

const emit = defineEmits(['save', 'cancel'])

const formData = ref({ ...props.employee })

const handleSubmit = () => {
  emit('save', { ...formData.value })
}
</script>

<template>
  <form @submit.prevent="handleSubmit" class="employee-form text-start">
    <div class="mb-3">
      <label class="form-label small fw-medium text-dark">Full Name</label>
      <input
        v-model="formData.name"
        type="text"
        class="form-control"
        placeholder="e.g. Jane Doe"
        required
      />
    </div>

    <div class="mb-3">
      <label class="form-label small fw-medium text-dark">Email Address</label>
      <input
        v-model="formData.email"
        type="email"
        class="form-control"
        placeholder="e.g. jane.doe@example.com"
        required
      />
    </div>

    <div class="row g-2 mb-3">
      <div class="col-md-6">
        <label class="form-label small fw-medium text-dark">Department</label>
        <select v-model="formData.department" class="form-select">
          <option value="Engineering">Engineering</option>
          <option value="Product Design">Product Design</option>
          <option value="Human Resources">Human Resources</option>
          <option value="Marketing">Marketing</option>
          <option value="Finance">Finance</option>
          <option value="Operations">Operations</option>
        </select>
      </div>

      <div class="col-md-6">
        <label class="form-label small fw-medium text-dark">Status</label>
        <select v-model="formData.status" class="form-select">
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>
    </div>

    <div class="mb-4">
      <label class="form-label small fw-medium text-dark">Role / Job Title</label>
      <input
        v-model="formData.role"
        type="text"
        class="form-control"
        placeholder="e.g. Senior Frontend Engineer"
        required
      />
    </div>

    <div class="d-flex justify-content-end gap-2">
      <button type="button" class="btn btn-light border" @click="$emit('cancel')">
        Cancel
      </button>
      <button type="submit" class="btn btn-primary">
        Save Employee
      </button>
    </div>
  </form>
</template>

