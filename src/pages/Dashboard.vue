<script setup>
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useEmployeeStore } from '../stores/employeeStore'
import { useProductStore } from '../stores/productStore'
import { useActivityStore } from '../stores/activityStore'
import { useAuthStore } from '../stores/authStore'
import BaseButton from '../components/base/BaseButton.vue'
import BaseBadge from '../components/base/BaseBadge.vue'
import BaseModal from '../components/base/BaseModal.vue'

const employeeStore = useEmployeeStore()
const productStore = useProductStore()
const activityStore = useActivityStore()
const authStore = useAuthStore()

// State & metrics via storeToRefs
const { employees, totalEmployees, departmentCount } = storeToRefs(employeeStore)
const { products, totalProducts, lowStockCount, totalValuation } = storeToRefs(productStore)
const { logs } = storeToRefs(activityStore)
const { clearLogs } = activityStore

// Active and inactive employee counts computed directly from store
const activeEmployees = computed(() => employees.value.filter(e => e.status === 'Active').length)
const inactiveEmployees = computed(() => employees.value.filter(e => e.status !== 'Active').length)

// Product category count
const categoryCount = computed(() => new Set(products.value.map(p => p.category).filter(Boolean)).size)

// Recent employees list (top 5 sorted by id or join date)
const recentEmployees = computed(() => {
  return [...employees.value].slice(-5).reverse()
})

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

    <!-- Secondary Row for Inventory Stats -->
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
              <h2 class="h3 fw-bold text-dark mt-1 mb-0">{{ lowStockCount }}</h2>
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
              <h2 class="h3 fw-bold text-dark mt-1 mb-0">${{ totalValuation.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}</h2>
              <small class="text-muted" style="font-size: 0.75rem;">Combined warehouse valuation</small>
            </div>
            <div class="stat-icon-wrapper bg-success-subtle text-success">
              <i class="bi bi-cash-stack"></i>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Two-Column Section: Recent Employees & Recent Activity Log -->
    <div class="row g-4 mb-4">
      <!-- Recent Employees Section -->
      <div class="col-12 col-xl-6">
        <div class="card table-card shadow-sm border h-100">
          <div class="card-header bg-white border-bottom py-3 px-4 d-flex align-items-center justify-content-between">
            <div>
              <h2 class="h6 fw-bold text-dark mb-0">Recent Employees</h2>
              <small class="text-secondary">Recently active or added personnel</small>
            </div>
            <router-link to="/employees" class="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1">
              <span>View All</span>
              <i class="bi bi-arrow-right"></i>
            </router-link>
          </div>

          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
              <thead class="table-light">
                <tr>
                  <th scope="col" class="ps-4">Employee</th>
                  <th scope="col">Department</th>
                  <th scope="col">Status</th>
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
                        <small class="text-muted">{{ emp.role }}</small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span class="badge bg-light text-dark border">
                      {{ emp.department }}
                    </span>
                  </td>
                  <td>
                    <BaseBadge :variant="emp.status === 'Active' ? 'success' : 'secondary'">
                      {{ emp.status }}
                    </BaseBadge>
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
      </div>

      <!-- Recent Activity Log Section -->
      <div class="col-12 col-xl-6">
        <div class="card table-card shadow-sm border h-100">
          <div class="card-header bg-white border-bottom py-3 px-4 d-flex align-items-center justify-content-between">
            <div>
              <h2 class="h6 fw-bold text-dark mb-0">Recent Activity Log</h2>
              <small class="text-secondary">Real-time system actions & mutations</small>
            </div>
            <!-- Admin-only Clear Log button -->
            <BaseButton
              v-if="authStore.isAdmin && logs.length > 0"
              variant="outline-danger"
              size="sm"
              icon="bi bi-trash"
              text="Clear Log"
              @click="clearLogs"
            />
          </div>

          <div class="card-body p-0" style="max-height: 380px; overflow-y: auto;">
            <div v-if="logs.length === 0" class="text-center py-5 text-muted small">
              <i class="bi bi-journal-x fs-3 d-block mb-2"></i>
              No activity logs recorded yet.
            </div>
            <ul v-else class="list-group list-group-flush">
              <li v-for="log in logs" :key="log.id" class="list-group-item px-4 py-3">
                <div class="d-flex justify-content-between align-items-start mb-1">
                  <div class="d-flex align-items-center gap-2">
                    <BaseBadge :variant="log.variant">
                      {{ log.action }}
                    </BaseBadge>
                    <span class="fw-semibold text-dark small">{{ log.userName }}</span>
                    <span class="text-muted" style="font-size: 0.7rem;">({{ log.userRole }})</span>
                  </div>
                  <small class="text-muted" style="font-size: 0.75rem;">{{ log.time }}</small>
                </div>
                <p class="text-secondary small mb-0 mt-1">{{ log.details }}</p>
              </li>
            </ul>
          </div>
        </div>
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