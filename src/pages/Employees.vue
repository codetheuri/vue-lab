<script setup>
import { ref, computed, watch } from 'vue'
import { useEmployees } from '../composables/useEmployees.js'
import BaseInput from '../components/base/BaseInput.vue'
import BaseSelect from '../components/base/BaseSelect.vue'
import BaseModal from '../components/base/BaseModal.vue'
import BaseButton from '../components/base/BaseButton.vue'
import BaseBadge from '../components/base/BaseBadge.vue'
import DataTable from '../components/table/DataTable.vue'
import TableSearch from '../components/table/TableSearch.vue'
import TablePagination from '../components/table/TablePagination.vue'
import TableFilters from '../components/table/TableFilters.vue'
import { useToast } from '../composables/useToast'

// 1. Toast & Composable setup
const { showSuccess, showDanger, showInfo } = useToast()
const { employees, addEmployee, updateEmployee, deleteEmployee, resetEmployees } = useEmployees()

// Filtering & Pagination State
const searchQuery = ref('')
const selectedDepartment = ref('')
const selectedStatus = ref('')
const currentPage = ref(1)
const itemsPerPage = ref(5)

// Sorting State
const sortKey = ref('')
const sortOrder = ref('asc')

const handleSort = (key) => {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortOrder.value = 'asc'
  }
}

// Active filters helper
const hasActiveFilters = computed(() => {
  return searchQuery.value.trim() !== '' || 
         selectedDepartment.value !== '' || 
         selectedStatus.value !== '' || 
         sortKey.value !== ''
})

const clearAllFilters = () => {
  searchQuery.value = ''
  selectedDepartment.value = ''
  selectedStatus.value = ''
  sortKey.value = ''
  sortOrder.value = 'asc'
}

const handleReset = () => {
  resetEmployees()
  showInfo('Directory restored to default mock data.')
}

// Export CSV Functionality
const exportToCSV = () => {
  if (!filteredEmployees.value.length) {
    showDanger('No employee records available to export.')
    return
  }
  const headers = ['id', 'name', 'email', 'department', 'role', 'status', 'joinDate']
  const csvRows = [
    headers.join(','),
    ...filteredEmployees.value.map(row => 
      headers.map(field => JSON.stringify(row[field] ?? '')).join(',')
    )
  ]
  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', 'employees.csv')
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
  showSuccess('Employees exported to CSV successfully!')
}

// Delete Confirmation Modal State
const isDeleteModalOpen = ref(false)
const itemToDelete = ref(null)

const confirmDeletePrompt = (item) => {
  itemToDelete.value = item
  isDeleteModalOpen.value = true
}

const executeDelete = () => {
  if (!itemToDelete.value) return
  deleteEmployee(itemToDelete.value.id)
  showDanger('Employee removed from directory.')
  isDeleteModalOpen.value = false
  itemToDelete.value = null

  const totalPages = Math.ceil(filteredEmployees.value.length / itemsPerPage.value) || 1
  if (currentPage.value > totalPages) {
    currentPage.value = totalPages
  }
}

// Quick-View Modal State
const isViewModalOpen = ref(false)
const selectedEmployee = ref(null)

const openViewModal = (emp) => {
  selectedEmployee.value = emp
  isViewModalOpen.value = true
}

const transitionToEdit = () => {
  const emp = selectedEmployee.value
  isViewModalOpen.value = false
  if (emp) {
    openEditModal(emp)
  }
}

// Add/Edit Form & Validation State
const isModalOpen = ref(false)
const editingEmployeeId = ref(null)

const employeeForm = ref({
  name: '',
  email: '',
  department: '',
  role: '',
  status: 'Active',
  joinDate: new Date().toISOString().split('T')[0]
})

const errors = ref({
  name: '',
  email: '',
  department: '',
  role: ''
})
watch(employeeForm, (newVal) => {
  if (newVal.name && errors.value.name) errors.value.name = ''
  if (newVal.email && errors.value.email) errors.value.email = ''
  if (newVal.department && errors.value.department) errors.value.department = ''
  if (newVal.role && errors.value.role) errors.value.role = ''
}, { deep: true })
const modalStatusOptions = [
  { value: 'Active', label: 'Active' },
  { value: 'Inactive', label: 'Inactive' }
]

const statusOptions = [
  { value: '', label: 'All Statuses' },
  ...modalStatusOptions
]

const clearErrors = () => {
  errors.value = { name: '', email: '', department: '', role: '' }
}

const resetEmployeeForm = () => {
  employeeForm.value = {
    name: '',
    email: '',
    department: '',
    role: '',
    status: 'Active',
    joinDate: new Date().toISOString().split('T')[0]
  }
  clearErrors()
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
    email: employee.email || '',
    department: employee.department || '',
    role: employee.role || '',
    status: employee.status || 'Active',
    joinDate: employee.joinDate || new Date().toISOString().split('T')[0]
  }
  clearErrors()
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
  editingEmployeeId.value = null
  resetEmployeeForm()
}

const saveEmployee = () => {
  errors.value.name = !employeeForm.value.name || !employeeForm.value.name.trim() ? 'Full Name required' : ''
  
  if (!employeeForm.value.email || !employeeForm.value.email.trim()) {
    errors.value.email = 'Email Address required'
  } else if (!employeeForm.value.email.includes('@')) {
    errors.value.email = 'Must be a valid email address containing "@"'
  } else {
    errors.value.email = ''
  }

  errors.value.department = !employeeForm.value.department || !employeeForm.value.department.trim() ? 'Department required' : ''
  errors.value.role = !employeeForm.value.role || !employeeForm.value.role.trim() ? 'Role / Title required' : ''

  if (Object.values(errors.value).some(err => err !== '')) {
    return
  }
  // ... rest of save logic
}

const modalTitle = computed(() => editingEmployeeId.value ? 'Edit Employee Record' : 'Add New Employee')
const modalSubtitle = computed(() => editingEmployeeId.value ? 'Update personnel info in the directory.' : 'Fill in personnel details to register them.')
const saveButtonText = computed(() => editingEmployeeId.value ? 'Update Employee' : 'Save Employee')

// Safe cleanup watchers
watch(isModalOpen, (isOpen) => {
  if (!isOpen) {
    editingEmployeeId.value = null
    clearErrors()
  }
})

watch([searchQuery, selectedDepartment, selectedStatus], () => {
  currentPage.value = 1
})

const departmentOptions = computed(() => {
  const uniqueDepts = [...new Set(employees.value.map(e => e.department).filter(Boolean))]
  return [
    { value: '', label: 'All Departments' },
    ...uniqueDepts.map(dept => ({ value: dept, label: dept }))
  ]
})

const filteredEmployees = computed(() => {
  let result = employees.value.filter(emp => {
    const query = searchQuery.value.toLowerCase().trim()
    const matchesSearch = !query || 
      emp.name?.toLowerCase().includes(query) ||
      emp.email?.toLowerCase().includes(query) ||
      emp.department?.toLowerCase().includes(query) ||
      emp.role?.toLowerCase().includes(query)

    const matchesDept = !selectedDepartment.value || emp.department === selectedDepartment.value
    const matchesStatus = !selectedStatus.value || emp.status === selectedStatus.value

    return matchesSearch && matchesDept && matchesStatus
  })

  if (sortKey.value) {
    result.sort((a, b) => {
      let valA = a[sortKey.value] ?? ''
      let valB = b[sortKey.value] ?? ''

      if (typeof valA === 'string' && typeof valB === 'string') {
        valA = valA.toLowerCase()
        valB = valB.toLowerCase()
        if (valA < valB) return sortOrder.value === 'asc' ? -1 : 1
        if (valA > valB) return sortOrder.value === 'asc' ? 1 : -1
        return 0
      }

      return sortOrder.value === 'asc' ? valA - valB : valB - valA
    })
  }

  return result
}) 

const paginatedEmployees = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredEmployees.value.slice(start, end)
})

const tableColumns = [
  { key: 'name', label: 'Employee', sortable: true, class: 'ps-4' },
  { key: 'email', label: 'Email', sortable: true },
  { key: 'department', label: 'Department', sortable: true },
  { key: 'role', label: 'Role', sortable: true },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'joinDate', label: 'Join Date', sortable: true },
  { key: 'actions', label: 'Actions', sortable: false }
]
</script>

<template>
  <div class="employees-page">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h1 class="h3 fw-bold text-dark mb-1">Employees</h1>
        <p class="text-secondary small mb-0">Manage personnel directory, department allocations, and employment status.</p>
      </div>

      <div class="d-flex align-items-center gap-2">
        <BaseButton
          v-if="hasActiveFilters"
          variant="outline-secondary"
          size="md"
          text="Clear Filters"
          icon="bi bi-x-circle"
          @click="clearAllFilters"
        />
        <BaseButton
          variant="outline-secondary"
          size="md"
          text="Export CSV"
          icon="bi bi-download"
          @click="exportToCSV"
        />
        <BaseButton
          variant="outline-danger"
          size="md"
          text="Reset Data"
          icon="bi bi-arrow-counterclockwise"
          @click="handleReset"
        />
        <BaseButton
          variant="primary"
          size="md"
          text="Add Employee"
          icon="bi bi-person-plus-fill"
          @click="openAddModal"
        />
      </div>
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

          <TableFilters
            v-model="selectedStatus"
            label="Status"
            :options="statusOptions"
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

      <DataTable 
        :columns="tableColumns" 
        :data="paginatedEmployees" 
        :sort-key="sortKey"
        :sort-order="sortOrder"
        empty-text="No matching employees found."
        @sort="handleSort" 
      >
        <template #cell(email)="{ value }">
          <span class="text-secondary small">{{ value || 'N/A' }}</span>
        </template>
        <template #cell(status)="{ value }">
          <BaseBadge :variant="value === 'Active' ? 'success' : 'secondary'">
            {{ value }}
          </BaseBadge>
        </template>
        <template #cell(actions)="{ row }">
          <div class="d-flex gap-2">
            <BaseButton
              variant="outline-secondary"
              size="sm"
              icon="bi bi-eye"
              title="Quick View"
              @click="openViewModal(row)"
            />
            <BaseButton
              variant="outline-primary"
              size="sm"
              icon="bi bi-pencil"
              title="Edit Record"
              @click="openEditModal(row)"
            />
            <BaseButton
              variant="outline-danger"
              size="sm"
              icon="bi bi-trash"
              title="Delete Record"
              @click="confirmDeletePrompt(row)"
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

    <!-- Quick View Employee Modal -->
    <BaseModal
      :show="isViewModalOpen"
      title="Employee Profile"
      subtitle="Detailed view of personnel record."
      @close="isViewModalOpen = false"
    >
      <div v-if="selectedEmployee" class="vstack gap-3">
        <div>
          <span class="text-secondary small d-block">Full Name</span>
          <span class="fw-semibold text-dark fs-6">{{ selectedEmployee.name }}</span>
        </div>
        <div>
          <span class="text-secondary small d-block">Email Address</span>
          <span class="text-dark">{{ selectedEmployee.email || 'N/A' }}</span>
        </div>
        <div class="row">
          <div class="col-6">
            <span class="text-secondary small d-block">Department</span>
            <span class="text-dark fw-medium">{{ selectedEmployee.department }}</span>
          </div>
          <div class="col-6">
            <span class="text-secondary small d-block">Role / Title</span>
            <span class="text-dark fw-medium">{{ selectedEmployee.role }}</span>
          </div>
        </div>
        <div class="row">
          <div class="col-6">
            <span class="text-secondary small d-block">Employment Status</span>
            <BaseBadge :variant="selectedEmployee.status === 'Active' ? 'success' : 'secondary'">
              {{ selectedEmployee.status }}
            </BaseBadge>
          </div>
          <div class="col-6">
            <span class="text-secondary small d-block">Join Date</span>
            <span class="text-dark">{{ selectedEmployee.joinDate }}</span>
          </div>
        </div>

        <div class="d-flex justify-content-end gap-2 mt-4">
          <BaseButton
            type="button"
            variant="outline-primary"
            size="sm"
            text="Edit"
            icon="bi bi-pencil"
            @click="transitionToEdit"
          />
          <BaseButton
            type="button"
            variant="secondary"
            size="sm"
            text="Close"
            @click="isViewModalOpen = false"
          />
        </div>
      </div>
    </BaseModal>

    <!-- Delete Confirmation Modal -->
    <BaseModal
      :show="isDeleteModalOpen"
      title="Confirm Deletion"
      subtitle="This action cannot be undone."
      @close="isDeleteModalOpen = false"
    >
      <p class="text-secondary">Are you sure you want to delete <strong>{{ itemToDelete?.name }}</strong>?</p>
      <div class="d-flex justify-content-end gap-2 mt-4">
        <BaseButton type="button" variant="secondary" size="sm" text="Cancel" @click="isDeleteModalOpen = false" />
        <BaseButton type="button" variant="danger" size="sm" text="Confirm Delete" @click="executeDelete" />
      </div>
    </BaseModal>

    <!-- Add/Edit Employee Modal -->
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
          :error="errors.name"
        />

        <BaseInput
          label="Email Address"
          type="email"
          v-model="employeeForm.email"
          placeholder="e.g. alex.morgan@company.com"
          :error="errors.email"
        />

        <BaseInput
          label="Department"
          v-model="employeeForm.department"
          placeholder="e.g. Engineering"
          :error="errors.department"
        />

        <BaseInput
          label="Role / Title"
          v-model="employeeForm.role"
          placeholder="e.g. Backend Developer"
          :error="errors.role"
        />

        <BaseSelect
          label="Status"
          v-model="employeeForm.status"
          :options="modalStatusOptions"
          placeholder="Select status..."
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