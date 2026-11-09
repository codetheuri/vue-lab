<script setup>
import { ref, computed, watch } from 'vue'
import { useEmployees } from '../composables/useEmployees.js'
import BaseInput from '../components/base/BaseInput.vue'
import BaseModal from '../components/base/BaseModal.vue'
import BaseButton from '../components/base/BaseButton.vue'
import BaseBadge from '../components/base/BaseBadge.vue'
import DataTable from '../components/table/DataTable.vue'
import TableSearch from '../components/table/TableSearch.vue'
import TablePagination from '../components/table/TablePagination.vue'
import TableFilters from '../components/table/TableFilters.vue'
import { useToast } from '../composables/useToast'

// 1. Destructure your toast methods at the top
const { showSuccess, showDanger, showInfo } = useToast()

// 2. Bring in your employee methods & reset function
const { employees, addEmployee, updateEmployee, deleteEmployee, resetEmployees } = useEmployees()

const searchQuery = ref('')
const selectedDepartment = ref('')
const selectedStatus = ref('')
const currentPage = ref(1)
const itemsPerPage = ref(5)
const isModalOpen = ref(false) 

// Sorting state
const sortKey = ref('')
const sortOrder = ref('asc') // 'asc' or 'desc'

const handleSort = (key) => {
  if (sortKey.value === key) {
    if (sortOrder.value === 'asc') {
      sortOrder.value = 'desc'
    } else {
      // Reset sorting on third click cycle
      sortKey.value = ''
      sortOrder.value = 'asc'
    }
  } else {
    sortKey.value = key
    sortOrder.value = 'asc'
  }
}

// Check if any filters are active
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

// Delete confirmation modal state
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

  // Ensure current page doesn't exceed total pages after removal
  const totalPages = Math.ceil(filteredEmployees.value.length / itemsPerPage.value) || 1
  if (currentPage.value > totalPages) {
    currentPage.value = totalPages
  }
}

// Track editing employee ID
const editingEmployeeId = ref(null)

const employeeForm = ref({
  name: '',
  email: '',
  department: '',
  role: '',
  status: 'Active',
  joinDate: new Date().toISOString().split('T')[0]
})

const statusOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'Active', label: 'Active' },
  { value: 'Inactive', label: 'Inactive' }
]

const resetEmployeeForm = () => {
  employeeForm.value = {
    name: '',
    email: '',
    department: '',
    role: '',
    status: 'Active',
    joinDate: new Date().toISOString().split('T')[0]
  }
}

// 3. Open modal for adding
const openAddModal = () => {
  editingEmployeeId.value = null
  resetEmployeeForm()
  isModalOpen.value = true
}

// 4. Save handler triggers the correct toast on add vs update
const saveEmployee = () => {
  if (!employeeForm.value.name || employeeForm.value.name.trim() === '') {
    showDanger('Please enter an employee name before saving.')
    return
  }

  if (editingEmployeeId.value !== null) {
    updateEmployee(editingEmployeeId.value, { ...employeeForm.value })
    showInfo('Employee details updated.')
  } else {
    addEmployee({ ...employeeForm.value })
    showSuccess('Employee added successfully!')
  }
  closeModal()
}

const closeModal = () => {
  isModalOpen.value = false
  editingEmployeeId.value = null
  resetEmployeeForm()
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
  isModalOpen.value = true
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

// Reset to page 1 whenever search query, department, or status filter changes
watch([searchQuery, selectedDepartment, selectedStatus], () => {
  currentPage.value = 1
})

// Department options for filter
const departmentOptions = computed(() => {
  const uniqueDepts = [...new Set(employees.value.map(e => e.department).filter(Boolean))]
  return [
    { value: '', label: 'All Departments' },
    ...uniqueDepts.map(dept => ({ value: dept, label: dept }))
  ]
})

// Pipeline: Search & Filters -> Sorted -> Paginated
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

  // Apply sorting if active
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

// Paginated subset
const paginatedEmployees = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredEmployees.value.slice(start, end)
})

// Columns configuration
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
              variant="outline-primary"
              size="sm"
              icon="bi bi-pencil"
              @click="openEditModal(row)"
            />
            <BaseButton
              variant="outline-danger"
              size="sm"
              icon="bi bi-trash"
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
        />

        <BaseInput
          label="Email Address"
          type="email"
          v-model="employeeForm.email"
          placeholder="e.g. alex.morgan@company.com"
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

        <div class="mb-3">
          <label class="form-label small fw-semibold text-secondary">Status</label>
          <select class="form-select form-select-sm" v-model="employeeForm.status">
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

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