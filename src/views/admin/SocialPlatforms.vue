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
          <label class="block text-sm mb-1">Logo</label>
          <div class="space-y-2">
            <input
              type="file"
              accept="image/*"
              class="dark-input file-input w-full"
              @change="onLogoChange"
            />
            <div class="text-xs text-gray-300" v-if="form.logoFile">{{ form.logoFile.name }}</div>
            <div v-if="form.logoPreview" class="logo-preview">
              <img :src="form.logoPreview" alt="Logo preview" />
            </div>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <button
            type="button"
            class="toggle-btn"
            :class="{ active: form.status }"
            @click="form.status = !form.status"
            :aria-pressed="form.status"
          >
            <span class="dot"></span>
          </button>
          <span class="text-sm">{{ form.status ? 'Active' : 'Inactive' }}</span>
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
import { API_BASE_URL } from '../../services/api'

const collapsed = ref(false)
const platforms = ref([])
const loading = ref(false)
const dialogVisible = ref(false)
const form = ref({
  id: null,
  name: '',
  slug: '',
  logo: '',
  logoFile: null,
  logoPreview: '',
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
  form.value = { id: null, name: '', slug: '', logo: '', logoFile: null, logoPreview: '', status: true }
  dialogVisible.value = true
}

const openEdit = (row) => {
  form.value = {
    ...row,
    logoFile: null,
    logoPreview: row.logo ? resolveMedia(row.logo) : '',
    status: !!row.status,
  }
  dialogVisible.value = true
}

const onLogoChange = (e) => {
  const file = e.target.files?.[0]
  form.value.logoFile = file || null
  form.value.logoPreview = file ? URL.createObjectURL(file) : form.value.logoPreview
}

const savePlatform = async () => {
  try {
    form.value.slug = slugify(form.value.name)
    const fd = new FormData()
    fd.append('name', form.value.name)
    fd.append('slug', form.value.slug)
    fd.append('status', form.value.status ? 1 : 0)
    if (form.value.logoFile) {
      fd.append('logo', form.value.logoFile)
    } else if (form.value.logo) {
      fd.append('logo', form.value.logo)
    }

    if (form.value.id) {
      fd.append('_method', 'PUT')
      await api.post(`/social-media-platforms/${form.value.id}`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      toast.add({ severity: 'success', summary: 'Updated', detail: 'Platform updated', life: 2500 })
    } else {
      await api.post('/social-media-platforms', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
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

const resolveMedia = (url) => {
  if (!url) return ''
  const cleaned = url.toString().trim()
  const hasImageExt = /\.(png|jpe?g|gif|webp|svg)$/i.test(cleaned.split('?')[0])
  if (!hasImageExt) return ''
  if (cleaned.startsWith('http')) return cleaned
  const base = API_BASE_URL.replace(/\/api$/, '')
  return `${base}${cleaned.startsWith('/') ? '' : '/'}${cleaned}`
}

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

.file-input {
  height: 42px;
  padding: 10px 12px;
  color: #e5e7eb;
}

.logo-preview img {
  max-width: 140px;
  max-height: 140px;
  border-radius: 8px;
  border: 1px solid #1f2a3a;
}

.p-dialog .p-button:not(.p-button-text):hover {
  background: #1f2937;
  border-color: #1f2937;
}

.toggle-btn {
  position: relative;
  width: 52px;
  height: 30px;
  border-radius: 999px;
  border: 1px solid #1f2a3a;
  background: #0b1220;
  display: inline-flex;
  align-items: center;
  padding: 4px;
  transition: all 0.2s ease;
}

.toggle-btn .dot {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #9ca3af;
  transition: transform 0.2s ease, background 0.2s ease;
}

.toggle-btn.active {
  background: linear-gradient(135deg, #22c55e, #16a34a);
  border-color: #22c55e;
}

.toggle-btn.active .dot {
  transform: translateX(20px);
  background: #fff;
}
.dialog-form .field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
</style>
