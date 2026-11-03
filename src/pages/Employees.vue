<script setup>
import { ref } from 'vue'
import { initialEmployees } from '../data/employees'
import BaseInput from '../components/base/BaseInput.vue'
import BaseModal from '../components/base/BaseModal.vue'
import BaseButton from '../components/base/BaseButton.vue'

// Employee data source ready for DataTable binding in next phase
const employees = ref(initialEmployees)

// Modal state
const isModalOpen = ref(false)

const closeModal = () => {
  isModalOpen.value = false
}

// Form state for adding an employee
const employeeForm = ref({
  name: '',
  department: '',
  role: '',
  status: 'Active',
  joinDate: new Date().toISOString().split('T')[0]
})

const saveEmployee = () => {
  // Push new employee to your reactive array
  employees.value.push({
    id: Date.now(),
    ...employeeForm.value
  })

  console.log('Employee saved successfully!', employeeForm.value)
  
  // Reset form and close modal
  employeeForm.value = {
    name: '',
    department: '',
    role: '',
    status: 'Active',
    joinDate: new Date().toISOString().split('T')[0]
  }
  closeModal()
}

// Target columns for upcoming reusable DataTable implementation
const tableColumns = [
  { key: 'name', label: 'Employee' },
  { key: 'department', label: 'Department' },
  { key: 'role', label: 'Role' },
  { key: 'status', label: 'Status' },
  { key: 'joinDate', label: 'Join Date' },
  { key: 'actions', label: 'Actions' }
]
</script>

<template>
  <div class="employees-page">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h1 class="h3 fw-bold text-dark mb-1">Employees</h1>
        <p class="text-secondary small mb-0">Manage personnel directory, department allocations, and employment status.</p>
      </div>

      
      <BaseButton
        variant="primary"
        size="md"
        text="Add Employee"
        icon="bi bi-person-plus-fill"
        @click="isModalOpen = true"
      />
    </div>
    <!-- Modal code... -->

    <!-- Data Table Placeholder Card -->
    <div class="card shadow-sm border">
      <div class="card-header bg-white py-3 px-4 border-bottom d-flex align-items-center justify-content-between">
        <div class="d-flex align-items-center gap-2">
          <i class="bi bi-table text-primary"></i>
          <span class="fw-semibold text-dark">Employee Directory Table</span>
        </div>
        <span class="badge bg-primary-subtle text-primary border border-primary-subtle">
          {{ employees.length }} Records Available
        </span>
      </div>

      <div class="card-body p-4 text-center">
        <div class="py-5">
          <div class="d-inline-flex align-items-center justify-content-center bg-light text-primary rounded-circle p-3 mb-3" style="width: 64px; height: 64px;">
            <i class="bi bi-grid-3x3 fs-2"></i>
          </div>

          <h2 class="h5 fw-bold text-dark mb-2">Reusable DataTable Placeholder</h2>
          <p class="text-secondary small mx-auto mb-4" style="max-width: 520px;">
            This section is reserved for the shared <code>DataTable.vue</code> component.
            In the upcoming phase, we will connect search, filters, pagination, and modal forms.
          </p>

          <!-- Schema Blueprint Preview -->
          <div class="p-3 bg-light rounded text-start mx-auto mb-3" style="max-width: 640px;">
            <div class="small fw-bold text-uppercase text-secondary mb-2" style="font-size: 0.75rem;">
              Planned Column Configuration:
            </div>
            <div class="d-flex flex-wrap gap-2">
              <span
                v-for="col in tableColumns"
                :key="col.key"
                class="badge bg-white text-dark border shadow-sm px-2 py-1 font-monospace"
              >
                {{ col.label }} <small class="text-muted">({{ col.key }})</small>
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="card-footer bg-light py-2 px-4 border-top text-secondary small d-flex justify-content-between align-items-center">
        <span>Component: <code>src/components/table/DataTable.vue</code></span>
        <span class="text-muted">Stage: Architecture Foundation</span>
      </div>
    </div>

    <!-- Add Employee Base Modal -->
    <BaseModal
      :show="isModalOpen"
      title="Add New Employee"
      subtitle="Fill in personnel details to register them to the directory."
      @close="closeModal"
    >
      <form @submit.prevent="saveEmployee">
        <BaseInput
          label="Full Name"
          v-model="employeeForm.name"
          placeholder="e.g. Alex Morgan"
        />

        <BaseInput
          label="Department"
          v-model="employeeForm.department"
          placeholder="e.g. Engineering"
        />

        <BaseInput
          label="Role / Title"
          v-model="employeeForm.role"
          placeholder="e.g. Backend Developer"
        />

        <div class="d-flex justify-content-end gap-2 mt-4">
          <button
            type="button"
            class="btn btn-secondary btn-sm"
            @click="closeModal"
          >
            Cancel
          </button>
          
          <button
            type="submit"
            class="btn btn-primary btn-sm"
          >
            Save Employee
          </button>
        </div>
      </form>
    </BaseModal>
  </div>
</template>