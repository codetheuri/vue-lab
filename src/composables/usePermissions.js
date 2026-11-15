import { computed } from 'vue'
import { useAuthStore } from '../stores/authStore'

export function usePermissions() {
  const authStore = useAuthStore()
  
  const role = computed(() => authStore.user?.role?.toLowerCase() || 'viewer')

  const isAdmin = computed(() => role.value === 'admin')
  const isManager = computed(() => role.value === 'manager')
  const isViewer = computed(() => role.value === 'viewer' || role.value === 'staff')

  return {
    role,
    isAdmin,
    isManager,
    isViewer,
    // Granular permissions
    canCreate: computed(() => isAdmin.value || isManager.value),
    canEdit: computed(() => isAdmin.value || isManager.value),
    canDelete: computed(() => isAdmin.value),
    canReset: computed(() => isAdmin.value),
    canManageEquipment: computed(() => isAdmin.value || isManager.value),
    canViewAuditLogs: computed(() => isAdmin.value)
  }
}