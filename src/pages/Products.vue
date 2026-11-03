<script setup>
import { ref } from 'vue'
import { initialProducts } from '../data/products'
import { ProductFormViewModel } from '../viewmodels/ProductFormViewModel.js'
import BaseInput from '../components/base/BaseInput.vue'
import BaseModal from '../components/base/BaseModal.vue'
import BaseButton from '../components/base/BaseButton.vue'
import DataTable from '../components/table/DataTable.vue'

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
  } else if (typeof vm.reset === 'function') {
    vm.reset()
  }
})

const deleteProduct = (id) => {
  products.value = products.value.filter((prod) => prod.id !== id)
}

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
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h1 class="h3 fw-bold text-dark mb-1">Products & Inventory</h1>
        <p class="text-secondary small mb-0">Track hardware, software licenses, and equipment allocations.</p>
      </div>

      
      <BaseButton
        variant="primary"
        size="md"
        text="Add Product"
        icon="bi bi-plus-circle-fill"
        @click="isModalOpen = true"
      />
    </div>
   <!--  Data Table Integration -->
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

      <DataTable :columns="tableColumns" :data="products">
        <!-- Custom Price Formatting Slot -->
        <template #cell(price)="{ value }">
          <span class="fw-semibold text-dark">${{ Number(value).toFixed(2) }}</span>
        </template>

        <!-- Custom Status Badge Slot -->
        <template #cell(status)="{ value }">
          <span class="badge bg-success-subtle text-success border border-success-subtle">
            {{ value }}
          </span>
        </template>

        <!-- Actions Slot -->
        <template #cell(actions)="{ row }">
          <BaseButton
            variant="outline-danger"
            size="sm"
            icon="bi bi-trash"
            @click="deleteProduct(row.id)"
          />
        </template>
      </DataTable>

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
          <BaseButton
            variant="secondary"
            size="sm"
            @click="closeModal"
          >
            Cancel
          </BaseButton>
          
          <BaseButton
            type="submit"
            variant="primary"
            size="sm"
            :disabled="!vm.isValid"
          >
            Save Product
          </BaseButton>
        </div>
      </form>
    </BaseModal>
  </div>
</template>