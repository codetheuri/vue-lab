<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '../stores/authStore'
import { useEmployeeStore } from '../stores/employeeStore'
import { useProductStore } from '../stores/productStore'
import { usePermissions } from '../composables/usePermissions'
import { navItems } from '../config/navigation'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:show'])

const router = useRouter()
const authStore = useAuthStore()
const employeeStore = useEmployeeStore()
const productStore = useProductStore()
const { isAdmin } = usePermissions()

const { employees } = storeToRefs(employeeStore)
const { products } = storeToRefs(productStore)

const searchQuery = ref('')
const searchInputRef = ref(null)

// Focus input when modal opens
watch(() => props.show, async (isOpen) => {
  if (isOpen) {
    searchQuery.value = ''
    await nextTick()
    searchInputRef.value?.focus()
  }
})

const closeModal = () => {
  emit('update:show', false)
}

// Global keyboard listener for Ctrl+K / Cmd+K and Escape
const handleGlobalKeydown = (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault()
    emit('update:show', !props.show)
  } else if (e.key === 'Escape' && props.show) {
    closeModal()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleGlobalKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleGlobalKeydown)
})

// Filtered Pages matching role permissions
const matchingPages = computed(() => {
  const q = searchQuery.value.toLowerCase().trim()
  return navItems
    .filter(item => {
      // Check admin permission if required
      if (item.adminOnly && !isAdmin.value) return false
      if (!q) return true
      return item.label.toLowerCase().includes(q) || item.path.toLowerCase().includes(q)
    })
    .map(item => ({
      id: item.path,
      title: item.label,
      subtitle: `Page • ${item.path}`,
      icon: item.icon || 'bi bi-file-earmark',
      action: () => {
        router.push(item.path)
        closeModal()
      }
    }))
})

// Filtered Employees
const matchingEmployees = computed(() => {
  const q = searchQuery.value.toLowerCase().trim()
  if (!employees.value) return []
  
  return employees.value
    .filter(emp => {
      if (!q) return true
      return (
        (emp.name && emp.name.toLowerCase().includes(q)) ||
        (emp.email && emp.email.toLowerCase().includes(q)) ||
        (emp.department && emp.department.toLowerCase().includes(q)) ||
        (emp.role && emp.role.toLowerCase().includes(q))
      )
    })
    .slice(0, 5) // limit to top 5 matches
    .map(emp => ({
      id: `emp-${emp.id}`,
      title: emp.name,
      subtitle: `Employee • ${emp.department} (${emp.role})`,
      icon: 'bi bi-person',
      action: () => {
        router.push(`/employees/${emp.id}`)
        closeModal()
      }
    }))
})

// Filtered Products
const matchingProducts = computed(() => {
  const q = searchQuery.value.toLowerCase().trim()
  if (!products.value) return []

  return products.value
    .filter(prod => {
      if (!q) return true
      return (
        (prod.name && prod.name.toLowerCase().includes(q)) ||
        (prod.sku && prod.sku.toLowerCase().includes(q)) ||
        (prod.category && prod.category.toLowerCase().includes(q))
      )
    })
    .slice(0, 5) // limit to top 5 matches
    .map(prod => ({
      id: `prod-${prod.id}`,
      title: prod.name,
      subtitle: `Product • SKU: ${prod.sku} | Stock: ${prod.stock}`,
      icon: 'bi bi-box-seam',
      action: () => {
        router.push('/products')
        closeModal()
      }
    }))
})

const totalResultsCount = computed(() => {
  return matchingPages.value.length + matchingEmployees.value.length + matchingProducts.value.length
})
</script>

<template>
  <div v-if="show" class="command-palette-backdrop" @click="closeModal">
    <div class="command-palette-dialog" @click.stop>
      <!-- Search Input Header -->
      <div class="input-group p-3 border-bottom bg-light">
        <span class="input-group-text bg-white border-end-0 text-muted">
          <i class="bi bi-search"></i>
        </span>
        <input
          ref="searchInputRef"
          type="text"
          class="form-control border-start-0 shadow-none ps-0"
          placeholder="Type a command or search pages, employees, products..."
          v-model="searchQuery"
        />
        <button type="button" class="btn btn-outline-secondary border-start-0 bg-white" @click="closeModal">
          <small class="badge bg-secondary text-light">ESC</small>
        </button>
      </div>

      <!-- Results List -->
      <div class="command-palette-body p-2" style="max-height: 400px; overflow-y: auto;">
        <div v-if="totalResultsCount === 0" class="text-center py-4 text-muted small">
          <i class="bi bi-search fs-3 d-block mb-2 opacity-50"></i>
          No results found for "<strong>{{ searchQuery }}</strong>".
        </div>

        <!-- Pages Group -->
        <div v-if="matchingPages.length > 0" class="mb-3">
          <div class="text-uppercase text-muted fw-bold px-2 mb-1" style="font-size: 0.65rem; letter-spacing: 0.05em;">
            Navigation Pages
          </div>
          <div
            v-for="item in matchingPages"
            :key="item.id"
            class="command-item d-flex align-items-center justify-content-between p-2 rounded cursor-pointer"
            @click="item.action"
          >
            <div class="d-flex align-items-center gap-2">
              <span class="d-inline-flex align-items-center justify-content-center bg-primary-subtle text-primary rounded p-2" style="width: 32px; height: 32px;">
                <i :class="item.icon"></i>
              </span>
              <div>
                <div class="fw-semibold text-dark small">{{ item.title }}</div>
                <div class="text-muted" style="font-size: 0.725rem;">{{ item.subtitle }}</div>
              </div>
            </div>
            <i class="bi bi-arrow-return-left text-muted small"></i>
          </div>
        </div>

        <!-- Employees Group -->
        <div v-if="matchingEmployees.length > 0" class="mb-3">
          <div class="text-uppercase text-muted fw-bold px-2 mb-1" style="font-size: 0.65rem; letter-spacing: 0.05em;">
            Employees
          </div>
          <div
            v-for="item in matchingEmployees"
            :key="item.id"
            class="command-item d-flex align-items-center justify-content-between p-2 rounded cursor-pointer"
            @click="item.action"
          >
            <div class="d-flex align-items-center gap-2">
              <span class="d-inline-flex align-items-center justify-content-center bg-success-subtle text-success rounded p-2" style="width: 32px; height: 32px;">
                <i :class="item.icon"></i>
              </span>
              <div>
                <div class="fw-semibold text-dark small">{{ item.title }}</div>
                <div class="text-muted" style="font-size: 0.725rem;">{{ item.subtitle }}</div>
              </div>
            </div>
            <i class="bi bi-arrow-return-left text-muted small"></i>
          </div>
        </div>

        <!-- Products Group -->
        <div v-if="matchingProducts.length > 0" class="mb-3">
          <div class="text-uppercase text-muted fw-bold px-2 mb-1" style="font-size: 0.65rem; letter-spacing: 0.05em;">
            Products & Inventory
          </div>
          <div
            v-for="item in matchingProducts"
            :key="item.id"
            class="command-item d-flex align-items-center justify-content-between p-2 rounded cursor-pointer"
            @click="item.action"
          >
            <div class="d-flex align-items-center gap-2">
              <span class="d-inline-flex align-items-center justify-content-center bg-warning-subtle text-warning rounded p-2" style="width: 32px; height: 32px;">
                <i :class="item.icon"></i>
              </span>
              <div>
                <div class="fw-semibold text-dark small">{{ item.title }}</div>
                <div class="text-muted" style="font-size: 0.725rem;">{{ item.subtitle }}</div>
              </div>
            </div>
            <i class="bi bi-arrow-return-left text-muted small"></i>
          </div>
        </div>
      </div>

      <!-- Footer Info -->
      <div class="p-2 bg-light border-top text-end">
        <small class="text-muted" style="font-size: 0.7rem;">
          Navigate with click or press <kbd class="bg-white border px-1 rounded">ESC</kbd> to close
        </small>
      </div>
    </div>
  </div>
</template>

<style scoped>
.command-palette-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 10vh;
  z-index: 1050;
  backdrop-filter: blur(2px);
}

.command-palette-dialog {
  background: white;
  width: 100%;
  max-width: 600px;
  border-radius: 0.5rem;
  box-shadow: 0 1rem 3rem rgba(0, 0, 0, 0.175);
  overflow: hidden;
  animation: slideDown 0.2s ease-out;
}

.command-item:hover {
  background-color: rgba(var(--bs-primary-rgb), 0.08);
}

.cursor-pointer {
  cursor: pointer;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>