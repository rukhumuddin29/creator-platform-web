<template>
  <div class="admin-shell bg-[#080d16] text-white min-h-screen flex">
    <AdminSidebar :collapsed="collapsed" @toggle="collapsed = !collapsed" />
    <div class="flex-1 flex flex-col overflow-hidden">
      <AdminHeader @logout="handleLogout" @notify="noop" @profile="noop" />

      <main class="p-4 md:p-6 space-y-4 admin-dashboard-main overflow-y-auto">
        <div class="card header-card flex items-center justify-between">
          <div>
            <p class="text-xs uppercase tracking-[0.08em] text-gray-400">Admin only</p>
            <h2 class="text-2xl font-semibold">Creator Roles</h2>
            <p class="text-gray-400 text-sm">Manage creator role categories.</p>
          </div>
          <Button label="Add Role" icon="pi pi-plus" severity="primary" @click="openCreate" />
        </div>

        <div class="card admin-table">
          <DataTable :value="roles" dataKey="id" :loading="loading" class="admin-table">
            <Column field="title" header="Title"></Column>
            <Column field="slug" header="Slug"></Column>
            <Column header="Status">
              <template #body="{ data }">
                <Tag :value="data.status ? 'Active' : 'Inactive'" :severity="data.status ? 'success' : 'danger'" />
              </template>
            </Column>
            <Column header="Actions" style="width:140px">
              <template #body="{ data }">
                <div class="flex gap-2">
                  <Button icon="pi pi-pencil" severity="secondary" text @click="openEdit(data)" />
                  <Button icon="pi pi-trash" severity="danger" text @click="confirmDelete(data)" />
                </div>
              </template>
            </Column>
          </DataTable>
        </div>
      </main>
    </div>

    <Dialog v-model:visible="dialogVisible" header="Creator Role" modal class="w-[520px]" :appendTo="'self'">
      <div class="space-y-4 dialog-form">
        <div class="field">
          <label class="block text-sm mb-1">Title</label>
          <InputText v-model="form.title" class="w-full dark-input" @input="onTitleChange" />
        </div>
        <div class="field">
          <label class="block text-sm mb-1">Slug</label>
          <InputText v-model="form.slug" class="w-full dark-input" readonly />
        </div>
        <div class="field">
          <label class="block text-sm mb-1">Image URL</label>
          <InputText v-model="form.image" class="w-full dark-input" />
        </div>
        <div class="field">
          <label class="block text-sm mb-1">Banner URL</label>
          <InputText v-model="form.banner" class="w-full dark-input" />
        </div>
        <div class="field">
          <label class="block text-sm mb-1">Description</label>
          <InputText v-model="form.description" class="w-full dark-input" />
        </div>
        <div class="flex items-center gap-2">
          <Checkbox v-model="form.status" :binary="true" inputId="role-status" />
          <label for="role-status">Active</label>
        </div>
      </div>
      <template #footer>
        <Button label="Cancel" text @click="dialogVisible=false" />
        <Button :label="form.id ? 'Update' : 'Create'" @click="saveRole" />
      </template>
    </Dialog>

    <ConfirmDialog />
    <Toast />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
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
import Tag from 'primevue/tag'
import ConfirmDialog from 'primevue/confirmdialog'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'
import Toast from 'primevue/toast'
import './admin-dashboard.css'

const collapsed = ref(false)
const roles = ref([])
const loading = ref(false)
const dialogVisible = ref(false)
const form = ref({
  id: null,
  title: '',
  slug: '',
  image: '',
  banner: '',
  description: '',
  status: true,
})

const router = useRouter()
const toast = useToast()
const confirm = useConfirm()

const slugify = (val) =>
  val
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const loadRoles = async () => {
  loading.value = true
  try {
    const { data } = await api.get('/admin/creator-roles')
    roles.value = data?.data || data || []
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to load roles', life: 3000 })
  } finally {
    loading.value = false
  }
}

const openCreate = () => {
  form.value = { id: null, title: '', slug: '', image: '', banner: '', description: '', status: true }
  dialogVisible.value = true
}

const openEdit = (row) => {
  form.value = { ...row }
  dialogVisible.value = true
}

const saveRole = async () => {
  try {
    form.value.slug = slugify(form.value.title)
    if (form.value.id) {
      await api.put(`/admin/creator-roles/${form.value.id}`, form.value)
      toast.add({ severity: 'success', summary: 'Updated', detail: 'Role updated', life: 2500 })
    } else {
      await api.post('/admin/creator-roles', form.value)
      toast.add({ severity: 'success', summary: 'Created', detail: 'Role created', life: 2500 })
    }
    dialogVisible.value = false
    loadRoles()
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Save failed', life: 3000 })
  }
}

const confirmDelete = (row) => {
  confirm.require({
    message: `Delete role "${row.title}"?`,
    header: 'Confirm Delete',
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        await api.delete(`/admin/creator-roles/${row.id}`)
        toast.add({ severity: 'success', summary: 'Deleted', detail: 'Role removed', life: 2500 })
        loadRoles()
      } catch (err) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Delete failed', life: 3000 })
      }
    },
  })
}

const handleLogout = async () => {
  await router.push('/secret-admin-login')
}

const noop = () => {}

onMounted(() => {
  loadRoles()
})
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
const onTitleChange = () => {
  form.value.slug = slugify(form.value.title)
}
