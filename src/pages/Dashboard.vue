<script setup>
import { ref } from 'vue'
import { useEmployees } from '../composables/useEmployees'
import { useProducts } from '../composables/useProducts'
import BaseButton from '../components/base/BaseButton.vue'
import BaseBadge from '../components/base/BaseBadge.vue'
import BaseModal from '../components/base/BaseModal.vue'

// Consume shared reactive states and metrics from composables
const { 
  totalEmployees, 
  activeEmployees, 
  inactiveEmployees, 
  departmentCount, 
  recentEmployees 
} = useEmployees()

const { 
  totalProducts, 
  lowStockProducts, 
  totalInventoryValue, 
  categoryCount 
} = useProducts()

// Generate initials for avatar placeholders
const getInitials = (name) => {
  if (!name) return '??'
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .substring(0, 2)
    .toUpperCase()
}

// View modal state & methods
const isViewModalOpen = ref(false)
const selectedEmployee = ref(null)

const openViewModal = (emp) => {
  selectedEmployee.value = emp
  isViewModalOpen.value = true
}
</script>

<template>
  <div class="dashboard-page">
    <!-- Page Header -->
    <div class="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-2 mb-4">
      <div>
        <h1 class="h3 fw-bold text-dark mb-1">Company Dashboard</h1>
        <p class="text-secondary small mb-0">
          Workforce overview, team distribution, inventory health, and recent onboarding activity.
        </p>
      </div>

      <div class="d-flex align-items-center gap-2">
        <BaseButton 
          variant="outline-secondary" 
          size="sm"
          icon="bi bi-box-seam" 
          to="/products" 
        >
          View Products ({{ totalProducts }})
        </BaseButton>

        <BaseButton 
          variant="primary" 
          size="sm"
          icon="bi bi-people" 
          to="/employees" 
        >
          Manage Employees
        </BaseButton>
      </div>
    </div>

    <!-- Workforce Metric Cards -->
    <div class="row g-3 g-md-4 mb-4">
      <!-- Total Employees -->
      <div class="col-12 col-sm-6 col-xl-3">
        <div class="card stat-card h-100 p-3 shadow-sm border">
          <div class="d-flex align-items-center justify-content-between">
            <div>
              <span class="text-secondary small fw-medium text-uppercase">Total Employees</span>
              <h2 class="h3 fw-bold text-dark mt-1 mb-0">{{ totalEmployees }}</h2>
              <small class="text-muted" style="font-size: 0.75rem;">Company-wide roster</small>
            </div>
            <div class="stat-icon-wrapper bg-primary-subtle text-primary">
              <i class="bi bi-people-fill"></i>
            </div>
          </div>
        </div>
      </div>

      <!-- Active Employees -->
      <div class="col-12 col-sm-6 col-xl-3">
        <div class="card stat-card h-100 p-3 shadow-sm border">
          <div class="d-flex align-items-center justify-content-between">
            <div>
              <span class="text-secondary small fw-medium text-uppercase">Active Staff</span>
              <h2 class="h3 fw-bold text-dark mt-1 mb-0">{{ activeEmployees }}</h2>
              <small class="text-success fw-medium" style="font-size: 0.75rem;">
                <i class="bi bi-check-circle me-1"></i>Currently on duty
              </small>
            </div>
            <div class="stat-icon-wrapper bg-success-subtle text-success">
              <i class="bi bi-person-check-fill"></i>
            </div>
          </div>
        </div>
      </div>

      <!-- Inactive Employees -->
      <div class="col-12 col-sm-6 col-xl-3">
        <div class="card stat-card h-100 p-3 shadow-sm border">
          <div class="d-flex align-items-center justify-content-between">
            <div>
              <span class="text-secondary small fw-medium text-uppercase">Inactive Staff</span>
              <h2 class="h3 fw-bold text-dark mt-1 mb-0">{{ inactiveEmployees }}</h2>
              <small class="text-secondary" style="font-size: 0.75rem;">
                <i class="bi bi-clock-history me-1"></i>On leave / Offboarded
              </small>
            </div>
            <div class="stat-icon-wrapper bg-secondary-subtle text-secondary">
              <i class="bi bi-person-dash-fill"></i>
            </div>
          </div>
        </div>
      </div>

      <!-- Departments -->
      <div class="col-12 col-sm-6 col-xl-3">
        <div class="card stat-card h-100 p-3 shadow-sm border">
          <div class="d-flex align-items-center justify-content-between">
            <div>
              <span class="text-secondary small fw-medium text-uppercase">Departments</span>
              <h2 class="h3 fw-bold text-dark mt-1 mb-0">{{ departmentCount }}</h2>
              <small class="text-muted" style="font-size: 0.75rem;">Across all business units</small>
            </div>
            <div class="stat-icon-wrapper bg-info-subtle text-info">
              <i class="bi bi-diagram-3-fill"></i>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Optional Secondary Row for Inventory Stats -->
    <div class="row g-3 g-md-4 mb-4">
      <div class="col-12 col-sm-6 col-xl-4">
        <div class="card stat-card h-100 p-3 shadow-sm border">
          <div class="d-flex align-items-center justify-content-between">
            <div>
              <span class="text-secondary small fw-medium text-uppercase">Total Inventory Items</span>
              <h2 class="h3 fw-bold text-dark mt-1 mb-0">{{ totalProducts }}</h2>
              <small class="text-muted" style="font-size: 0.75rem;">{{ categoryCount }} product categories</small>
            </div>
            <div class="stat-icon-wrapper bg-warning-subtle text-warning">
              <i class="bi bi-box-seam-fill"></i>
            </div>
          </div>
        </div>
      </div>

      <div class="col-12 col-sm-6 col-xl-4">
        <div class="card stat-card h-100 p-3 shadow-sm border">
          <div class="d-flex align-items-center justify-content-between">
            <div>
              <span class="text-secondary small fw-medium text-uppercase">Low Stock Alerts</span>
              <h2 class="h3 fw-bold text-dark mt-1 mb-0">{{ lowStockProducts }}</h2>
              <small class="text-danger fw-medium" style="font-size: 0.75rem;">Items under stock threshold</small>
            </div>
            <div class="stat-icon-wrapper bg-danger-subtle text-danger">
              <i class="bi bi-exclamation-triangle-fill"></i>
            </div>
          </div>
        </div>
      </div>

      <div class="col-12 col-sm-6 col-xl-4">
        <div class="card stat-card h-100 p-3 shadow-sm border">
          <div class="d-flex align-items-center justify-content-between">
            <div>
              <span class="text-secondary small fw-medium text-uppercase">Total Asset Value</span>
              <h2 class="h3 fw-bold text-dark mt-1 mb-0">${{ totalInventoryValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}</h2>
              <small class="text-muted" style="font-size: 0.75rem;">Combined warehouse valuation</small>
            </div>
            <div class="stat-icon-wrapper bg-success-subtle text-success">
              <i class="bi bi-cash-stack"></i>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Employees Section -->
    <div class="card table-card shadow-sm border">
      <div class="card-header bg-white border-bottom py-3 px-4 d-flex align-items-center justify-content-between">
        <div>
          <h2 class="h6 fw-bold text-dark mb-0">Recent Employees</h2>
          <small class="text-secondary">Recently active or added personnel</small>
        </div>
        <router-link to="/employees" class="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1">
          <span>View All Directory</span>
          <i class="bi bi-arrow-right"></i>
        </router-link>
      </div>

      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light">
            <tr>
              <th scope="col" class="ps-4">Employee</th>
              <th scope="col">Department</th>
              <th scope="col">Role</th>
              <th scope="col">Status</th>
              <th scope="col">Joined</th>
              <th scope="col" class="text-end pe-4">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="emp in recentEmployees" :key="emp.id">
              <td class="ps-4">
                <div class="d-flex align-items-center gap-2">
                  <div class="avatar-circle-sm bg-primary-subtle text-primary border border-primary-subtle">
                    {{ getInitials(emp.name) }}
                  </div>
                  <div>
                    <div class="fw-semibold text-dark">{{ emp.name }}</div>
                    <small class="text-muted">{{ emp.email }}</small>
                  </div>
                </div>
              </td>
              <td>
                <span class="badge bg-light text-dark border">
                  {{ emp.department }}
                </span>
              </td>
              <td class="text-secondary">
                {{ emp.role }}
              </td>
              <td>
                <BaseBadge :variant="emp.status === 'Active' ? 'success' : 'secondary'">
                  {{ emp.status }}
                </BaseBadge>
              </td>
              <td class="text-secondary small">
                {{ emp.joinDate }}
              </td>
              <td class="text-end pe-4">
                <BaseButton
                  variant="outline-secondary"
                  size="sm"
                  icon="bi bi-eye"
                  @click="openViewModal(emp)"
                  title="View employee profile"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- View Employee Details Modal -->
    <BaseModal
      :show="isViewModalOpen"
      title="Employee Details"
      subtitle="Personnel record overview."
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
        <div class="d-flex justify-content-end mt-3">
          <BaseButton type="button" variant="secondary" size="sm" text="Close" @click="isViewModalOpen = false" />
        </div>
      </div>
    </BaseModal>
  </div>
</template>