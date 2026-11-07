import { ref, computed, watch } from 'vue'

const STORAGE_KEY = 'app_employees_data'

const initialEmployees = [
  { id: 1, name: 'Alex Morgan', email: 'alex.morgan@company.com', department: 'Engineering', role: 'Backend Developer', status: 'Active', joinDate: '2024-01-15' },
  { id: 2, name: 'Sarah Connor', email: 'sarah.c@company.com', department: 'Design', role: 'UI/UX Lead', status: 'Active', joinDate: '2024-02-01' },
  { id: 3, name: 'John Doe', email: 'john.d@company.com', department: 'Marketing', role: 'SEO Specialist', status: 'Inactive', joinDate: '2023-11-10' }
]

// 1. Initialize reactive state from localStorage or fallback mock data
const storedData = localStorage.getItem(STORAGE_KEY)
const employees = ref(storedData ? JSON.parse(storedData) : initialEmployees)

// 2. Deep watcher auto-syncs any add/update/delete actions directly to localStorage
watch(employees, (newValue) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newValue))
}, { deep: true })

export function useEmployees() {
  // Computed stats for Dashboard.vue
  const totalEmployees = computed(() => employees.value.length)
  const activeEmployees = computed(() => employees.value.filter(e => e.status === 'Active').length)
  const inactiveEmployees = computed(() => employees.value.filter(e => e.status === 'Inactive').length)
  const departmentCount = computed(() => new Set(employees.value.map(e => e.department).filter(Boolean)).size)
  const recentEmployees = computed(() => employees.value.slice(-5).reverse())

  // CRUD Methods
  const addEmployee = (employeeData) => {
    const newEmployee = {
      id: Date.now(),
      ...employeeData
    }
    employees.value.push(newEmployee)
  }

  const updateEmployee = (id, updatedData) => {
    const index = employees.value.findIndex(e => e.id === id)
    if (index !== -1) {
      employees.value[index] = { ...employees.value[index], ...updatedData }
    }
  }

  const deleteEmployee = (id) => {
    const index = employees.value.findIndex(e => e.id === id)
    if (index !== -1) {
      employees.value.splice(index, 1)
    }
  }

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