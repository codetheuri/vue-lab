import { initialEmployees } from '../data/employees.js'
import { simulateDelay, api } from './api.js'

const USE_MOCK = import.meta.env.VITE_USE_MOCK_API !== 'false'
const STORAGE_KEY = 'vue_lab_employees'

const getStoredEmployees = () => {
  const saved = localStorage.getItem(STORAGE_KEY)
  return saved ? JSON.parse(saved) : JSON.parse(JSON.stringify(initialEmployees))
}

const saveEmployees = (data) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export const employeeService = {
  async fetchAll(params = {}) {
    if (USE_MOCK) {
      await simulateDelay(300)
      return getStoredEmployees()
    }
    return await api.get('/employees', params)
  },

  async getById(id) {
    if (USE_MOCK) {
      await simulateDelay(200)
      const list = getStoredEmployees()
      return list.find(e => Number(e.id) === Number(id)) || null
    }
    return await api.get(`/employees/${id}`)
  },

  async create(payload) {
    if (USE_MOCK) {
      await simulateDelay(500)
      const list = getStoredEmployees()
      const newId = list.length > 0 ? Math.max(...list.map(e => e.id)) + 1 : 1
      const newEmployee = { id: newId, assignedEquipment: [], ...payload }
      list.push(newEmployee)
      saveEmployees(list)
      return newEmployee
    }
    return await api.post('/employees', payload)
  },

  async update(id, payload) {
    if (USE_MOCK) {
      await simulateDelay(500)
      const list = getStoredEmployees()
      const index = list.findIndex(e => Number(e.id) === Number(id))
      if (index !== -1) {
        list[index] = { ...list[index], ...payload }
        saveEmployees(list)
        return list[index]
      }
      return null
    }
    return await api.put(`/employees/${id}`, payload)
  },

  async remove(id) {
    if (USE_MOCK) {
      await simulateDelay(300)
      const list = getStoredEmployees().filter(e => Number(e.id) !== Number(id))
      saveEmployees(list)
      return true
    }
    return await api.delete(`/employees/${id}`)
  },

  async bulkRemove(ids) {
    if (!Array.isArray(ids) || ids.length === 0) {
      return { deletedCount: 0, deletedIds: [] }
    }
    const numericIds = ids.map(Number)
    if (USE_MOCK) {
      await simulateDelay(300)
      const list = getStoredEmployees()
      const remaining = list.filter(e => !numericIds.includes(Number(e.id)))
      saveEmployees(remaining)
      return { deletedCount: list.length - remaining.length, deletedIds: numericIds }
    }
    return await api.post('/employees/bulk-delete', { ids: numericIds })
  },

  async syncAll(updatedList) {
    if (USE_MOCK) {
      saveEmployees(updatedList)
      return updatedList
    }
    return await api.put('/employees/sync', { employees: updatedList })
  },

  async reset() {
    if (USE_MOCK) {
      await simulateDelay(500)
      const defaults = JSON.parse(JSON.stringify(initialEmployees))
      saveEmployees(defaults)
      return defaults
    }
    return await api.post('/employees/reset')
  }
}