<script setup>
import { ref, computed } from 'vue'
import { initialEmployees } from '../data/employees'
import BaseButton from '../components/base/BaseButton.vue'

// State initialized from realistic mock data
const employees = ref(initialEmployees)

// Reactive statistics computed from employee state
const totalEmployees = computed(() => employees.value.length)

const activeEmployees = computed(
  () => employees.value.filter((emp) => emp.status === 'Active').length
)

const inactiveEmployees = computed(
  () => employees.value.filter((emp) => emp.status === 'Inactive').length
)

const departmentCount = computed(() => {
  const uniqueDepartments = new Set(employees.value.map((emp) => emp.department))
  return uniqueDepartments.size
})

// Display 5 most recent team members
const recentEmployees = computed(() => employees.value.slice(0, 5))

// Helper for status badge styling
const getStatusBadgeClass = (status) => {
  return status === 'Active'
    ? 'bg-success-subtle text-success border border-success-subtle'
    : 'bg-secondary-subtle text-secondary border border-secondary-subtle'
}

// Generate initials for avatar placeholders
const getInitials = (name) => {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .substring(0, 2)
    .toUpperCase()
}
</script>

<template>
  <div class="dashboard-page">
    <!-- Page Header -->
    <div class="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-2 mb-4">
      <div>
        <h1 class="h3 fw-bold text-dark mb-1">Company Dashboard</h1>
        <p class="text-secondary small mb-0">
          Workforce overview, team distribution, and recent onboarding activity.
        </p>
      </div>

      
      <div class="d-flex align-items-center gap-2">
        <BaseButton 
          variant="outline-secondary" 
          size="sm"
          icon="bi bi-box-seam" 
          to="/products" 
        >
          View Products
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

    <!-- Metric Statistic Cards -->
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
                <span class="badge" :class="getStatusBadgeClass(emp.status)">
                  {{ emp.status }}
                </span>
              </td>
              <td class="text-secondary small">
                {{ emp.joinDate }}
              </td>
              <td class="text-end pe-4">
                <router-link
                  to="/employees"
                  class="btn btn-sm btn-light border py-1 px-2 text-secondary"
                  title="View employee profile"
                >
                  <i class="bi bi-eye"></i>
                </router-link>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

