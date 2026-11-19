import { initialProducts } from '../data/products.js'
import { simulateDelay, api } from './api.js'

const USE_MOCK = import.meta.env.VITE_USE_MOCK_API !== 'false'
const STORAGE_KEY = 'vue_lab_products'

const getStoredProducts = () => {
  const saved = localStorage.getItem(STORAGE_KEY)
  return saved ? JSON.parse(saved) : JSON.parse(JSON.stringify(initialProducts))
}

const saveProducts = (data) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export const productService = {
  async fetchAll(params = {}) {
    if (USE_MOCK) {
      await simulateDelay(300)
      return getStoredProducts()
    }
    return await api.get('/products', params)
  },

  async getById(id) {
    if (USE_MOCK) {
      await simulateDelay(200)
      const list = getStoredProducts()
      return list.find(p => Number(p.id) === Number(id)) || null
    }
    return await api.get(`/products/${id}`)
  },

  async create(payload) {
    if (USE_MOCK) {
      await simulateDelay(500)
      const list = getStoredProducts()
      const newId = list.length > 0 ? Math.max(...list.map(p => p.id)) + 1 : 1
      const sku = payload.sku || `PRD-${String(newId).padStart(3, '0')}`
      const newProduct = { id: newId, sku, ...payload }
      list.push(newProduct)
      saveProducts(list)
      return newProduct
    }
    return await api.post('/products', payload)
  },

  async update(id, payload) {
    if (USE_MOCK) {
      await simulateDelay(500)
      const list = getStoredProducts()
      const index = list.findIndex(p => Number(p.id) === Number(id))
      if (index !== -1) {
        list[index] = { ...list[index], ...payload }
        saveProducts(list)
        return list[index]
      }
      return null
    }
    return await api.put(`/products/${id}`, payload)
  },

  async remove(id) {
    if (USE_MOCK) {
      await simulateDelay(300)
      const list = getStoredProducts().filter(p => Number(p.id) !== Number(id))
      saveProducts(list)
      return true
    }
    return await api.delete(`/products/${id}`)
  },

  async bulkRemove(ids) {
    if (!Array.isArray(ids) || ids.length === 0) {
      return { deletedCount: 0, deletedIds: [] }
    }
    const numericIds = ids.map(Number)
    if (USE_MOCK) {
      await simulateDelay(300)
      const list = getStoredProducts()
      const remaining = list.filter(p => !numericIds.includes(Number(p.id)))
      saveProducts(remaining)
      return { deletedCount: list.length - remaining.length, deletedIds: numericIds }
    }
    return await api.post('/products/bulk-delete', { ids: numericIds })
  },

  async syncAll(updatedList) {
    if (USE_MOCK) {
      saveProducts(updatedList)
      return updatedList
    }
    return await api.put('/products/sync', { products: updatedList })
  },

  async reset() {
    if (USE_MOCK) {
      await simulateDelay(500)
      const defaults = JSON.parse(JSON.stringify(initialProducts))
      saveProducts(defaults)
      return defaults
    }
    return await api.post('/products/reset')
  }
}