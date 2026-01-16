<template>
  <div class="admin-shell bg-[#080d16] text-white min-h-screen flex">
    <AdminSidebar :collapsed="collapsed" @toggle="collapsed = !collapsed" />
    <div class="flex-1 flex flex-col overflow-hidden">
      <AdminHeader @logout="handleLogout" @notify="noop" @profile="noop" />

      <main class="p-4 md:p-6 space-y-4 admin-dashboard-main overflow-y-auto">
        <div class="card header-card flex items-center justify-between">
          <div>
            <p class="text-xs uppercase tracking-[0.08em] text-gray-400">Admin only</p>
            <h2 class="text-2xl font-semibold">Social Media Platforms</h2>
            <p class="text-gray-400 text-sm">Manage platforms available for creators.</p>
          </div>
          <Button label="Add Platform" icon="pi pi-plus" severity="primary" @click="openCreate" />
        </div>

        <div class="card admin-table">
          <DataTable :value="platforms" dataKey="id" :loading="loading" class="admin-table">
            <Column field="name" header="Name"></Column>
            <Column field="slug" header="Slug"></Column>
            <Column field="logo" header="Logo URL"></Column>
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

    <Dialog v-model:visible="dialogVisible" header="Platform" modal class="w-[480px]" :appendTo="'self'">
      <div class="space-y-4 dialog-form">
        <div class="field">
          <label class="block text-sm mb-1">Name</label>
          <InputText v-model="form.name" class="w-full dark-input" />
        </div>
        <div class="field">
          <label class="block text-sm mb-1">Slug</label>
          <InputText v-model="form.slug" class="w-full dark-input" readonly />
        </div>
        <div class="field">
          <label class="block text-sm mb-1">Logo URL</label>
          <InputText v-model="form.logo" class="w-full dark-input" />
        </div>
        <div class="flex items-center gap-2">
          <Checkbox v-model="form.status" :binary="true" inputId="status" />
          <label for="status">Active</label>
        </div>
      </div>
      <template #footer>
        <Button label="Cancel" text @click="dialogVisible=false" />
        <Button :label="form.id ? 'Update' : 'Create'" @click="savePlatform" />
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
const platforms = ref([])
const loading = ref(false)
const dialogVisible = ref(false)
const form = ref({
  id: null,
  name: '',
  slug: '',
  logo: '',
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

const loadPlatforms = async () => {
  loading.value = true
  try {
    const { data } = await api.get('/social-media-platforms')
    platforms.value = data.data || data
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to load platforms', life: 3000 })
  } finally {
    loading.value = false
  }
}

const openCreate = () => {
  form.value = { id: null, name: '', slug: '', logo: '', status: true }
  dialogVisible.value = true
}

const openEdit = (row) => {
  form.value = { ...row }
  dialogVisible.value = true
}

const savePlatform = async () => {
  try {
    form.value.slug = slugify(form.value.name)
    if (form.value.id) {
      await api.put(`/social-media-platforms/${form.value.id}`, form.value)
      toast.add({ severity: 'success', summary: 'Updated', detail: 'Platform updated', life: 2500 })
    } else {
      await api.post('/social-media-platforms', form.value)
      toast.add({ severity: 'success', summary: 'Created', detail: 'Platform created', life: 2500 })
    }
    dialogVisible.value = false
    await loadPlatforms()
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Save failed', life: 3000 })
  }
}

const confirmDelete = (row) => {
  confirm.require({
    message: `Delete platform "${row.name}"?`,
    header: 'Confirm Delete',
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        await api.delete(`/social-media-platforms/${row.id}`)
        toast.add({ severity: 'success', summary: 'Deleted', detail: 'Platform removed', life: 2500 })
        await loadPlatforms()
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
  loadPlatforms()
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
