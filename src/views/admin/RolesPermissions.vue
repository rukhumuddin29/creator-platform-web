<template>
  <div class="min-h-screen flex bg-[#080d16] text-white admin-shell">
    <AdminSidebar :collapsed="isSidebarCollapsed" @toggle="isSidebarCollapsed = !isSidebarCollapsed" />
    <div class="flex-1 flex flex-col overflow-hidden">
      <AdminHeader @notify="handleNotify" @profile="handleProfile" @logout="handleLogout" />

      <Toast />
      <ConfirmDialog />

      <main class="p-4 md:p-6 space-y-4 admin-dashboard-main overflow-y-auto">
        <div class="card header-card flex items-center justify-between">
          <div>
            <p class="text-xs uppercase tracking-[0.08em] text-gray-400">Admin only</p>
            <h1 class="text-2xl font-semibold">Roles & Permissions</h1>
            <p class="text-gray-400 text-sm">Manage roles and their permissions.</p>
          </div>
          <Button label="Add Role" icon="pi pi-plus" severity="secondary" @click="openCreateRole" />
        </div>

        <div class="card admin-table">
          <div class="flex gap-3 mb-4 admin-tabs">
            <Button
              label="Roles"
              :outlined="tab !== 'roles'"
              :class="['p-button-sm admin-tab-btn', tab === 'roles' ? 'p-button-primary' : 'p-button-text text-gray-300']"
              @click="tab = 'roles'"
            />
            <Button
              label="Permissions"
              :outlined="tab !== 'permissions'"
              :class="['p-button-sm admin-tab-btn', tab === 'permissions' ? 'p-button-primary' : 'p-button-text text-gray-300']"
              @click="tab = 'permissions'"
            />
          </div>

          <DataTable v-if="tab === 'roles'" :value="roles" class="admin-table" responsiveLayout="scroll">
            <Column field="name" header="Role"></Column>
            <Column header="Permissions">
              <template #body="slotProps">
                <div class="flex flex-wrap gap-2">
                  <Tag v-for="perm in slotProps.data.permissionNames" :key="perm" :value="perm" severity="info" />
                </div>
              </template>
            </Column>
            <Column header="Actions" style="width: 140px" bodyClass="text-right">
              <template #body="slotProps">
                <div class="flex justify-end gap-2">
                  <Button icon="pi pi-pencil" severity="secondary" text @click="editRole(slotProps.data)" />
                  <Button icon="pi pi-trash" severity="danger" text @click="deleteRole(slotProps.data)" />
                </div>
              </template>
            </Column>
          </DataTable>

          <div v-else class="space-y-2">
            <div class="flex justify-end">
              <Button label="Add Permission" icon="pi pi-plus" severity="secondary" @click="savePermission" />
            </div>
            <div class="grid md:grid-cols-2 gap-3">
              <div class="field">
                <label class="block text-sm text-gray-300 mb-2">Permission name</label>
                <InputText v-model="permissionForm.name" class="w-full dark-input" />
              </div>
              <div class="field">
                <label class="block text-sm text-gray-300 mb-2">Description</label>
                <InputText v-model="permissionForm.description" class="w-full dark-input" />
              </div>
              <div class="flex items-center gap-2">
                <Checkbox v-model="permissionForm.default_admin" :binary="true" inputId="default-admin" />
                <label for="default-admin">Add to admin by default</label>
              </div>
            </div>

            <DataTable :value="permissions" class="admin-table" responsiveLayout="scroll">
              <Column field="name" header="Permission"></Column>
              <Column field="description" header="Description"></Column>
            </DataTable>
          </div>
        </div>

        <Dialog v-model:visible="showModal" modal header="Add Role" :style="{ width: '30rem' }" :appendTo="'self'">
          <div class="space-y-4 dialog-form">
            <div class="field">
              <label class="block text-sm text-gray-300 mb-2">Role name</label>
              <InputText v-model="form.name" class="w-full dark-input" />
            </div>
            <div class="field">
              <label class="block text-sm text-gray-300 mb-2">Permissions</label>
              <div class="grid grid-cols-2 gap-2">
                <label v-for="perm in permissions" :key="perm.id" class="flex items-center gap-2 text-sm text-gray-200">
                  <Checkbox v-model="form.permissions" :value="perm.id" :binary="false" />
                  <span>{{ perm.name }}</span>
                </label>
              </div>
            </div>
          </div>
          <template #footer>
            <div class="flex justify-end gap-2">
              <Button label="Cancel" class="p-button-text" severity="secondary" @click="closeModal" />
              <Button label="Save" icon="pi pi-check" severity="primary" @click="saveRole" />
            </div>
          </template>
        </Dialog>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import AdminSidebar from '../../components/admin/AdminSidebar.vue'
import AdminHeader from '../../components/admin/AdminHeader.vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Checkbox from 'primevue/checkbox'
import Toast from 'primevue/toast'
import { useToast } from 'primevue/usetoast'
import ConfirmDialog from 'primevue/confirmdialog'
import { useConfirm } from 'primevue/useconfirm'
import api from '../../services/api'
import './admin-dashboard.css'

const router = useRouter()
const authStore = useAuthStore()
const isSidebarCollapsed = ref(false)
const tab = ref('roles')
const showModal = ref(false)
const roles = ref([])

const permissions = ref([])

const form = ref({
  name: '',
  permissions: [],
})

const permissionForm = ref({
  id: null,
  name: '',
  description: '',
  default_admin: true,
})

const toast = useToast()
const confirm = useConfirm()

const notify = (severity, summary, detail) => {
  toast.add({ severity, summary, detail, life: 15000 })
}

const openCreateRole = () => {
  form.value = { name: '', permissions: [] }
  showModal.value = true
}

const editRole = (role) => {
  form.value = { name: role.name, permissions: [...role.permissions] }
  showModal.value = true
}

const deleteRole = (role) => {
  confirm.require({
    message: `Delete role "${role.name}"?`,
    header: 'Confirm Delete',
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    rejectClass: 'p-button-text',
    accept: () => {
      roles.value = roles.value.filter((r) => r.name !== role.name)
      notify('success', 'Role deleted', `${role.name} removed successfully.`)
      // TODO: integrate API delete call when backend endpoints are available
    },
  })
}

const closeModal = () => {
  showModal.value = false
}

const saveRole = () => {
  const payload = {
    name: form.value.name,
    permissions: form.value.permissions,
  }

  const existing = roles.value.find((r) => r.name === form.value.name)
  const request = existing
    ? api.put(`/admin/roles-with-permissions/${existing.id}`, payload)
    : api.post('/admin/roles-with-permissions', payload)

  request
    .then(() => {
      notify('success', 'Saved', 'Role saved successfully.')
      showModal.value = false
      loadRoles()
    })
    .catch(() => notify('error', 'Error', 'Failed to save role'))
}

const handleLogout = async () => {
  await authStore.logout()
  const loginPath = authStore.getLoginPath ? authStore.getLoginPath() : '/login'
  router.push(loginPath)
}

const handleNotify = () => {
  // placeholder for future notifications action
}

const handleProfile = () => {
  router.push('/admin/dashboard')
}

const loadRoles = async () => {
  try {
    const { data } = await api.get('/admin/roles-with-permissions')
    const list = data?.data || data || []
    roles.value = list.map(r => ({
      id: r.id,
      name: r.name,
      permissions: (r.permissions || []).map(p => p.id),
      permissionNames: (r.permissions || []).map(p => p.name),
    }))
  } catch (e) {
    notify('error', 'Error', 'Failed to load roles')
  }
}

const loadPermissions = async () => {
  try {
    const { data } = await api.get('/admin/permissions')
    permissions.value = data?.data || data || []
  } catch (e) {
    notify('error', 'Error', 'Failed to load permissions')
  }
}

const savePermission = async () => {
  try {
    const payload = {
      name: permissionForm.value.name,
      description: permissionForm.value.description,
      default_admin: permissionForm.value.default_admin ? 1 : 0,
    }
    await api.post('/admin/permissions', payload)
    notify('success', 'Permission added', 'Permission created and added to admin (if selected).')
    permissionForm.value = { id: null, name: '', description: '', default_admin: true }
    loadPermissions()
  } catch (e) {
    notify('error', 'Error', 'Failed to save permission')
  }
}

loadRoles()
loadPermissions()
</script>
<style scoped>
.card {
  background: #0f1625;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.35);
}

.dark-input {
  background: #0b1220;
  border: 1px solid #1f2a3a;
  color: #e5e7eb;
}

.dark-input:enabled:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.4);
}

.dialog-form .field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
</style>
