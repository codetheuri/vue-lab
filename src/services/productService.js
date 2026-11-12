import { initialProducts } from '../data/products.js'
import { simulateDelay } from './api.js'

const STORAGE_KEY = 'vue_lab_products'

const getStoredProducts = () => {
  const saved = localStorage.getItem(STORAGE_KEY)
  return saved ? JSON.parse(saved) : JSON.parse(JSON.stringify(initialProducts))
}

const saveProducts = (data) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export const productService = {
  async fetchAll() {
    await simulateDelay(300)
    return getStoredProducts()
  },

  async create(payload) {
    await simulateDelay(500)
    const list = getStoredProducts()
    const newId = list.length > 0 ? Math.max(...list.map(p => p.id)) + 1 : 1
    const sku = `PRD-${String(newId).padStart(3, '0')}`
    const newProduct = { id: newId, sku, ...payload }
    list.push(newProduct)
    saveProducts(list)
    return newProduct
  },

  async update(id, payload) {
    await simulateDelay(500)
    const list = getStoredProducts()
    const index = list.findIndex(p => p.id === id)
    if (index !== -1) {
      list[index] = { ...list[index], ...payload }
      saveProducts(list)
      return list[index]
    }
    return null
  },

  async remove(id) {
    await simulateDelay(300)
    const list = getStoredProducts().filter(p => p.id !== id)
    saveProducts(list)
    return true
  },

  async syncAll(updatedList) {
    saveProducts(updatedList)
    return updatedList
  },

  async reset() {
    await simulateDelay(500)
    const defaults = JSON.parse(JSON.stringify(initialProducts))
    saveProducts(defaults)
    return defaults
  }
}