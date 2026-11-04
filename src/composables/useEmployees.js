import { ref, computed } from 'vue'
import { initialEmployees } from '../data/employees'

// Singleton reactive state shared across components
const employees = ref(initialEmployees)

export function useEmployees() {
  const addEmployee = (payload) => {
    employees.value.push({
      id: Date.now(),
      status: 'Active',
      joinDate: new Date().toISOString().split('T')[0],
      ...payload
    })
  }

  const updateEmployee = (id, payload) => {
    const index = employees.value.findIndex(e => e.id === id)
    if (index !== -1) {
      employees.value[index] = { ...employees.value[index], ...payload }
    }
  }

  const deleteEmployee = (id) => {
    employees.value = employees.value.filter(e => e.id !== id)
  }

  // Computed statistics
  const totalEmployees = computed(() => employees.value.length)
  const activeEmployees = computed(() => employees.value.filter(e => e.status === 'Active').length)
  const inactiveEmployees = computed(() => employees.value.filter(e => e.status === 'Inactive').length)
  const departmentCount = computed(() => new Set(employees.value.map(e => e.department).filter(Boolean)).size)
  const recentEmployees = computed(() => [...employees.value].slice(-5).reverse())

  return {
    employees,
    totalEmployees,
    activeEmployees,
    inactiveEmployees,
    departmentCount,
    recentEmployees,
    addEmployee,
    updateEmployee,
    deleteEmployee
  }
}