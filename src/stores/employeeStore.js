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
      return created
    } catch (err) {
      if (err.status !== 422) {
        error.value = err.message || 'Failed to add employee.'
      }
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateEmployee = async (id, payload) => {
    loading.value = true
    try {
      const updated = await employeeService.update(id, payload)
      if (updated) {
        const index = employees.value.findIndex(e => Number(e.id) === Number(id))
        if (index !== -1) {
          const oldName = employees.value[index].name
          employees.value[index] = updated
          activityStore.logAction('Employee Updated', `Updated personnel record for "${oldName}".`, 'info')
        }
      }
      return updated
    } catch (err) {
      if (err.status !== 422) {
        error.value = err.message || 'Failed to update employee.'
      }
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteEmployee = async (id) => {
    try {
      const productStore = useProductStore()
      const emp = employees.value.find(e => Number(e.id) === Number(id))

      if (emp && emp.assignedEquipment && emp.assignedEquipment.length > 0) {
        for (const item of emp.assignedEquipment) {
          const prod = productStore.products.find(p => Number(p.id) === Number(item.productId))
          if (prod) {
            const nextStock = Number(prod.stock) + 1
            await productStore.updateProduct(prod.id, {
              ...prod,
              stock: nextStock,
              status: resolveStockStatus(nextStock)
            })
          }
        }
      }

      await employeeService.remove(id)
      employees.value = employees.value.filter(e => Number(e.id) !== Number(id))
      if (emp) {
        activityStore.logAction('Employee Deleted', `Removed "${emp.name}" from employee directory and returned assigned equipment.`, 'danger')
      }
    } catch (err) {
      if (err.status !== 403) {
        error.value = err.message || 'Failed to delete employee.'
      }
      throw err
    }
  }

  const bulkDeleteEmployees = async (ids) => {
    if (!Array.isArray(ids) || ids.length === 0) return
    loading.value = true
    try {
      const numericIds = ids.map(Number)
      const productStore = useProductStore()
      const toDelete = employees.value.filter(e => numericIds.includes(Number(e.id)))

      await employeeService.bulkRemove(numericIds)

      for (const emp of toDelete) {
        if (emp.assignedEquipment && emp.assignedEquipment.length > 0) {
          for (const item of emp.assignedEquipment) {
            const prod = productStore.products.find(p => Number(p.id) === Number(item.productId))
            if (prod) {
              const qty = Number(item.quantity) || 1
              const nextStock = Number(prod.stock || 0) + qty
              prod.stock = nextStock
              prod.status = resolveStockStatus(nextStock)
            }
          }
        }
      }

      employees.value = employees.value.filter(e => !numericIds.includes(Number(e.id)))
      activityStore.logAction('Bulk Delete Employees', `Deleted ${toDelete.length} employee record(s).`, 'danger')
    } catch (err) {
      if (err.status !== 403) {
        error.value = err.message || 'Failed to bulk delete employees.'
      }
      throw err
    } finally {
      loading.value = false
    }
  }

  const assignEquipment = async (employeeId, product) => {
    try {
      const productStore = useProductStore()
      const emp = employees.value.find(e => Number(e.id) === Number(employeeId))
      const prod = productStore.products.find(p => Number(p.id) === Number(product.id))

      if (!emp || !prod || Number(prod.stock) <= 0) return false

      const nextStock = Number(prod.stock) - 1
      const nextStatus = resolveStockStatus(nextStock)

      const updatedEquipment = [
        ...(emp.assignedEquipment || []),
        {
          productId: prod.id,
          name: prod.name,
          sku: prod.sku,
          category: prod.category,
          assignedDate: new Date().toISOString().split('T')[0]
        }
      ]

      const updatedEmp = await employeeService.update(emp.id, {
        ...emp,
        assignedEquipment: updatedEquipment
      })

      await productStore.updateProduct(prod.id, {
        ...prod,
        stock: nextStock,
        status: nextStatus
      })

      const empIndex = employees.value.findIndex(e => Number(e.id) === Number(emp.id))
      if (empIndex !== -1) {
        employees.value[empIndex] = updatedEmp || { ...emp, assignedEquipment: updatedEquipment }
      }

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
      const emp = employees.value.find(e => Number(e.id) === Number(employeeId))
      const prod = productStore.products.find(p => Number(p.id) === Number(productId))

      if (!emp || !emp.assignedEquipment) return false

      const index = emp.assignedEquipment.findIndex(item => Number(item.productId) === Number(productId))
      if (index === -1) return false

      const updatedEquipment = [...emp.assignedEquipment]
      updatedEquipment.splice(index, 1)

      const updatedEmp = await employeeService.update(emp.id, {
        ...emp,
        assignedEquipment: updatedEquipment
      })

      const empIndex = employees.value.findIndex(e => Number(e.id) === Number(emp.id))
      if (empIndex !== -1) {
        employees.value[empIndex] = updatedEmp || { ...emp, assignedEquipment: updatedEquipment }
      }

      if (prod) {
        const nextStock = Number(prod.stock) + 1
        await productStore.updateProduct(prod.id, {
          ...prod,
          stock: nextStock,
          status: resolveStockStatus(nextStock)
        })

        activityStore.logAction('Equipment Returned', `Returned "${prod.name}" (${prod.sku}) from ${emp.name} to inventory.`, 'warning')
      }

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
      if (err.status !== 403) {
        error.value = err.message || 'Failed to reset employee directory.'
      }
      throw err
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
    bulkDeleteEmployees,
    assignEquipment,
    unassignEquipment,
    resetEmployees
  }
})