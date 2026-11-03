<script setup>
import { ref } from 'vue'
import { initialProducts } from '../data/products'
import { ProductFormViewModel } from '../viewmodels/ProductFormViewModel.js'
import BaseInput from '../components/base/BaseInput.vue'
import BaseModal from '../components/base/BaseModal.vue'

// Products data source ready for DataTable reuse
const products = ref(initialProducts)

const buttonText = ref('Add Product')

// Modal state
const isModalOpen = ref(false)

const closeModal = () => {
  isModalOpen.value = false
}

// Instantiate ViewModel with actual save logic pushing to products.value
const vm = new ProductFormViewModel({}, async (formData) => {
  console.log('Saving product...', formData)
  
  // Push new product into reactive array with mock SKU, stock, and status
  products.value.push({
    id: Date.now(),
    sku: 'SKU-' + Math.floor(1000 + Math.random() * 9000),
    status: 'In Stock',
    stock: 25,
    ...formData
  })

  closeModal()
  
  // Reset form fields if method exists on ViewModel
  if (typeof vm.resetForm === 'function') {
    vm.resetForm()
  }
})

// Target columns illustrating schema reusability for DataTable.vue
const tableColumns = [
  { key: 'sku', label: 'SKU' },
  { key: 'name', label: 'Product Name' },
  { key: 'category', label: 'Category' },
  { key: 'price', label: 'Unit Price' },
  { key: 'stock', label: 'Stock Level' },
  { key: 'status', label: 'Availability' },
  { key: 'actions', label: 'Actions' }
]
</script>

<template>
  <div class="products-page">
    <!-- Page Header -->
    <div class="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-3 mb-4">
      <div>
        <h1 class="h3 fw-bold text-dark mb-1">Products & Inventory</h1>
        <p class="text-secondary small mb-0">
          Track hardware, software licenses, and equipment allocations.
        </p>
      </div>

      <!-- Action Button with Click Handler -->
      <button 
        type="button" 
        class="btn btn-primary d-inline-flex align-items-center gap-2 shadow-sm"
        @click="isModalOpen = true"
      >
        <i class="bi bi-plus-circle-fill"></i>
        <span>{{ buttonText }}</span>
      </button>
    </div>

    <!-- Data Table Placeholder Card -->
    <div class="card shadow-sm border">
      <div class="card-header bg-white py-3 px-4 border-bottom d-flex align-items-center justify-content-between">
        <div class="d-flex align-items-center gap-2">
          <i class="bi bi-box-seam text-primary"></i>
          <span class="fw-semibold text-dark">Product Catalog Table</span>
        </div>
        <span class="badge bg-primary-subtle text-primary border border-primary-subtle">
          {{ products.length }} Items Registered
        </span>
      </div>

      <div class="card-body p-4 text-center">
        <div class="py-5">
          <div class="d-inline-flex align-items-center justify-content-center bg-light text-primary rounded-circle p-3 mb-3" style="width: 64px; height: 64px;">
            <i class="bi bi-layers fs-2"></i>
          </div>

          <h2 class="h5 fw-bold text-dark mb-2">Reusable DataTable Placeholder</h2>
          <p class="text-secondary small mx-auto mb-4" style="max-width: 520px;">
            Demonstrating multi-domain reusability: the same generic <code>DataTable.vue</code> will render product inventory using a distinct column configuration.
          </p>

          <!-- Schema Blueprint Preview -->
          <div class="p-3 bg-light rounded text-start mx-auto mb-3" style="max-width: 640px;">
            <div class="small fw-bold text-uppercase text-secondary mb-2" style="font-size: 0.75rem;">
              Planned Column Configuration:
            </div>
            <div class="d-flex flex-wrap gap-2">
              <span
                v-for="col in tableColumns"
                :key="col.key"
                class="badge bg-white text-dark border shadow-sm px-2 py-1 font-monospace"
              >
                {{ col.label }} <small class="text-muted">({{ col.key }})</small>
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="card-footer bg-light py-2 px-4 border-top text-secondary small d-flex justify-content-between align-items-center">
        <span>Component: <code>src/components/table/DataTable.vue</code></span>
        <span class="text-muted">Domain: Inventory / Products</span>
      </div>
    </div>

    <!-- Add Product Modal -->
    <BaseModal
      :show="isModalOpen"
      title="Register New Inventory Item"
      subtitle="Fill in the details below to add a product to the catalog."
      @close="closeModal"
    >
      <form @submit.prevent="vm.submit()">
        <BaseInput
          label="Product Name"
          v-model="vm.form.name"
          placeholder="e.g. Wireless Mouse"
        />

        <BaseInput
          label="Price"
          type="number"
          v-model="vm.form.price"
          placeholder="0.00"
        />

        <BaseInput
          label="Category"
          v-model="vm.form.category"
          placeholder="e.g. Electronics"
        />

        <div class="d-flex justify-content-end gap-2 mt-4">
          <button
            type="button"
            class="btn btn-secondary btn-sm"
            @click="closeModal"
          >
            Cancel
          </button>
          
          <button
            type="submit"
            class="btn btn-primary btn-sm"
            :disabled="!vm.isValid"
          >
            Save Product
          </button>
        </div>
      </form>
    </BaseModal>
  </div>
</template>