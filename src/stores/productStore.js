import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { initialProducts } from '../data/products.js'
import { useActivityStore } from './activityStore'

export const useProductStore = defineStore('product', () => {
  const activityStore = useActivityStore()
  const loading = ref(false)
  
  const saved = localStorage.getItem('vue_lab_products')
  const products = ref(saved ? JSON.parse(saved) : JSON.parse(JSON.stringify(initialProducts)))

  watch(products, (newVal) => {
    localStorage.setItem('vue_lab_products', JSON.stringify(newVal))
  }, { deep: true })

  const totalProducts = computed(() => products.value.length)
  const lowStockCount = computed(() => products.value.filter(p => p.stock > 0 && p.stock < 10).length)
  const outOfStockCount = computed(() => products.value.filter(p => p.stock === 0).length)
  const totalValuation = computed(() => products.value.reduce((acc, p) => acc + (Number(p.price) * Number(p.stock)), 0))

  const addProduct = async (payload) => {
    loading.value = true
    await new Promise(resolve => setTimeout(resolve, 500))
    const newId = products.value.length > 0 ? Math.max(...products.value.map(p => p.id)) + 1 : 1
    const sku = `PRD-${String(newId).padStart(3, '0')}`
    products.value.push({ id: newId, sku, ...payload })
    activityStore.logAction('Product Added', `Added "${payload.name}" (${sku}) to inventory.`, 'success')
    loading.value = false
  }

  const updateProduct = async (id, payload) => {
    loading.value = true
    await new Promise(resolve => setTimeout(resolve, 500))
    const index = products.value.findIndex(p => p.id === id)
    if (index !== -1) {
      const oldName = products.value[index].name
      products.value[index] = { ...products.value[index], ...payload }
      activityStore.logAction('Product Updated', `Updated product details for "${oldName}".`, 'info')
    }
    loading.value = false
  }

  const deleteProduct = async (id) => {
    const prod = products.value.find(p => p.id === id)
    products.value = products.value.filter(p => p.id !== id)
    if (prod) {
      activityStore.logAction('Product Deleted', `Removed "${prod.name}" (${prod.sku}) from inventory.`, 'danger')
    }
  }

  const resetProducts = async () => {
    loading.value = true
    await new Promise(resolve => setTimeout(resolve, 500))
    products.value = JSON.parse(JSON.stringify(initialProducts))
    activityStore.logAction('Catalog Reset', 'Restored product catalog to default mock data.', 'warning')
    loading.value = false
  }

  return {
    products,
    loading,
    totalProducts,
    lowStockCount,
    outOfStockCount,
    totalValuation,
    addProduct,
    updateProduct,
    deleteProduct,
    resetProducts
  }
})