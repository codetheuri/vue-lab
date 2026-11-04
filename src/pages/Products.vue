<script setup>
import { ref, computed } from 'vue'
import { initialProducts } from '../data/products'
import { ProductFormViewModel } from '../viewmodels/ProductFormViewModel.js'
import BaseInput from '../components/base/BaseInput.vue'
import BaseModal from '../components/base/BaseModal.vue'
import BaseButton from '../components/base/BaseButton.vue'
import DataTable from '../components/table/DataTable.vue'
import TableSearch from '../components/table/TableSearch.vue'
import TablePagination from '../components/table/TablePagination.vue'
import TableFilters from '../components/table/TableFilters.vue' 

const products = ref(initialProducts)
const searchQuery = ref('')
const selectedCategory = ref('') // Default empty (All categories)
const currentPage = ref(1)
const itemsPerPage = ref(5)
const isModalOpen = ref(false)

const closeModal = () => {
  isModalOpen.value = false
}

const vm = new ProductFormViewModel({}, async (formData) => {
  products.value.push({
    id: Date.now(),
    sku: 'SKU-' + Math.floor(1000 + Math.random() * 9000),
    status: 'In Stock',
    stock: 25,
    ...formData
  })
  closeModal()
  if (typeof vm.resetForm === 'function') vm.resetForm()
})

const deleteProduct = (id) => {
  products.value = products.value.filter((prod) => prod.id !== id)
}

// Generate dynamic category options for TableFilters component
const categoryOptions = computed(() => {
  const uniqueCategories = [...new Set(products.value.map(p => p.category).filter(Boolean))]
  return [
    { value: '', label: 'All Categories' },
    ...uniqueCategories.map(cat => ({ value: cat, label: cat }))
  ]
})

// Filtered products list (Search text + Category filter)
const filteredProducts = computed(() => {
  return products.value.filter(product => {
    const query = searchQuery.value.toLowerCase().trim()
    const matchesSearch = !query || 
      product.name?.toLowerCase().includes(query) ||
      product.category?.toLowerCase().includes(query) ||
      product.sku?.toLowerCase().includes(query)

    const matchesCategory = !selectedCategory.value || product.category === selectedCategory.value

    return matchesSearch && matchesCategory
  })
})

// Paginated subset of filtered products
const paginatedProducts = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredProducts.value.slice(start, end)
})

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

    <!-- Data Table Card with Integrated TableFilters and TableSearch -->
    <div class="card shadow-sm border">
      <div class="card-header bg-white py-3 px-4 border-bottom d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-3">
        <div class="d-flex align-items-center gap-2">
          <i class="bi bi-box-seam text-primary"></i>
          <span class="fw-semibold text-dark">Product Catalog Table</span>
          <span class="badge bg-primary-subtle text-primary border border-primary-subtle ms-2">
            {{ filteredProducts.length }} Records
          </span>
        </div>

<<<<<<< HEAD
        <!-- Integrated TableSearch Component with clearable enabled -->
        <div style="max-width: 280px; width: 100%;">
          <TableSearch
            v-model="searchQuery"
            size="sm"
         
            placeholder="Search products..."
            clearable
=======
        <!-- Filter and Search Toolbar -->
        <div class="d-flex flex-wrap align-items-center gap-3">
          <TableFilters
            v-model="selectedCategory"
            label="Category"
            :options="categoryOptions"
>>>>>>> ecdb3f7c19ba431be80653d4321423dd03a4739c
          />

          <div style="max-width: 250px; width: 100%;">
            <TableSearch
              v-model="searchQuery"
              placeholder="Search products..."
              clearable
            />
          </div>
        </div>
      </div>

      <!-- Render Paginated Slice -->
      <DataTable :columns="tableColumns" :data="paginatedProducts" empty-text="No matching products found.">
        <template #cell(price)="{ value }">
          <span class="fw-semibold text-dark">${{ Number(value).toFixed(2) }}</span>
        </template>

        <template #cell(status)="{ value }">
          <span class="badge bg-success-subtle text-success border border-success-subtle">
            {{ value }}
          </span>
        </template>

        <template #cell(actions)="{ row }">
          <BaseButton
            variant="outline-danger"
            size="sm"
            icon="bi bi-trash"
            @click="deleteProduct(row.id)"
          />
        </template>
      </DataTable>

      <!-- Integrated Pagination Footer -->
      <TablePagination
        v-model:currentPage="currentPage"
        v-model:itemsPerPage="itemsPerPage"
        :totalItems="filteredProducts.length"
      />
    </div>

    <!-- Modal -->
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
            text="Save Product"
            :disabled="!vm.isValid"
          />
        </div>
      </form>
    </BaseModal>
  </div>
</template>