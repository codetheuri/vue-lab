<script setup>
import { ref, computed, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useEmployeeStore } from '../stores/employeeStore'
import { useDataTable } from '../composables/useDataTable'
import BaseInput from '../components/base/BaseInput.vue'
import BaseTextarea from '../components/base/BaseTextarea.vue'
import BaseSelect from '../components/base/BaseSelect.vue'
import BaseModal from '../components/base/BaseModal.vue'
import BaseButton from '../components/base/BaseButton.vue'
import BaseBadge from '../components/base/BaseBadge.vue'
import DataTable from '../components/table/DataTable.vue'
import TableSearch from '../components/table/TableSearch.vue'
import TablePagination from '../components/table/TablePagination.vue'
import TableFilters from '../components/table/TableFilters.vue'
import { useToast } from '../composables/useToast'
import { useAuthStore } from '../stores/authStore'
import { useCsvExport } from '../composables/useCsvExport'
import { formatDate } from '../utils/formatters'

const { exportToCsv } = useCsvExport()
const authStore = useAuthStore()
const employeeStore = useEmployeeStore()

const { employees, loading } = storeToRefs(employeeStore)
const { addEmployee, updateEmployee, deleteEmployee, resetEmployees } = employeeStore

const { showSuccess, showDanger, showInfo } = useToast()

// Reusable Table Composable (debounced search, sort, filters, pagination)
const {
  searchQuery,
  selectedCategoryOrDept: selectedDepartment,
  selectedStatus,
  currentPage,
  itemsPerPage,
  sortKey,
  sortOrder,
  hasActiveFilters,
  handleSort,
  clearAllFilters,
  filterAndSortItems,
  paginate
} = useDataTable(employees)

const exportToCSV = () => {
  if (!filteredEmployees.value.length) {
    showDanger('No employee records available to export.')
    return
  }
  const headers = ['id', 'name', 'email', 'department', 'role', 'status', 'joinDate', 'bio']
  const success = exportToCsv(filteredEmployees.value, headers, 'employees.csv')
  if (success) {
    showSuccess('Employees exported to CSV successfully!')
  }
}

// Row selection & bulk deletion state
const selectedIds = ref([])
const isBulkDeleteModalOpen = ref(false)

const openBulkDeleteModal = () => {
  if (selectedIds.value.length > 0) {
    isBulkDeleteModalOpen.value = true
  }
}

const executeBulkDelete = () => {
  if (!selectedIds.value.length) return
  const count = selectedIds.value.length
  selectedIds.value.forEach(id => deleteEmployee(id))
  showDanger(`Deleted ${count} employee record(s).`)
  selectedIds.value = []
  isBulkDeleteModalOpen.value = false

  const totalPages = Math.ceil(filteredEmployees.value.length / itemsPerPage.value) || 1
  if (currentPage.value > totalPages) currentPage.value = totalPages
}

const handleReset = async () => {
  await resetEmployees()
  selectedIds.value = []
  showInfo('Directory restored to default mock data.')
}

const isDeleteModalOpen = ref(false)
const itemToDelete = ref(null)

const confirmDeletePrompt = (item) => {
  itemToDelete.value = item
  isDeleteModalOpen.value = true
}

const executeDelete = () => {
  if (!itemToDelete.value) return
  deleteEmployee(itemToDelete.value.id)
  selectedIds.value = selectedIds.value.filter(id => id !== itemToDelete.value.id)
  showDanger('Employee removed from directory.')
  isDeleteModalOpen.value = false
  itemToDelete.value = null

  const totalPages = Math.ceil(filteredEmployees.value.length / itemsPerPage.value) || 1
  if (currentPage.value > totalPages) currentPage.value = totalPages
}

const isViewModalOpen = ref(false)
const selectedEmployee = ref(null)

const openViewModal = (emp) => {
  selectedEmployee.value = emp
  isViewModalOpen.value = true
}

const transitionToEdit = () => {
  const emp = selectedEmployee.value
  isViewModalOpen.value = false
  if (emp) openEditModal(emp)
}

const isModalOpen = ref(false)
const editingEmployeeId = ref(null)

const employeeForm = ref({
  name: '',
  email: '',
  department: '',
  role: '',
  status: 'Active',
  joinDate: new Date().toISOString().split('T')[0],
  bio: ''
})

const errors = ref({ name: '', email: '', department: '', role: '', bio: '' })

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
  errors.value = { name: '', email: '', department: '', role: '', bio: '' }
}

const resetEmployeeForm = () => {
  employeeForm.value = {
    name: '',
    email: '',
    department: '',
    role: '',
    status: 'Active',
    joinDate: new Date().toISOString().split('T')[0],
    bio: ''
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
    joinDate: employee.joinDate || new Date().toISOString().split('T')[0],
    bio: employee.bio || ''
  }
  clearErrors()
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
  editingEmployeeId.value = null
  resetEmployeeForm()
}

const saveEmployee = async () => {
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

  if (Object.values(errors.value).some(err => err !== '')) return

  if (editingEmployeeId.value !== null) {
    await updateEmployee(editingEmployeeId.value, employeeForm.value)
    showInfo('Employee updated successfully.')
  } else {
    await addEmployee(employeeForm.value)
    showSuccess('Employee added successfully!')
  }
  closeModal()
}

const modalTitle = computed(() => editingEmployeeId.value ? 'Edit Employee Record' : 'Add New Employee')
const modalSubtitle = computed(() => editingEmployeeId.value ? 'Update personnel info in the directory.' : 'Fill in personnel details to register them.')
const saveButtonText = computed(() => editingEmployeeId.value ? 'Update Employee' : 'Save Employee')

watch(isModalOpen, (isOpen) => {
  if (!isOpen) {
    editingEmployeeId.value = null
    clearErrors()
  }
})

const departmentOptions = computed(() => {
  const uniqueDepts = [...new Set(employees.value.map(e => e.department).filter(Boolean))]
  return [
    { value: '', label: 'All Departments' },
    ...uniqueDepts.map(dept => ({ value: dept, label: dept }))
  ]
})

const filteredEmployees = computed(() => {
  return filterAndSortItems(['name', 'email', 'department', 'role', 'bio'])
})

const paginatedEmployees = computed(() => {
  return paginate(filteredEmployees.value)
})

const tableColumns = [
  { key: 'name', label: 'Employee', sortable: true, class: 'ps-4' },
  { key: 'email', label: 'Email', sortable: true },
  { key: 'department', label: 'Department', sortable: true },
  { key: 'role', label: 'Role', sortable: true },
  { key: 'equipment', label: 'Equipment', sortable: false },
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
        <!-- Bulk Delete Button -->
        <BaseButton
          v-if="authStore.isAdmin && selectedIds.length > 0"
          variant="danger"
          size="md"
          :text="`Delete Selected (${selectedIds.length})`"
          icon="bi bi-trash-fill"
          @click="openBulkDeleteModal"
        />

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
          v-if="authStore.isAdmin"
          variant="outline-danger"
          size="md"
          text="Reset Data"
          icon="bi bi-arrow-counterclockwise"
          :loading="loading"
          @click="handleReset"
        />
        <BaseButton
          v-if="authStore.isAdmin"
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
        :selectable="authStore.isAdmin"
        :loading="loading"
        v-model:selectedIds="selectedIds"
        empty-text="No matching employees found."
        @sort="handleSort" 
      >
        <template #cell(name)="{ row }">
          <router-link 
            :to="`/employees/${row.id}`" 
            class="fw-semibold text-primary text-decoration-none hover-underline"
          >
            {{ row.name }}
          </router-link>
        </template>
        <template #cell(email)="{ value }">
          <span class="text-secondary small">{{ value || 'N/A' }}</span>
        </template>
        <template #cell(equipment)="{ row }">
          <BaseBadge
            v-if="row.assignedEquipment && row.assignedEquipment.length > 0"
            variant="info"
          >
            {{ row.assignedEquipment.length }} {{ row.assignedEquipment.length === 1 ? 'Item' : 'Items' }}
          </BaseBadge>
          <BaseBadge v-else variant="secondary">
            None
          </BaseBadge>
        </template>
        <template #cell(status)="{ value }">
          <BaseBadge :variant="value === 'Active' ? 'success' : 'secondary'">
            {{ value }}
          </BaseBadge>
        </template>
        <template #cell(joinDate)="{ value }">
          <span>{{ formatDate(value) }}</span>
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
              v-if="authStore.isAdmin"
              variant="outline-primary"
              size="sm"
              icon="bi bi-pencil"
              title="Edit Record"
              @click="openEditModal(row)"
            />
            <BaseButton
              v-if="authStore.isAdmin"
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
        <div>
          <span class="text-secondary small d-block">Employee Bio / Notes</span>
          <p class="text-dark bg-light p-2 rounded small mb-0">{{ selectedEmployee.bio || 'No bio or notes provided.' }}</p>
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
            <span class="text-dark">{{ formatDate(selectedEmployee.joinDate) }}</span>
          </div>
        </div>

        <div class="d-flex justify-content-end gap-2 mt-4">
          <BaseButton
            v-if="authStore.isAdmin"
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

    <!-- Single Delete Confirmation Modal -->
    <BaseModal
      v-if="authStore.isAdmin"
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

    <!-- Bulk Delete Confirmation Modal -->
    <BaseModal
      v-if="authStore.isAdmin"
      :show="isBulkDeleteModalOpen"
      title="Confirm Bulk Deletion"
      subtitle="This action cannot be undone."
      @close="isBulkDeleteModalOpen = false"
    >
      <p class="text-secondary">
        Are you sure you want to delete <strong>{{ selectedIds.length }}</strong> selected record(s)?
      </p>
      <div class="d-flex justify-content-end gap-2 mt-4">
        <BaseButton type="button" variant="secondary" size="sm" text="Cancel" @click="isBulkDeleteModalOpen = false" />
        <BaseButton type="button" variant="danger" size="sm" text="Confirm Delete" @click="executeBulkDelete" />
      </div>
    </BaseModal>

    <!-- Add/Edit Employee Modal -->
    <BaseModal
      v-if="authStore.isAdmin"
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

        <div class="row">
          <div class="col-6">
            <BaseInput
              label="Department"
              v-model="employeeForm.department"
              placeholder="e.g. Engineering"
              :error="errors.department"
            />
          </div>
          <div class="col-6">
            <BaseInput
              label="Role / Title"
              v-model="employeeForm.role"
              placeholder="e.g. Backend Developer"
              :error="errors.role"
            />
          </div>
        </div>

        <BaseSelect
          label="Status"
          v-model="employeeForm.status"
          :options="modalStatusOptions"
          placeholder="Select status..."
        />

        <BaseTextarea
          label="Employee Bio / Notes"
          v-model="employeeForm.bio"
          placeholder="Enter professional background, bio, or department notes..."
          :rows="3"
          :error="errors.bio"
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
            :loading="loading"
          />
        </div>
      </form>
    </BaseModal>
  </div>
</template>