<script setup>
import { ref, computed, watch } from 'vue'
import { initialEmployees } from '../data/employees'
import BaseInput from '../components/base/BaseInput.vue'
import BaseModal from '../components/base/BaseModal.vue'
import BaseButton from '../components/base/BaseButton.vue'
import DataTable from '../components/table/DataTable.vue'
import TableSearch from '../components/table/TableSearch.vue'
import TablePagination from '../components/table/TablePagination.vue'
import TableFilters from '../components/table/TableFilters.vue'

const employees = ref(initialEmployees)
const searchQuery = ref('')
const selectedDepartment = ref('')
const currentPage = ref(1)
const itemsPerPage = ref(5)
const isModalOpen = ref(false)

// Track editing employee ID
const editingEmployeeId = ref(null)

const employeeForm = ref({
  name: '',
  department: '',
  role: '',
  status: 'Active',
  joinDate: new Date().toISOString().split('T')[0]
})

const resetEmployeeForm = () => {
  employeeForm.value = {
    name: '',
    department: '',
    role: '',
    status: 'Active',
    joinDate: new Date().toISOString().split('T')[0]
  }
}

const saveEmployee = () => {
  if (editingEmployeeId.value !== null) {
    // Edit existing
    const index = employees.value.findIndex(e => e.id === editingEmployeeId.value)
    if (index !== -1) {
      employees.value[index] = { ...employees.value[index], ...employeeForm.value }
    }
  } else {
    // Add new
    employees.value.push({
      id: Date.now(),
      ...employeeForm.value
    })
  }
  closeModal()
}

const closeModal = () => {
  isModalOpen.value = false
  editingEmployeeId.value = null
  resetEmployeeForm()
}

const openAddModal = () => {
  editingEmployeeId.value = null
  resetEmployeeForm()
  isModalOpen.value = true
}

const openEditModal = (employee) => {
  editingEmployeeId.value = employee.id
  employeeForm.value = {
    name: employee.name || '',
    department: employee.department || '',
    role: employee.role || '',
    status: employee.status || 'Active',
    joinDate: employee.joinDate || new Date().toISOString().split('T')[0]
  }
  isModalOpen.value = true
}

const deleteEmployee = (id) => {
  employees.value = employees.value.filter((emp) => emp.id !== id)
}

// Computed modal titles & button text
const modalTitle = computed(() => editingEmployeeId.value ? 'Edit Employee Record' : 'Add New Employee')
const modalSubtitle = computed(() => editingEmployeeId.value ? 'Update personnel info in the directory.' : 'Fill in personnel details to register them.')
const saveButtonText = computed(() => editingEmployeeId.value ? 'Update Employee' : 'Save Employee')

// Watch modal state for safe cleanup
watch(isModalOpen, (isOpen) => {
  if (!isOpen) {
    editingEmployeeId.value = null
  }
})

// Department options for filter
const departmentOptions = computed(() => {
  const uniqueDepts = [...new Set(employees.value.map(e => e.department).filter(Boolean))]
  return [
    { value: '', label: 'All Departments' },
    ...uniqueDepts.map(dept => ({ value: dept, label: dept }))
  ]
})

// Filtered employees list
const filteredEmployees = computed(() => {
  return employees.value.filter(emp => {
    const query = searchQuery.value.toLowerCase().trim()
    const matchesSearch = !query || 
      emp.name?.toLowerCase().includes(query) ||
      emp.department?.toLowerCase().includes(query) ||
      emp.role?.toLowerCase().includes(query)

    const matchesDept = !selectedDepartment.value || emp.department === selectedDepartment.value

    return matchesSearch && matchesDept
  })
})

// Paginated subset
const paginatedEmployees = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredEmployees.value.slice(start, end)
})

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
        @click="openAddModal"
      />
    </div>

    <!-- Data Table Card -->
    <div class="card shadow-sm border">
      <div class="card-header bg-white py-3 px-4 border-bottom d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-3">
        <div class="d-flex align-items-center gap-2">
          <i class="bi bi-table text-primary"></i>
          <span class="fw-semibold text-dark">Employee Directory Table</span>
          <span class="badge bg-primary-subtle text-primary border border-primary-subtle ms-2">
            {{ filteredEmployees.length }} Records
          </span>
        </div>

        <div class="d-flex flex-wrap align-items-center gap-3">
          <TableFilters
            v-model="selectedDepartment"
            label="Department"
            :options="departmentOptions"
          />

          <div style="max-width: 250px; width: 100%;">
            <TableSearch
              v-model="searchQuery"
              placeholder="Search employees..."
              clearable
            />
          </div>
        </div>
      </div>

      <DataTable :columns="tableColumns" :data="paginatedEmployees" empty-text="No matching employees found.">
        <template #cell(status)="{ value }">
          <span class="badge bg-info-subtle text-info border border-info-subtle">
            {{ value }}
          </span>
        </template>

        <template #cell(actions)="{ row }">
          <div class="d-flex gap-2">
            <BaseButton
              variant="outline-primary"
              size="sm"
              icon="bi bi-pencil"
              @click="openEditModal(row)"
            />
            <BaseButton
              variant="outline-danger"
              size="sm"
              icon="bi bi-trash"
              @click="deleteEmployee(row.id)"
            />
          </div>
        </template>
      </DataTable>

      <TablePagination
        v-model:currentPage="currentPage"
        v-model:itemsPerPage="itemsPerPage"
        :totalItems="filteredEmployees.length"
      />
    </div>

    <!-- Modal -->
    <BaseModal
      :show="isModalOpen"
      :title="modalTitle"
      :subtitle="modalSubtitle"
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
            :text="saveButtonText"
          />
        </div>
      </form>
    </BaseModal>
  </div>
</template>