<script setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '../stores/authStore'
import { useEmployeeStore } from '../stores/employeeStore'
import { useProductStore } from '../stores/productStore'
import { useActivityStore } from '../stores/activityStore'
import BaseBadge from '../components/base/BaseBadge.vue'
import BaseButton from '../components/base/BaseButton.vue'

const authStore = useAuthStore()
const employeeStore = useEmployeeStore()
const productStore = useProductStore()
const activityStore = useActivityStore()

const { employees } = storeToRefs(employeeStore)
const { products } = storeToRefs(productStore)

// Safe fallbacks in case store refs use different names
const employeeList = computed(() => employees?.value || [])
const productList = computed(() => products?.value || [])
const activities = computed(() => activityStore.activities || activityStore.logs || [])

// Metric Cards Calculations
const totalEmployees = computed(() => employeeList.value.length)
const activeEmployees = computed(() => employeeList.value.filter(e => e.status === 'Active').length)
const totalProducts = computed(() => productList.value.length)

const lowStockCount = computed(() => productList.value.filter(p => p.stock > 0 && p.stock < 10).length)
const outOfStockCount = computed(() => productList.value.filter(p => p.stock === 0).length)
const totalValuation = computed(() => productList.value.reduce((acc, p) => acc + (Number(p.price || 0) * Number(p.stock || 0)), 0))

// Recent Employees (take latest 5)
const recentEmployees = computed(() => {
  return [...employeeList.value].sort((a, b) => b.id - a.id).slice(0, 5)
})
</script>

<template>
  <div class="dashboard-page">
    <!-- Welcome Header -->
    <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
      <div>
        <h1 class="h3 fw-bold text-dark mb-1">
          Welcome back, {{ authStore.user?.name || 'User' }}! 
        </h1>
        <p class="text-secondary small mb-0">
          Here is a summary of your personnel directory, inventory stock, and recent system activity.
        </p>
      </div>

      <div class="d-flex align-items-center gap-2">
        <BaseButton
          variant="outline-primary"
          size="sm"
          text="View Products"
          icon="bi bi-box-seam"
          @click="$router.push('/products')"
        />
        <BaseButton
          variant="primary"
          size="sm"
          text="Manage Employees"
          icon="bi bi-people"
          @click="$router.push('/employees')"
        />
      </div>
    </div>

    <!-- Metrics Grid -->
    <div class="row g-3 mb-4">
      <!-- Total Employees -->
      <div class="col-sm-6 col-xl-3">
        <div class="card shadow-sm border h-100 p-3">
          <div class="d-flex align-items-center justify-content-between">
            <div>
              <span class="text-secondary small text-uppercase fw-semibold" style="font-size: 0.72rem;">Total Personnel</span>
              <h2 class="h3 fw-bold text-dark mt-1 mb-0">{{ totalEmployees }}</h2>
            </div>
            <div class="bg-primary-subtle text-primary p-3 rounded-circle d-flex align-items-center justify-content-center" style="width: 48px; height: 48px;">
              <i class="bi bi-people fs-5"></i>
            </div>
          </div>
          <div class="mt-3 pt-2 border-top text-muted small">
            <span class="text-success fw-medium">{{ activeEmployees }}</span> active personnel records
          </div>
        </div>
      </div>

      <!-- Total Products -->
      <div class="col-sm-6 col-xl-3">
        <div class="card shadow-sm border h-100 p-3">
          <div class="d-flex align-items-center justify-content-between">
            <div>
              <span class="text-secondary small text-uppercase fw-semibold" style="font-size: 0.72rem;">Catalog Items</span>
              <h2 class="h3 fw-bold text-dark mt-1 mb-0">{{ totalProducts }}</h2>
            </div>
            <div class="bg-success-subtle text-success p-3 rounded-circle d-flex align-items-center justify-content-center" style="width: 48px; height: 48px;">
              <i class="bi bi-box-seam fs-5"></i>
            </div>
          </div>
          <div class="mt-3 pt-2 border-top text-muted small">
            Valuation: <strong class="text-dark">${{ Number(totalValuation).toFixed(2) }}</strong>
          </div>
        </div>
      </div>

      <!-- Low Stock Alerts -->
      <div class="col-sm-6 col-xl-3">
        <div class="card shadow-sm border h-100 p-3">
          <div class="d-flex align-items-center justify-content-between">
            <div>
              <span class="text-secondary small text-uppercase fw-semibold" style="font-size: 0.72rem;">Low Stock Alerts</span>
              <h2 class="h3 fw-bold text-warning mt-1 mb-0">{{ lowStockCount }}</h2>
            </div>
            <div class="bg-warning-subtle text-warning p-3 rounded-circle d-flex align-items-center justify-content-center" style="width: 48px; height: 48px;">
              <i class="bi bi-exclamation-triangle fs-5"></i>
            </div>
          </div>
          <div class="mt-3 pt-2 border-top text-muted small">
            Requires restocking check
          </div>
        </div>
      </div>

      <!-- Out of Stock -->
      <div class="col-sm-6 col-xl-3">
        <div class="card shadow-sm border h-100 p-3">
          <div class="d-flex align-items-center justify-content-between">
            <div>
              <span class="text-secondary small text-uppercase fw-semibold" style="font-size: 0.72rem;">Out of Stock</span>
              <h2 class="h3 fw-bold text-danger mt-1 mb-0">{{ outOfStockCount }}</h2>
            </div>
            <div class="bg-danger-subtle text-danger p-3 rounded-circle d-flex align-items-center justify-content-center" style="width: 48px; height: 48px;">
              <i class="bi bi-x-circle fs-5"></i>
            </div>
          </div>
          <div class="mt-3 pt-2 border-top text-muted small">
            Action needed immediately
          </div>
        </div>
      </div>
    </div>

    <!-- Lower Section: Recent Employees & System Activity -->
    <div class="row g-4">
      <!-- Recent Employees Table -->
      <div class="col-lg-7">
        <div class="card shadow-sm border h-100">
          <div class="card-header bg-white py-3 px-4 border-bottom d-flex align-items-center justify-content-between">
            <div class="d-flex align-items-center gap-2">
              <i class="bi bi-people text-primary"></i>
              <span class="fw-semibold text-dark">Recent Employees</span>
            </div>
            <router-link to="/employees" class="small text-decoration-none fw-medium">View All</router-link>
          </div>

          <div class="card-body p-0">
            <div class="table-responsive">
              <table class="table table-hover align-middle mb-0">
                <thead class="table-light text-secondary text-uppercase" style="font-size: 0.72rem; letter-spacing: 0.05em;">
                  <tr>
                    <th class="ps-4">Employee Name</th>
                    <th>Department</th>
                    <th>Role</th>
                    <th class="text-end pe-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="emp in recentEmployees" :key="emp.id">
                    <td class="ps-4">
                      <router-link 
                        :to="`/employees/${emp.id}`" 
                        class="fw-semibold text-primary text-decoration-none hover-underline"
                      >
                        {{ emp.name }}
                      </router-link>
                    </td>
                    <td class="text-secondary small">{{ emp.department }}</td>
                    <td class="text-secondary small">{{ emp.role }}</td>
                    <td class="text-end pe-4">
                      <BaseBadge :variant="emp.status === 'Active' ? 'success' : 'secondary'">
                        {{ emp.status }}
                      </BaseBadge>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent System Activity -->
      <div class="col-lg-5">
        <div class="card shadow-sm border h-100">
          <div class="card-header bg-white py-3 px-4 border-bottom d-flex align-items-center gap-2">
            <i class="bi bi-activity text-primary"></i>
            <span class="fw-semibold text-dark">System Activity Log</span>
          </div>

          <div class="card-body p-3">
            <div v-if="activities.length === 0" class="text-center text-muted py-4 small">
              No recent system activity recorded.
            </div>

            <div v-else class="vstack gap-3" style="max-height: 280px; overflow-y: auto;">
              <div 
                v-for="act in activities.slice(0, 5)" 
                :key="act.id"
                class="d-flex align-items-start gap-3 p-2 rounded bg-light border-start border-4"
                :class="`border-${act.variant || act.type || 'primary'}`"
              >
                <div>
                  <div class="fw-semibold text-dark small">{{ act.title || act.action }}</div>
                  <div class="text-secondary" style="font-size: 0.78rem;">{{ act.description || act.details }}</div>
                  <small class="text-muted" style="font-size: 0.68rem;">{{ act.timestamp || act.time }}</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.hover-underline:hover {
  text-decoration: underline !important;
}
</style>