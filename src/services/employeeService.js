import { initialEmployees } from '../data/employees.js'
import { simulateDelay } from './api.js'

const STORAGE_KEY = 'vue_lab_employees'

const getStoredEmployees = () => {
  const saved = localStorage.getItem(STORAGE_KEY)
  return saved ? JSON.parse(saved) : JSON.parse(JSON.stringify(initialEmployees))
}

const saveEmployees = (data) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export const employeeService = {
  async fetchAll() {
    await simulateDelay(300)
    return getStoredEmployees()
  },

  async create(payload) {
    await simulateDelay(500)
    const list = getStoredEmployees()
    const newId = list.length > 0 ? Math.max(...list.map(e => e.id)) + 1 : 1
    const newEmployee = { id: newId, assignedEquipment: [], ...payload }
    list.push(newEmployee)
    saveEmployees(list)
    return newEmployee
  },

  async update(id, payload) {
    await simulateDelay(500)
    const list = getStoredEmployees()
    const index = list.findIndex(e => e.id === id)
    if (index !== -1) {
      list[index] = { ...list[index], ...payload }
      saveEmployees(list)
      return list[index]
    }
    return null
  },

  async remove(id) {
    await simulateDelay(300)
    const list = getStoredEmployees().filter(e => e.id !== id)
    saveEmployees(list)
    return true
  },

  async syncAll(updatedList) {
    saveEmployees(updatedList)
    return updatedList
  },

  async reset() {
    await simulateDelay(500)
    const defaults = JSON.parse(JSON.stringify(initialEmployees))
    saveEmployees(defaults)
    return defaults
  }
}