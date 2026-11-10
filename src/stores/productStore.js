import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { initialProducts } from '../data/products'
import { useActivityStore } from './activityStore'

export const useProductStore = defineStore('product', () => {
  const activityStore = useActivityStore()
  
  const saved = localStorage.getItem('vue_lab_products')
  const products = ref(saved ? JSON.parse(saved) : initialProducts)

  watch(products, (newVal) => {
    localStorage.setItem('vue_lab_products', JSON.stringify(newVal))
  }, { deep: true })

  const totalProducts = computed(() => products.value.length)
  const lowStockCount = computed(() => products.value.filter(p => p.stock > 0 && p.stock < 10).length)
  const outOfStockCount = computed(() => products.value.filter(p => p.stock === 0).length)
  const totalValuation = computed(() => products.value.reduce((acc, p) => acc + (Number(p.price) * Number(p.stock)), 0))

  const addProduct = (payload) => {
    const newId = products.value.length > 0 ? Math.max(...products.value.map(p => p.id)) + 1 : 1
    const sku = `PRD-${String(newId).padStart(3, '0')}`
    products.value.push({ id: newId, sku, ...payload })
    activityStore.logAction('Product Added', `Added "${payload.name}" (${sku}) to inventory.`, 'success')
  }

  const updateProduct = (id, payload) => {
    const index = products.value.findIndex(p => p.id === id)
    if (index !== -1) {
      const oldName = products.value[index].name
      products.value[index] = { ...products.value[index], ...payload }
      activityStore.logAction('Product Updated', `Updated product details for "${oldName}".`, 'info')
    }
  }

  const deleteProduct = (id) => {
    const prod = products.value.find(p => p.id === id)
    products.value = products.value.filter(p => p.id !== id)
    if (prod) {
      activityStore.logAction('Product Deleted', `Removed "${prod.name}" (${prod.sku}) from inventory.`, 'danger')
    }
  }

  const resetProducts = () => {
    products.value = JSON.parse(JSON.stringify(initialProducts))
    activityStore.logAction('Catalog Reset', 'Restored product catalog to default mock data.', 'warning')
  }

  return {
    products,
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