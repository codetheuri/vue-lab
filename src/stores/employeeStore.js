import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { employeeService } from '../services/employeeService.js'
import { useActivityStore } from './activityStore'
import { useProductStore } from './productStore'
import { useSettingsStore } from './settingsStore'

export const useEmployeeStore = defineStore('employee', () => {
  const activityStore = useActivityStore()
  const settingsStore = useSettingsStore()
  const loading = ref(false)
  const error = ref(null)
  const employees = ref([])

  const resolveStockStatus = (stock) => {
    const threshold = Number(settingsStore.lowStockThreshold) || 10
    if (stock === 0) return 'Out of Stock'
    if (stock < threshold) return 'Low Stock'
    return 'In Stock'
  }

  const fetchEmployees = async () => {
    loading.value = true
    error.value = null
    try {
      employees.value = await employeeService.fetchAll()
    } catch (err) {
      error.value = err.message || 'Failed to load employee directory.'
    } finally {
      loading.value = false
    }
  }

  // Initial fetch on store instantiation
  fetchEmployees()

  const totalEmployees = computed(() => employees.value.length)
  const activeEmployeesCount = computed(() => employees.value.filter(e => e.status === 'Active').length)
  const departmentCount = computed(() => new Set(employees.value.map(e => e.department)).size)

  const addEmployee = async (payload) => {
    loading.value = true
    try {
      const created = await employeeService.create(payload)
      employees.value.push(created)
      activityStore.logAction('Employee Added', `Registered new personnel "${payload.name}" in ${payload.department}.`, 'success')
    } catch (err) {
      error.value = err.message || 'Failed to add employee.'
    } finally {
      loading.value = false
    }
  }

  const updateEmployee = async (id, payload) => {
    loading.value = true
    try {
      const updated = await employeeService.update(id, payload)
      if (updated) {
        const index = employees.value.findIndex(e => e.id === id)
        if (index !== -1) {
          const oldName = employees.value[index].name
          employees.value[index] = updated
          activityStore.logAction('Employee Updated', `Updated personnel record for "${oldName}".`, 'info')
        }
      }
    } catch (err) {
      error.value = err.message || 'Failed to update employee.'
    } finally {
      loading.value = false
    }
  }

  const deleteEmployee = async (id) => {
    try {
      const productStore = useProductStore()
      const emp = employees.value.find(e => e.id === id)

      if (emp && emp.assignedEquipment && emp.assignedEquipment.length > 0) {
        emp.assignedEquipment.forEach(item => {
          const prod = productStore.products.find(p => p.id === item.productId)
          if (prod) {
            prod.stock += 1
            prod.status = resolveStockStatus(prod.stock)
          }
        })
        await productStore.syncProducts()
      }

      await employeeService.remove(id)
      employees.value = employees.value.filter(e => e.id !== id)
      if (emp) {
        activityStore.logAction('Employee Deleted', `Removed "${emp.name}" from employee directory and returned assigned equipment.`, 'danger')
      }
    } catch (err) {
      error.value = err.message || 'Failed to delete employee.'
    }
  }

  const assignEquipment = async (employeeId, product) => {
    try {
      const productStore = useProductStore()
      const emp = employees.value.find(e => e.id === employeeId)
      const prod = productStore.products.find(p => p.id === product.id)

      if (!emp || !prod || prod.stock <= 0) return false

      prod.stock -= 1
      prod.status = resolveStockStatus(prod.stock)

      if (!emp.assignedEquipment) {
        emp.assignedEquipment = []
      }

      emp.assignedEquipment.push({
        productId: prod.id,
        name: prod.name,
        sku: prod.sku,
        category: prod.category,
        assignedDate: new Date().toISOString().split('T')[0]
      })

      await employeeService.syncAll(employees.value)
      await productStore.syncProducts()

      activityStore.logAction('Equipment Assigned', `Assigned "${prod.name}" (${prod.sku}) to ${emp.name}.`, 'info')
      return true
    } catch (err) {
      error.value = err.message || 'Failed to assign equipment.'
      return false
    }
  }

  const unassignEquipment = async (employeeId, productId) => {
    try {
      const productStore = useProductStore()
      const emp = employees.value.find(e => e.id === employeeId)
      const prod = productStore.products.find(p => p.id === productId)

      if (!emp || !emp.assignedEquipment) return false

      const index = emp.assignedEquipment.findIndex(item => item.productId === productId)
      if (index === -1) return false

      emp.assignedEquipment.splice(index, 1)

      if (prod) {
        prod.stock += 1
        prod.status = resolveStockStatus(prod.stock)

        activityStore.logAction('Equipment Returned', `Returned "${prod.name}" (${prod.sku}) from ${emp.name} to inventory.`, 'warning')
      }

      await employeeService.syncAll(employees.value)
      await productStore.syncProducts()
      return true
    } catch (err) {
      error.value = err.message || 'Failed to unassign equipment.'
      return false
    }
  }

  const resetEmployees = async () => {
    loading.value = true
    error.value = null
    try {
      employees.value = await employeeService.reset()
      activityStore.logAction('Directory Reset', 'Restored employee directory to default mock data.', 'warning')
    } catch (err) {
      error.value = err.message || 'Failed to reset employee directory.'
    } finally {
      loading.value = false
    }
  }

  return {
    employees,
    loading,
    error,
    totalEmployees,
    activeEmployeesCount,
    departmentCount,
    fetchEmployees,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    assignEquipment,
    unassignEquipment,
    resetEmployees
  }
})