<template>
  <div class="admin-shell bg-[#080d16] text-white min-h-screen flex">
    <AdminSidebar :collapsed="collapsed" @toggle="collapsed = !collapsed" />
    <div class="flex-1 flex flex-col overflow-hidden">
      <AdminHeader @logout="handleLogout" @notify="noop" @profile="noop" />

      <main class="p-4 md:p-6 space-y-4 admin-dashboard-main overflow-y-auto">
        <div class="card header-card flex items-center justify-between">
          <div>
            <p class="text-xs uppercase tracking-[0.08em] text-gray-400">Admin / Managers</p>
            <h2 class="text-2xl font-semibold">Users</h2>
            <p class="text-gray-400 text-sm">Manage creators, subscribers, and backend staff.</p>
          </div>
          <Button
            v-if="activeTab === 'backend'"
            label="Add User"
            icon="pi pi-plus"
            severity="primary"
            @click="openCreate"
          />
        </div>

        <div class="card admin-table">
          <div class="flex gap-2 mb-3 admin-tabs">
            <Button
              v-for="tab in tabs"
              :key="tab.key"
              :label="tab.label"
              :severity="activeTab === tab.key ? 'primary' : 'secondary'"
              text
              class="admin-tab-btn"
              @click="activeTab = tab.key"
            />
          </div>

          <DataTable :value="visibleUsers" dataKey="id" class="admin-table">
            <Column field="name" header="Name"></Column>
            <Column field="email" header="Email"></Column>
            <Column field="role" header="Role"></Column>
            <Column header="Status">
              <template #body="{ data }">
                <div class="flex items-center gap-3">
                  <Tag :value="data.status ? 'Active' : 'Inactive'" :severity="data.status ? 'success' : 'danger'" />
                  <button
                    type="button"
                    class="admin-toggle"
                    :class="{ active: data.status }"
                    :aria-pressed="data.status"
                    @click="toggleStatus(data)"
                  >
                    <span class="dot"></span>
                  </button>
                </div>
              </template>
            </Column>
            <Column header="Actions" style="width:140px">
              <template #body="{ data }">
                <div class="flex gap-2">
                  <Button icon="pi pi-eye" severity="secondary" text @click="viewUser(data)" />
                  <Button icon="pi pi-pencil" severity="secondary" text @click="openEdit(data)" v-if="activeTab === 'backend'" />
                  <Button icon="pi pi-trash" severity="danger" text @click="confirmDelete(data)" />
                </div>
              </template>
            </Column>
          </DataTable>
        </div>
      </main>
    </div>

    <Dialog v-model:visible="dialogVisible" header="User" modal class="w-[520px]" :appendTo="'self'">
      <div class="space-y-4 dialog-form">
        <div class="field">
          <label class="block text-sm mb-1">Name</label>
          <InputText v-model="form.name" class="w-full dark-input" autocomplete="off" />
        </div>
        <div class="field">
          <label class="block text-sm mb-1">Email</label>
          <InputText v-model="form.email" type="email" class="w-full dark-input" autocomplete="new-email" />
        </div>
        <div class="field">
          <label class="block text-sm mb-1">Password</label>
          <InputText
            v-model="form.password"
            type="password"
            class="w-full dark-input"
            :placeholder="form.id ? 'Leave blank to keep current' : ''"
            autocomplete="new-password"
          />
        </div>
        <div class="field">
          <label class="block text-sm mb-1">Role</label>
          <Dropdown
            v-model="form.role"
            :options="backendRoles"
            optionLabel="label"
            optionValue="value"
            placeholder="Select role"
            class="w-full dark-dropdown"
            panelClass="dark-dropdown-panel"
            inputId="user-role"
          />
        </div>
        <div class="flex items-center gap-2">
          <Checkbox v-model="form.status" :binary="true" inputId="user-status" />
          <label for="user-status">Active</label>
        </div>
      </div>
      <template #footer>
        <Button label="Cancel" text @click="dialogVisible=false" />
        <Button :label="form.id ? 'Update' : 'Create'" @click="saveUser" />
      </template>
    </Dialog>

    <ConfirmDialog />
    <Dialog v-model:visible="deleteDialogVisible" header="Confirm Delete" modal class="w-[420px]" :appendTo="'self'">
      <div class="space-y-3">
        <p class="text-sm text-gray-200">Delete user "{{ deleteTarget?.name }}". Choose delete type:</p>
        <div class="flex flex-col gap-2">
          <label class="flex items-center gap-2">
            <input type="radio" value="soft" v-model="deleteMode">
            <span>Soft Delete (mark as deleted)</span>
          </label>
          <label class="flex items-center gap-2">
            <input type="radio" value="hard" v-model="deleteMode">
            <span>Hard Delete (remove permanently)</span>
          </label>
        </div>
      </div>
      <template #footer>
        <Button label="Cancel" text @click="deleteDialogVisible=false" />
        <Button label="Delete" severity="danger" @click="performDelete" />
      </template>
    </Dialog>
    <Toast />
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import AdminSidebar from '../../components/admin/AdminSidebar.vue'
import AdminHeader from '../../components/admin/AdminHeader.vue'
import api from '../../services/api'
import Button from 'primevue/button'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Checkbox from 'primevue/checkbox'
import Dropdown from 'primevue/dropdown'
import Tag from 'primevue/tag'
import ConfirmDialog from 'primevue/confirmdialog'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'
import Toast from 'primevue/toast'
import './admin-dashboard.css'

const collapsed = ref(false)
const activeTab = ref('creator')
const tabs = [
  { key: 'creator', label: 'Creators' },
  { key: 'subscriber', label: 'Subscribers' },
  { key: 'backend', label: 'Backend Users' },
]

const creators = ref([])
const subscribers = ref([])
const backendUsers = ref([])

const backendRoles = ref([])

const dialogVisible = ref(false)
const deleteDialogVisible = ref(false)
const deleteMode = ref('soft')
const deleteTarget = ref(null)
const form = ref({
  id: null,
  name: '',
  email: '',
  role: '',
  status: true,
})

const toast = useToast()
const confirm = useConfirm()
const router = useRouter()

const visibleUsers = computed(() => {
  if (activeTab.value === 'creator') return creators.value
  if (activeTab.value === 'subscriber') return subscribers.value
  return backendUsers.value
})

const loadUsers = async () => {
  try {
    const roleParam = activeTab.value === 'backend' ? 'backend' : activeTab.value
    const { data } = await api.get('/admin/users', { params: { role: roleParam } })
    const list = (data?.data || data || []).map(u => ({
      ...u,
      status: !!u.status && !u.is_delete,
    }))
    if (activeTab.value === 'creator') creators.value = list
    else if (activeTab.value === 'subscriber') subscribers.value = list
    else backendUsers.value = list
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to load users', life: 3000 })
  }
}

const openCreate = () => {
  form.value = { id: null, name: '', email: '', password: '', role: '', status: true }
  dialogVisible.value = true
}

const openEdit = (row) => {
  form.value = { ...row, password: '' }
  if (activeTab.value === 'backend') {
    dialogVisible.value = true
  }
}

const saveUser = () => {
  if (!form.value.name || !form.value.email) {
    toast.add({ severity: 'warn', summary: 'Required', detail: 'Name and email are required', life: 2500 })
    return
  }
  if (!form.value.id && !form.value.password) {
    toast.add({ severity: 'warn', summary: 'Required', detail: 'Password is required for new users', life: 2500 })
    return
  }
  if (!form.value.role) {
    toast.add({ severity: 'warn', summary: 'Required', detail: 'Please select a role', life: 2500 })
    return
  }

  const payload = {
    name: form.value.name,
    email: form.value.email,
    role: form.value.role,
    status: form.value.status ? 1 : 0,
  }
  if (form.value.password) {
    payload.password = form.value.password
  }

  const request = form.value.id
    ? api.put(`/admin/users/${form.value.id}`, payload)
    : api.post('/admin/users', payload)

  request
    .then(() => {
      toast.add({ severity: 'success', summary: 'Saved', detail: 'User saved', life: 2500 })
      dialogVisible.value = false
      loadUsers()
    })
    .catch(() => {
      toast.add({ severity: 'error', summary: 'Error', detail: 'Save failed', life: 3000 })
    })
}

const confirmDelete = (row) => {
  deleteTarget.value = row
  deleteDialogVisible.value = true
}

const handleLogout = async () => {
  await router.push('/secret-admin-login')
}

const noop = () => {}

const viewUser = (row) => {
  router.push({ name: 'AdminUserDetail', params: { id: row.id } })
}

const toggleStatus = (row) => {
  const newStatus = !row.status
  api
    .put(`/admin/users/${row.id}`, { status: newStatus ? 1 : 0, is_active: newStatus ? 1 : 0 })
    .then(() => {
      row.status = newStatus
      toast.add({ severity: 'success', summary: 'Updated', detail: `User ${newStatus ? 'activated' : 'deactivated'}`, life: 2500 })
    })
    .catch(() => {
      toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to update status', life: 3000 })
    })
}

watch(
  () => activeTab.value,
  () => loadUsers(),
    { immediate: true }
)

const performDelete = () => {
  if (!deleteTarget.value) return
  const mode = deleteMode.value
  api
    .delete(`/admin/users/${deleteTarget.value.id}`, { data: { mode } })
    .then(() => {
      toast.add({ severity: 'success', summary: 'Deleted', detail: mode === 'soft' ? 'User soft deleted' : 'User deleted', life: 2500 })
      deleteDialogVisible.value = false
      loadUsers()
    })
    .catch(() => {
      toast.add({ severity: 'error', summary: 'Error', detail: 'Delete failed', life: 3000 })
    })
}

const loadRoles = async () => {
  try {
    const { data } = await api.get('/admin/roles')
    backendRoles.value = (data?.data || data || [])
      .filter(r => !['creator', 'subscriber'].includes(r.name))
      .map(r => ({ label: r.name.charAt(0).toUpperCase() + r.name.slice(1), value: r.name }))
  } catch {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to load roles', life: 3000 })
  }
}

loadRoles()
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

.dark-dropdown :deep(.p-dropdown) {
  width: 100%;
}

.dialog-form .field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.admin-tab-btn {
  padding: 8px 12px;
}

:deep(.admin-tab-btn.p-button) {
  color: #d1d5db;
  border: 1px solid #1f2a3a;
  transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease;
}

:deep(.admin-tab-btn.p-button:hover) {
  background: #141c2b;
  border-color: #2b3a52;
}

:deep(.admin-tab-btn.p-button.p-button-primary) {
  background: #0a101d;
  border-color: #3b4f6d;
  color: #e5e7eb;
}

:deep(.admin-tab-btn.p-button.p-button-primary:hover) {
  background: #060b14;
  border-color: #4b8cf7;
}

.dark-dropdown :deep(.p-dropdown) {
  background: #0b1220;
  border: 1px solid #1f2a3a;
  color: #e5e7eb;
}

.dark-dropdown-panel,
.dark-dropdown :deep(.p-dropdown-panel) {
  background: #0b1220;
  border: 1px solid #1f2a3a;
}

.dark-dropdown :deep(.p-dropdown-items .p-dropdown-item) {
  padding: 10px 12px;
  color: #e5e7eb;
}

.dark-dropdown :deep(.p-dropdown-items .p-dropdown-item:hover),
.dark-dropdown :deep(.p-dropdown-items .p-dropdown-item.p-highlight) {
  background: #151d2c;
  color: #e5e7eb;
}
.p-button-text.p-button-secondary:not(:disabled):hover {
    background: #32425a;
}
.admin-tabs{
  margin-bottom: 10px;
}

.admin-toggle {
  width: 50px;
  height: 26px;
  border-radius: 18px;
  border: 1px solid #334155;
  background: #1f2937;
  position: relative;
  cursor: pointer;
  transition: background 0.2s ease, border-color 0.2s ease;
}

.admin-toggle .dot {
  position: absolute;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #cbd5e1;
  top: 3px;
  left: 4px;
  transition: transform 0.2s ease, background 0.2s ease;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);
}

.admin-toggle.active {
  background: #16a34a;
  border-color: #16a34a;
}

.admin-toggle.active .dot {
  transform: translateX(22px);
  background: #ecfdf3;
}
</style>
