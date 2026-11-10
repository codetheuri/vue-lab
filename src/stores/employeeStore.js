import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { useActivityStore } from './activityStore'

const DEFAULT_EMPLOYEES = [
  { id: 1, name: 'Alex Morgan', email: 'alex.morgan@company.com', department: 'Engineering', role: 'Lead Architect', status: 'Active', joinDate: '2023-03-15' },
  { id: 2, name: 'Sarah Jenkins', email: 'sarah.jenkins@company.com', department: 'Product', role: 'Senior Product Manager', status: 'Active', joinDate: '2023-06-01' },
  { id: 3, name: 'David Chen', email: 'david.chen@company.com', department: 'Engineering', role: 'Full Stack Developer', status: 'Active', joinDate: '2024-01-10' },
  { id: 4, name: 'Elena Rostova', email: 'elena.rostova@company.com', department: 'Design', role: 'UX/UI Lead', status: 'Active', joinDate: '2023-09-20' },
  { id: 5, name: 'Marcus Vance', email: 'marcus.vance@company.com', department: 'Operations', role: 'DevOps Specialist', status: 'Inactive', joinDate: '2022-11-05' }
]

export const useEmployeeStore = defineStore('employee', () => {
  const activityStore = useActivityStore()

  const saved = localStorage.getItem('vue_lab_employees')
  const employees = ref(saved ? JSON.parse(saved) : DEFAULT_EMPLOYEES)

  watch(employees, (newVal) => {
    localStorage.setItem('vue_lab_employees', JSON.stringify(newVal))
  }, { deep: true })

  const totalEmployees = computed(() => employees.value.length)
  const activeEmployeesCount = computed(() => employees.value.filter(e => e.status === 'Active').length)
  const departmentCount = computed(() => new Set(employees.value.map(e => e.department)).size)

  const addEmployee = (payload) => {
    const newId = employees.value.length > 0 ? Math.max(...employees.value.map(e => e.id)) + 1 : 1
    employees.value.push({ id: newId, ...payload })
    activityStore.logAction('Employee Added', `Registered new personnel "${payload.name}" in ${payload.department}.`, 'success')
  }

  const updateEmployee = (id, payload) => {
    const index = employees.value.findIndex(e => e.id === id)
    if (index !== -1) {
      const oldName = employees.value[index].name
      employees.value[index] = { ...employees.value[index], ...payload }
      activityStore.logAction('Employee Updated', `Updated personnel record for "${oldName}".`, 'info')
    }
  }

  const deleteEmployee = (id) => {
    const emp = employees.value.find(e => e.id === id)
    employees.value = employees.value.filter(e => e.id !== id)
    if (emp) {
      activityStore.logAction('Employee Deleted', `Removed "${emp.name}" from employee directory.`, 'danger')
    }
  }

  const resetEmployees = () => {
    employees.value = JSON.parse(JSON.stringify(DEFAULT_EMPLOYEES))
    activityStore.logAction('Directory Reset', 'Restored employee directory to default mock data.', 'warning')
  }

  return {
    employees,
    totalEmployees,
    activeEmployeesCount,
    departmentCount,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    resetEmployees
  }
})