import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { productService } from '../services/productService.js'
import { useActivityStore } from './activityStore'

export const useProductStore = defineStore('product', () => {
  const activityStore = useActivityStore()
  const loading = ref(false)
  const products = ref([])

  const fetchProducts = async () => {
    loading.value = true
    try {
      products.value = await productService.fetchAll()
    } finally {
      loading.value = false
    }
  }

  // Initial fetch on store instantiation
  fetchProducts()

  const totalProducts = computed(() => products.value.length)
  const lowStockCount = computed(() => products.value.filter(p => p.stock > 0 && p.stock < 10).length)
  const outOfStockCount = computed(() => products.value.filter(p => p.stock === 0).length)
  const totalValuation = computed(() => products.value.reduce((acc, p) => acc + (Number(p.price) * Number(p.stock)), 0))

  const addProduct = async (payload) => {
    loading.value = true
    try {
      const created = await productService.create(payload)
      products.value.push(created)
      activityStore.logAction('Product Added', `Added "${created.name}" (${created.sku}) to inventory.`, 'success')
    } finally {
      loading.value = false
    }
  }

  const updateProduct = async (id, payload) => {
    loading.value = true
    try {
      const updated = await productService.update(id, payload)
      if (updated) {
        const index = products.value.findIndex(p => p.id === id)
        if (index !== -1) {
          const oldName = products.value[index].name
          products.value[index] = updated
          activityStore.logAction('Product Updated', `Updated product details for "${oldName}".`, 'info')
        }
      }
    } finally {
      loading.value = false
    }
  }

  const deleteProduct = async (id) => {
    const prod = products.value.find(p => p.id === id)
    await productService.remove(id)
    products.value = products.value.filter(p => p.id !== id)
    if (prod) {
      activityStore.logAction('Product Deleted', `Removed "${prod.name}" (${prod.sku}) from inventory.`, 'danger')
    }
  }

  const syncProducts = async () => {
    await productService.syncAll(products.value)
  }

  const resetProducts = async () => {
    loading.value = true
    try {
      products.value = await productService.reset()
      activityStore.logAction('Catalog Reset', 'Restored product catalog to default mock data.', 'warning')
    } finally {
      loading.value = false
    }
  }

  return {
    products,
    loading,
    totalProducts,
    lowStockCount,
    outOfStockCount,
    totalValuation,
    fetchProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    syncProducts,
    resetProducts
  }
})