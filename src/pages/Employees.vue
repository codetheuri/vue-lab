<script setup>
import { ref, computed, watch } from 'vue'
import { useEmployees } from '../composables/useEmployees.js'
import BaseInput from '../components/base/BaseInput.vue'
import BaseModal from '../components/base/BaseModal.vue'
import BaseButton from '../components/base/BaseButton.vue'
import DataTable from '../components/table/DataTable.vue'
import TableSearch from '../components/table/TableSearch.vue'
import TablePagination from '../components/table/TablePagination.vue'
import TableFilters from '../components/table/TableFilters.vue'
import { useToast } from '../composables/useToast'

// 1. Destructure your toast methods at the top
const { showSuccess, showDanger, showInfo } = useToast()

// 2. Bring in your employee methods
const { employees, addEmployee, updateEmployee, deleteEmployee } = useEmployees()

const searchQuery = ref('')
const selectedDepartment = ref('')
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

// 3. Open modal for adding (ONLY opens/preps the modal, no toasts here)
const openAddModal = () => {
  editingEmployeeId.value = null
  resetEmployeeForm()
  isModalOpen.value = true
}


// 4. Save handler triggers the correct toast on add vs update
const saveEmployee = () => {
  // Stop right here if the name field is empty, fam!
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

// 5. Delete handler triggers the danger toast
const handleDeleteEmployee = (id) => {
  deleteEmployee(id)
  showDanger('Employee removed from directory.')
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

// Reset to page 1 whenever search query or department filter changes
watch([searchQuery, selectedDepartment], () => {
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
      emp.department?.toLowerCase().includes(query) ||
      emp.role?.toLowerCase().includes(query)

    const matchesDept = !selectedDepartment.value || emp.department === selectedDepartment.value

    return matchesSearch && matchesDept
  })

  // Apply sorting if active
  if (sortKey.value) {
    result.sort((a, b) => {
      let valA = a[sortKey.value] ?? ''
      let valB = b[sortKey.value] ?? ''

      // Case-insensitive string comparison for text columns
      if (typeof valA === 'string' && typeof valB === 'string') {
        valA = valA.toLowerCase()
        valB = valB.toLowerCase()
        if (valA < valB) return sortOrder.value === 'asc' ? -1 : 1
        if (valA > valB) return sortOrder.value === 'asc' ? 1 : -1
        return 0
      }

      // Numeric comparison
      return sortOrder.value === 'asc' ? valA - valB : valB - valA
    })
  }

  return result
}) 

// Paginated subset (placed AFTER filteredEmployees so it can use its output)
const paginatedEmployees = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredEmployees.value.slice(start, end)
})

// Updated columns configuration (Actions marked sortable: false)
const tableColumns = [
  { key: 'name', label: 'Employee', sortable: true, class: 'ps-4' },
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
<DataTable 
  :columns="tableColumns" 
  :data="paginatedEmployees" 
  :sort-key="sortKey"
  :sort-order="sortOrder"
  empty-text="No matching employees found."
  @sort="handleSort" 
  >
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