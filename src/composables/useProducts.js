import { ref, computed } from 'vue'
import { initialProducts } from '../data/products'

// Singleton reactive state shared across components
const products = ref(initialProducts)

export function useProducts() {
  const addProduct = (payload) => {
    products.value.push({
      id: Date.now(),
      sku: 'SKU-' + Math.floor(1000 + Math.random() * 9000),
      status: 'In Stock',
      stock: 25,
      ...payload
    })
  }

  const updateProduct = (id, payload) => {
    const index = products.value.findIndex(p => p.id === id)
    if (index !== -1) {
      products.value[index] = { ...products.value[index], ...payload }
    }
  }

  const deleteProduct = (id) => {
    products.value = products.value.filter(p => p.id !== id)
  }

  // Computed statistics
  const totalProducts = computed(() => products.value.length)
  const lowStockProducts = computed(() => products.value.filter(p => p.stock < 10).length)
  const totalInventoryValue = computed(() => products.value.reduce((sum, p) => sum + (Number(p.price || 0) * Number(p.stock || 0)), 0))
  const categoryCount = computed(() => new Set(products.value.map(p => p.category).filter(Boolean)).size)

  return {
    products,
    totalProducts,
    lowStockProducts,
    totalInventoryValue,
    categoryCount,
    addProduct,
    updateProduct,
    deleteProduct
  }
}