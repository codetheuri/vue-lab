<script setup>
import { ref, computed } from 'vue'
import { initialEmployees } from '../data/employees'
import BaseInput from '../components/base/BaseInput.vue'
import BaseModal from '../components/base/BaseModal.vue'
import BaseButton from '../components/base/BaseButton.vue'
import DataTable from '../components/table/DataTable.vue'
import TableSearch from '../components/table/TableSearch.vue'

// Employee data source ready for DataTable binding
const employees = ref(initialEmployees)
const searchQuery = ref('')

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

const deleteEmployee = (id) => {
  employees.value = employees.value.filter((emp) => emp.id !== id)
}

// Computed filter for search functionality
const filteredEmployees = computed(() => {
  if (!searchQuery.value.trim()) return employees.value
  const query = searchQuery.value.toLowerCase()
  
  return employees.value.filter(emp => 
    emp.name?.toLowerCase().includes(query) ||
    emp.department?.toLowerCase().includes(query) ||
    emp.role?.toLowerCase().includes(query)
  )
})

// Target columns for reusable DataTable implementation
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

    <!-- Data Table Integration with Clearable Search Bar -->
    <div class="card shadow-sm border">
      <div class="card-header bg-white py-3 px-4 border-bottom d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3">
        <div class="d-flex align-items-center gap-2">
          <i class="bi bi-table text-primary"></i>
          <span class="fw-semibold text-dark">Employee Directory Table</span>
          <span class="badge bg-primary-subtle text-primary border border-primary-subtle ms-2">
            {{ filteredEmployees.length }} Records
          </span>
        </div>

        <!-- Integrated TableSearch Component with clearable enabled -->
        <div style="max-width: 280px; width: 100%;">
          <TableSearch
            v-model="searchQuery"
            placeholder="Search employees..."
            clearable
          />
        </div>
      </div>

      <DataTable :columns="tableColumns" :data="filteredEmployees" empty-text="No matching employees found.">
        <!-- Custom Status Badge Slot -->
        <template #cell(status)="{ value }">
          <span class="badge bg-info-subtle text-info border border-info-subtle">
            {{ value }}
          </span>
        </template>

        <!-- Actions Slot -->
        <template #cell(actions)="{ row }">
          <BaseButton
            variant="outline-danger"
            size="sm"
            icon="bi bi-trash"
            @click="deleteEmployee(row.id)"
          />
        </template>
      </DataTable>

      <div class="card-footer bg-light py-2 px-4 border-top text-secondary small d-flex justify-content-between align-items-center">
        <span>Component: <code>src/components/table/DataTable.vue</code></span>
        <span class="text-muted">Domain: Human Resources / Employees</span>
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
          <BaseButton
            type="button"
            variant="secondary"
            size="sm"
            text="Cancel"
            @click="closeModal"
          />
          
          <BaseButton
            type="submit"
            variant="primary"
            size="sm"
            text="Save Employee"
          />
        </div>
      </form>
    </BaseModal>
  </div>
</template>