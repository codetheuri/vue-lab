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
const selectedDepartment = ref('') // Default empty (All departments)
const currentPage = ref(1)
const itemsPerPage = ref(5)
const isModalOpen = ref(false)

const closeModal = () => {
  isModalOpen.value = false
}

const employeeForm = ref({
  name: '',
  department: '',
  role: '',
  status: 'Active',
  joinDate: new Date().toISOString().split('T')[0]
})

const saveEmployee = () => {
  employees.value.push({
    id: Date.now(),
    ...employeeForm.value
  })

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

// Generate dynamic department options for TableFilters component
const departmentOptions = computed(() => {
  const uniqueDepts = [...new Set(employees.value.map(e => e.department).filter(Boolean))]
  return [
    { value: '', label: 'All Departments' },
    ...uniqueDepts.map(dept => ({ value: dept, label: dept }))
  ]
})

// Filtered employees list (Search text + Department filter)
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

// Paginated subset of filtered employees
const paginatedEmployees = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredEmployees.value.slice(start, end)
})

// Reset to page 1 whenever search query or department filter changes
watch([searchQuery, selectedDepartment], () => {
  currentPage.value = 1
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
        @click="isModalOpen = true"
      />
    </div>

    <!-- Data Table Card with Integrated TableFilters and TableSearch -->
    <div class="card shadow-sm border">
      <div class="card-header bg-white py-3 px-4 border-bottom d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-3">
        <div class="d-flex align-items-center gap-2">
          <i class="bi bi-table text-primary"></i>
          <span class="fw-semibold text-dark">Employee Directory Table</span>
          <span class="badge bg-primary-subtle text-primary border border-primary-subtle ms-2">
            {{ filteredEmployees.length }} Records
          </span>
        </div>

        <!-- Filter and Search Toolbar -->
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

      <!-- Render Paginated Slice -->
      <DataTable :columns="tableColumns" :data="paginatedEmployees" empty-text="No matching employees found.">
        <template #cell(status)="{ value }">
          <span class="badge bg-info-subtle text-info border border-info-subtle">
            {{ value }}
          </span>
        </template>

        <template #cell(actions)="{ row }">
          <BaseButton
            variant="outline-danger"
            size="sm"
            icon="bi bi-trash"
            @click="deleteEmployee(row.id)"
          />
        </template>
      </DataTable>

      <!-- Integrated Pagination Footer -->
      <TablePagination
        v-model:currentPage="currentPage"
        v-model:itemsPerPage="itemsPerPage"
        :totalItems="filteredEmployees.length"
      />
    </div>

    <!-- Modal -->
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