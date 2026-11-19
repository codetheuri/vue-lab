import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { productService } from '../services/productService.js'
import { useActivityStore } from './activityStore'
import { useSettingsStore } from './settingsStore'

export const useProductStore = defineStore('product', () => {
  const activityStore = useActivityStore()
  const settingsStore = useSettingsStore()

  const loading = ref(false)
  const error = ref(null)
  const products = ref([])

  const fetchProducts = async () => {
    loading.value = true
    error.value = null
    try {
      products.value = await productService.fetchAll()
    } catch (err) {
      error.value = err.message || 'Failed to load product catalog. Please check your connection.'
    } finally {
      loading.value = false
    }
  }

  // Initial fetch on store instantiation
  fetchProducts()

  const totalProducts = computed(() => products.value.length)
  
  const lowStockCount = computed(() => {
    const threshold = Number(settingsStore.lowStockThreshold) || 10
    return products.value.filter(p => p.stock > 0 && p.stock < threshold).length
  })

  const outOfStockCount = computed(() => products.value.filter(p => p.stock === 0).length)
  const totalValuation = computed(() => products.value.reduce((acc, p) => acc + (Number(p.price) * Number(p.stock)), 0))

  const addProduct = async (payload) => {
    loading.value = true
    try {
      const created = await productService.create(payload)
      products.value.push(created)
      activityStore.logAction('Product Added', `Added "${created.name}" (${created.sku}) to inventory.`, 'success')
      return created
    } catch (err) {
      if (err.status !== 422) {
        error.value = err.message || 'Failed to add product.'
      }
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateProduct = async (id, payload) => {
    loading.value = true
    try {
      const updated = await productService.update(id, payload)
      if (updated) {
        const index = products.value.findIndex(p => Number(p.id) === Number(id))
        if (index !== -1) {
          const oldName = products.value[index].name
          products.value[index] = updated
          activityStore.logAction('Product Updated', `Updated product details for "${oldName}".`, 'info')
        }
      }
      return updated
    } catch (err) {
      if (err.status !== 422) {
        error.value = err.message || 'Failed to update product.'
      }
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteProduct = async (id) => {
    try {
      const prod = products.value.find(p => Number(p.id) === Number(id))
      await productService.remove(id)
      products.value = products.value.filter(p => Number(p.id) !== Number(id))
      if (prod) {
        activityStore.logAction('Product Deleted', `Removed "${prod.name}" (${prod.sku}) from inventory.`, 'danger')
      }
    } catch (err) {
      if (err.status !== 403) {
        error.value = err.message || 'Failed to delete product.'
      }
      throw err
    }
  }

  const syncProducts = async () => {
    try {
      await productService.syncAll(products.value)
    } catch (err) {
      error.value = err.message || 'Failed to sync products.'
    }
  }

  const resetProducts = async () => {
    loading.value = true
    error.value = null
    try {
      products.value = await productService.reset()
      activityStore.logAction('Catalog Reset', 'Restored product catalog to default mock data.', 'warning')
    } catch (err) {
      if (err.status !== 403) {
        error.value = err.message || 'Failed to reset product catalog.'
      }
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    products,
    loading,
    error,
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