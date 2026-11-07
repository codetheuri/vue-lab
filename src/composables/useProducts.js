import { ref, computed, watch } from 'vue'

const STORAGE_KEY = 'app_products_data'

const initialProducts = [
  { id: 1, sku: 'PRD-001', name: 'Logitech MX Master 3S', price: 99.99, stock: 15, category: 'Peripherals', status: 'In Stock' },
  { id: 2, sku: 'PRD-002', name: 'Dell UltraSharp 27 Monitor', price: 349.50, stock: 4, category: 'Displays', status: 'Low Stock' },
  { id: 3, sku: 'PRD-003', name: 'USB-C Multi-Port Hub', price: 29.99, stock: 0, category: 'Accessories', status: 'Out of Stock' }
]

// 1. Load persisted inventory state or fallback mock data
const storedData = localStorage.getItem(STORAGE_KEY)
const products = ref(storedData ? JSON.parse(storedData) : initialProducts)

// 2. Sync changes back to localStorage reactively
watch(products, (newValue) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newValue))
}, { deep: true })

export function useProducts() {
  // Computed metrics for Dashboard.vue
  const totalProducts = computed(() => products.value.length)
  const lowStockProducts = computed(() => products.value.filter(p => p.status === 'Low Stock' || p.stock < 10).length)
  const categoryCount = computed(() => new Set(products.value.map(p => p.category).filter(Boolean)).size)
  const totalInventoryValue = computed(() => {
    return products.value.reduce((sum, item) => sum + (Number(item.price || 0) * Number(item.stock || 0)), 0)
  })

  // CRUD Operations
  const addProduct = (productData) => {
    const newProduct = {
      id: Date.now(),
      sku: `PRD-${Math.floor(100 + Math.random() * 900)}`,
      ...productData
    }
    products.value.push(newProduct)
  }

  const updateProduct = (id, updatedData) => {
    const index = products.value.findIndex(p => p.id === id)
    if (index !== -1) {
      products.value[index] = { ...products.value[index], ...updatedData }
    }
  }

  const deleteProduct = (id) => {
    const index = products.value.findIndex(p => p.id === id)
    if (index !== -1) {
      products.value.splice(index, 1)
    }
  }

  return {
    products,
    totalProducts,
    lowStockProducts,
    categoryCount,
    totalInventoryValue,
    addProduct,
    updateProduct,
    deleteProduct
  }
}