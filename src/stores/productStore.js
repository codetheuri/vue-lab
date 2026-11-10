import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { useActivityStore } from './activityStore'

const DEFAULT_PRODUCTS = [
  { id: 1, sku: 'PRD-001', name: 'Ergonomic Office Chair', category: 'Furniture', price: 249.99, stock: 15, status: 'In Stock' },
  { id: 2, sku: 'PRD-002', name: 'Wireless Mechanical Keyboard', category: 'Peripherals', price: 129.99, stock: 8, status: 'Low Stock' },
  { id: 3, sku: 'PRD-003', name: 'Ultra-Wide 34" Monitor', category: 'Electronics', price: 599.99, stock: 0, status: 'Out of Stock' },
  { id: 4, sku: 'PRD-004', name: 'USB-C Docking Station', category: 'Peripherals', price: 89.99, stock: 24, status: 'In Stock' },
  { id: 5, sku: 'PRD-005', name: 'Standing Desk Frame', category: 'Furniture', price: 399.99, stock: 5, status: 'Low Stock' },
  { id: 6, sku: 'PRD-006', name: 'Vue 3 Enterprise License', category: 'Software', price: 299.00, stock: 100, status: 'In Stock' },
  { id: 7, sku: 'PRD-007', name: 'DDR5 32GB RAM Kit', category: 'Hardware', price: 149.99, stock: 12, status: 'In Stock' }
]

export const useProductStore = defineStore('product', () => {
  const activityStore = useActivityStore()
  
  const saved = localStorage.getItem('vue_lab_products')
  const products = ref(saved ? JSON.parse(saved) : DEFAULT_PRODUCTS)

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
    products.value = JSON.parse(JSON.stringify(DEFAULT_PRODUCTS))
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