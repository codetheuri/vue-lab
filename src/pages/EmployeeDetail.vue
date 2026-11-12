<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useEmployeeStore } from '../stores/employeeStore'
import { useProductStore } from '../stores/productStore'
import { useAuthStore } from '../stores/authStore'
import { useToast } from '../composables/useToast'
import BaseButton from '../components/base/BaseButton.vue'
import BaseBadge from '../components/base/BaseBadge.vue'
import BaseModal from '../components/base/BaseModal.vue'
import BaseSelect from '../components/base/BaseSelect.vue'
import { formatDate } from '../utils/formatters'
const route = useRoute()
const router = useRouter()
const employeeStore = useEmployeeStore()
const productStore = useProductStore()
const authStore = useAuthStore()
const { showSuccess, showDanger, showInfo } = useToast()

const { products } = storeToRefs(productStore)

const employeeId = computed(() => Number(route.params.id))
const employee = computed(() => {
  return employeeStore.employees.find(e => e.id === employeeId.value)
})

const goBack = () => {
  router.push('/employees')
}

// Assignment Modal State
const isAssignModalOpen = ref(false)
const selectedProductId = ref('')

const availableProductOptions = computed(() => {
  return products.value.map(p => ({
    value: p.id,
    label: `${p.name} (${p.sku}) — Stock: ${p.stock}`,
    disabled: p.stock <= 0
  }))
})

const openAssignModal = () => {
  selectedProductId.value = ''
  isAssignModalOpen.value = true
}

const handleAssign = async () => {
  if (!selectedProductId.value) return
  const prod = products.value.find(p => p.id === Number(selectedProductId.value))
  if (!prod || prod.stock <= 0) {
    showDanger('Selected product is out of stock and cannot be assigned.')
    return
  }

  const success = await employeeStore.assignEquipment(employee.value.id, prod)
  if (success) {
    showSuccess(`Successfully assigned "${prod.name}" to ${employee.value.name}!`)
    isAssignModalOpen.value = false
  }
}

const handleUnassign = async (productId, productName) => {
  const success = await employeeStore.unassignEquipment(employee.value.id, productId)
  if (success) {
    showInfo(`Returned "${productName}" to inventory stock.`)
  }
}
</script>

<template>
  <div class="employee-detail-page py-3">
    <!-- Employee Not Found State -->
    <div v-if="!employee" class="card shadow-sm border text-center p-5">
      <div class="mb-3">
        <i class="bi bi-person-exclamation text-warning display-4"></i>
      </div>
      <h2 class="h4 fw-bold text-dark mb-2">Employee Not Found</h2>
      <p class="text-secondary small mb-4">
        We couldn't find any personnel record matching ID <code class="text-primary fw-bold">#{{ route.params.id }}</code>.
      </p>
      <div>
        <BaseButton
          variant="primary"
          size="md"
          text="Back to Directory"
          icon="bi bi-arrow-left"
          @click="goBack"
        />
      </div>
    </div>

    <!-- Employee Profile View -->
    <div v-else>
      <!-- Page Header -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div class="d-flex align-items-center gap-3">
          <BaseButton
            variant="outline-secondary"
            size="sm"
            icon="bi bi-arrow-left"
            title="Back to Employees"
            @click="goBack"
          />
          <div>
            <h1 class="h3 fw-bold text-dark mb-1">{{ employee.name }}</h1>
            <p class="text-secondary small mb-0">Personnel Profile & Company Equipment Allocation</p>
          </div>
        </div>

        <BaseBadge :variant="employee.status === 'Active' ? 'success' : 'secondary'">
          {{ employee.status }}
        </BaseBadge>
      </div>

      <!-- Details Card -->
      <div class="card shadow-sm border mb-4">
        <div class="card-header bg-white py-3 px-4 border-bottom d-flex align-items-center gap-2">
          <i class="bi bi-person-badge text-primary fs-5"></i>
          <span class="fw-semibold text-dark">Personnel Information</span>
        </div>

        <div class="card-body p-4">
          <div class="row g-4">
            <div class="col-md-6">
              <span class="text-secondary small d-block mb-1">Full Name</span>
              <span class="fw-semibold text-dark fs-6">{{ employee.name }}</span>
            </div>

            <div class="col-md-6">
              <span class="text-secondary small d-block mb-1">Email Address</span>
              <span class="text-dark">{{ employee.email || 'N/A' }}</span>
            </div>

            <div class="col-md-6">
              <span class="text-secondary small d-block mb-1">Department</span>
              <span class="badge bg-light text-dark border">{{ employee.department }}</span>
            </div>

            <div class="col-md-6">
              <span class="text-secondary small d-block mb-1">Role / Job Title</span>
              <span class="text-dark fw-medium">{{ employee.role }}</span>
            </div>

            <div class="col-md-6">
              <span class="text-secondary small d-block mb-1">Phone Number</span>
              <span class="text-dark">{{ employee.phone || 'N/A' }}</span>
            </div>

            <div class="col-md-6">
              <span class="text-secondary small d-block mb-1">Join Date</span>
              <span class="text-dark">{{ formatDate(employee.joinDate) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Assigned Equipment Card -->
      <div class="card shadow-sm border">
        <div class="card-header bg-white py-3 px-4 border-bottom d-flex align-items-center justify-content-between">
          <div class="d-flex align-items-center gap-2">
            <i class="bi bi-laptop text-primary fs-5"></i>
            <span class="fw-semibold text-dark">Assigned Company Equipment</span>
            <span class="badge bg-primary-subtle text-primary border border-primary-subtle ms-2">
              {{ employee.assignedEquipment?.length || 0 }} Items
            </span>
          </div>

          <BaseButton
            v-if="authStore.isAdmin"
            variant="primary"
            size="sm"
            text="Assign Equipment"
            icon="bi bi-plus-circle"
            @click="openAssignModal"
          />
        </div>

        <div class="card-body p-0">
          <div v-if="!employee.assignedEquipment || employee.assignedEquipment.length === 0" class="text-center py-5 text-muted small">
            <i class="bi bi-box fs-3 d-block mb-2 text-secondary"></i>
            No equipment currently assigned to this employee.
          </div>

          <div v-else class="table-responsive">
            <table class="table table-hover align-middle mb-0">
              <thead class="table-light text-secondary text-uppercase fs-7" style="font-size: 0.75rem; letter-spacing: 0.05em;">
                <tr>
                  <th class="ps-4">SKU</th>
                  <th>Item Name</th>
                  <th>Category</th>
                  <th>Assigned Date</th>
                  <th v-if="authStore.isAdmin" class="text-end pe-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in employee.assignedEquipment" :key="item.productId">
                  <td class="ps-4 fw-medium text-dark">{{ item.sku }}</td>
                  <td>{{ item.name }}</td>
                  <td><span class="badge bg-light text-dark border">{{ item.category }}</span></td>
                  <td class="text-secondary small">{{ formatDate(item.assignedDate) }}</td>
                  <td v-if="authStore.isAdmin" class="text-end pe-4">
                    <BaseButton
                      variant="outline-danger"
                      size="sm"
                      text="Return Item"
                      icon="bi bi-arrow-counterclockwise"
                      @click="handleUnassign(item.productId, item.name)"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Assign Equipment Modal -->
    <BaseModal
      v-if="authStore.isAdmin"
      :show="isAssignModalOpen"
      title="Assign Company Equipment"
      subtitle="Select an inventory item to assign to this employee."
      @close="isAssignModalOpen = false"
    >
      <form @submit.prevent="handleAssign">
        <BaseSelect
          label="Available Inventory Item"
          v-model="selectedProductId"
          :options="availableProductOptions"
          placeholder="Select product..."
        />

        <div class="p-2 bg-light rounded border text-muted small mt-3">
          <i class="bi bi-info-circle me-1 text-primary"></i>
          <strong>Stock Rule:</strong> Assigning an item will automatically reduce its available inventory stock by 1. Out-of-stock items cannot be selected.
        </div>

        <div class="d-flex justify-content-end gap-2 mt-4">
          <BaseButton
            type="button"
            variant="secondary"
            size="sm"
            text="Cancel"
            @click="isAssignModalOpen = false"
          />
          <BaseButton
            type="submit"
            variant="primary"
            size="sm"
            text="Confirm Assignment"
          />
        </div>
      </form>
    </BaseModal>
  </div>
</template>