import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import {  initialEmployees } from '../data/employees'
import { useActivityStore } from './activityStore'

export const useEmployeeStore = defineStore('employee', () => {
  const activityStore = useActivityStore()

  const saved = localStorage.getItem('vue_lab_employees')
  const employees = ref(saved ? JSON.parse(saved) : initialEmployees)

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
    employees.value = JSON.parse(JSON.stringify(initialEmployees))
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