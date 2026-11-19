<template>
  <main class="tracking">
    <div class="tracking-head">
      <h1>Your tracking</h1>
      <div class="toolbar">
        <button type="button" class="add-button" @click="toggleFormDisplay">
          <span aria-hidden="true">+</span> Add
        </button>
        <button
          type="button"
          class="icon-button"
          title="Export to pdf"
          aria-label="Export to pdf"
          @click="exportToPdf"
        >
          <IconToPDF color="currentColor" />
        </button>
        <button
          type="button"
          class="icon-button"
          title="Export to excel"
          aria-label="Export to excel"
          @click="exportToExcel"
        >
          <IconToExcel color="currentColor" />
        </button>
      </div>
    </div>
    <Transition name="modal">
      <div v-show="showForm" class="modal-backdrop" @click.self="closeForm">
        <div
          class="job-application-form"
          role="dialog"
          aria-modal="true"
          aria-labelledby="job-application-form-title"
        >
          <div class="form-header">
            <h2 id="job-application-form-title">
              {{ selectedApplication ? 'Edit an application' : 'Add an application' }}
            </h2>
            <button type="button" class="close-button" aria-label="Close" @click="closeForm">
              <IconClose />
            </button>
          </div>
          <JobApplicationForm
            class="form"
            @submit="onSubmit"
            v-bind:job-application="selectedApplication"
          />
        </div>
      </div>
    </Transition>
    <ConfirmDialog group="delete-application" :pt="{ root: { class: 'confirm-dialog' } }">
      <template #container="{ message, acceptCallback, rejectCallback }">
        <div class="form-header">
          <h2>{{ message.header }}</h2>
          <button type="button" class="close-button" aria-label="Close" @click="rejectCallback">
            <IconClose />
          </button>
        </div>
        <div class="confirm-body">
          <p>{{ message.message }}</p>
          <div class="confirm-actions">
            <button type="button" class="cancel-button" @click="rejectCallback">Cancel</button>
            <button type="button" class="danger-button" @click="acceptCallback">Delete</button>
          </div>
        </div>
      </template>
    </ConfirmDialog>
    <JobApplicationTable
      :job-applications="jobApplications"
      :total-records="totalRecords"
      :current-page="currentPage"
      :rows="rows"
      :sort-field="sortField"
      :ascending="ascending"
      :loading="isLoading"
      @delete="onDeleteApplication"
      @update="onUpdate"
      @page="({ page, rows }) => changePage(page, rows)"
      @sort="sortBy"
    />
  </main>
</template>
<script setup lang="ts">
import JobApplicationForm from '@/components/form/JobApplicationForm.vue';
import IconClose from '@/components/icons/IconClose.vue';

import JobApplication from '@/modules/model/jobApplication';
import { h, onMounted, onBeforeUnmount, ref, defineAsyncComponent } from 'vue';

import { useJobApplication } from '@/composables/useJobApplication';
import { useExportJobApplication } from '@/composables/useExportJobApplication';
import IconToPDF from '@/components/icons/IconToPDF.vue';
import ServiceError from '@/modules/services/errors/serviceError';
import { toast } from 'vue3-toastify';
import IconToExcel from '@/components/icons/IconToExcel.vue';
import ConfirmDialog from 'primevue/confirmdialog';
import { useConfirm } from 'primevue/useconfirm';

const JobApplicationTable = defineAsyncComponent({
  loader: () => import('@/components/table/JobApplicationTable.vue'),
  loadingComponent: { render: () => h('div', { class: 'table-skeleton', 'aria-busy': 'true' }) },
  delay: 150
});

const {
  jobApplications,
  totalRecords,
  currentPage,
  rows,
  sortField,
  ascending,
  isLoading,
  loadCurrentUserJobApplication,
  changePage,
  sortBy,
  fetchAllApplications,
  saveApplication,
  deleteApplication
} = useJobApplication();
isLoading.value = true;

const showForm = ref(false);
const selectedApplication = ref<JobApplication | undefined>();

const toggleFormDisplay = () => {
  selectedApplication.value = undefined;
  showForm.value = !showForm.value;
};

const closeForm = () => {
  showForm.value = false;
};

const onKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && showForm.value) closeForm();
};

const onSubmit = async (values: JobApplication, application: File | string) => {
  const result = await saveApplication(values, application);
  if (result) showForm.value = false;
};

const confirm = useConfirm();

const applicationLabel = (application: JobApplication | undefined) =>
  [application?.companyInformation.societyName, application?.jobTitle]
    .filter((part) => part && part.length > 0)
    .join(' - ');

const onDeleteApplication = (applicationId: string | undefined) => {
  if (!applicationId) {
    console.info("Doc id shouldn't be empty");
    return;
  }

  const application = jobApplications.value.find((a) => a.applicationId === applicationId);

  confirm.require({
    group: 'delete-application',
    header: 'Delete an application',
    message: `Are you sure you want to delete the application "${applicationLabel(application)}"?`,
    accept: async () => {
      if (await deleteApplication(applicationId)) {
        console.info('Doc sucessfully deleted');
      } else {
        console.info('An error occured');
      }
    }
  });
};

const onUpdate = async (application: JobApplication) => {
  selectedApplication.value = application;
  showForm.value = true;
};

// The table only holds the current page: exports load every application first.
const applicationsToExport = ref<JobApplication[]>([]);
const exporter = useExportJobApplication(applicationsToExport);

const runExport = async (doExport: () => Promise<boolean>) => {
  try {
    applicationsToExport.value = await fetchAllApplications();
    await doExport();
    toast('Doc sucessfully exported', { type: 'success', autoClose: 1000 });
  } catch (error) {
    const message = error instanceof ServiceError ? error.message : 'An unexpected error occured';
    toast(message, { type: 'error' });
  }
};

const exportToPdf = () => runExport(exporter.exportToPdf);
const exportToExcel = () => runExport(exporter.exportToExcel);

onMounted(async () => {
  window.addEventListener('keydown', onKeydown);
  await loadCurrentUserJobApplication();
  isLoading.value = false;
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown);
});
</script>
<style lang="css" scoped>
.tracking {
  align-items: stretch !important;
}

.tracking-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
  margin-block: 1.5rem 1rem;
}

.tracking-head h1 {
  margin: 0;
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.add-button span {
  font-size: 1.2em;
  line-height: 1;
}

.icon-button {
  width: 2.5rem;
  height: 2.5rem;
  padding: 0;
  border-radius: 50%;
  background: var(--cv-surface-strong);
  color: var(--cv-steel);
  border: 1px solid var(--cv-border);
}

.icon-button:hover {
  background: var(--cv-white);
  color: var(--cv-steel-hover);
}

.icon-button :deep(svg) {
  width: 1.35rem;
  height: 1.35rem;
}

/* ---------- Add / edit panel ---------- */
.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 5vh 16px;
  overflow-y: auto;
  background: rgba(30, 72, 92, 0.35);
  backdrop-filter: blur(3px);
}

.job-application-form {
  width: 100%;
  max-width: 44rem;
  background-color: var(--cv-sky);
  border-radius: var(--cv-radius-lg);
  border: 1px solid var(--cv-steel);
  box-shadow: var(--cv-shadow-lg);
  overflow: hidden;
}

.form-header {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.85rem 3rem;
  background-color: var(--cv-steel);
}

.form-header h2 {
  margin: 0;
  color: var(--cv-white);
  font-size: 1.15rem;
}

.close-button {
  position: absolute;
  right: 0.6rem;
  top: 50%;
  translate: 0 -50%;
  width: 2.25rem;
  height: 2.25rem;
  padding: 0;
  border-radius: 50%;
  background: transparent;
  box-shadow: none;
}

.close-button:hover {
  background: rgba(255, 255, 255, 0.18);
  transform: rotate(90deg);
}

.job-application-form .form {
  padding: 1.5rem;
}

/* ---------- Delete confirmation (PrimeVue ConfirmDialog, teleported to body) ---------- */
:global(.confirm-dialog.p-dialog) {
  width: calc(100% - 32px);
  max-width: 28rem;
  background-color: var(--cv-sky);
  border-radius: var(--cv-radius-lg);
  border: 1px solid var(--cv-steel);
  box-shadow: var(--cv-shadow-lg);
  overflow: hidden;
  color: var(--cv-ink);
}

.confirm-body {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  padding: 1.5rem;
}

.confirm-body p {
  margin: 0;
  overflow-wrap: anywhere;
}

.confirm-actions {
  display: flex;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.cancel-button {
  background: var(--cv-surface-strong);
  color: var(--cv-steel);
  border: 1px solid var(--cv-border);
}

.cancel-button:hover {
  background: var(--cv-white);
  color: var(--cv-steel-hover);
}

.danger-button {
  background: var(--cv-error);
}

.danger-button:hover {
  background: #912018;
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity var(--cv-med) var(--cv-ease);
}

.modal-enter-active .job-application-form,
.modal-leave-active .job-application-form {
  transition:
    transform var(--cv-med) var(--cv-ease),
    opacity var(--cv-med) var(--cv-ease);
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .job-application-form,
.modal-leave-to .job-application-form {
  opacity: 0;
  transform: translateY(16px) scale(0.98);
}
</style>
