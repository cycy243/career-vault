<template>
  <div class="table-card">
    <table>
      <thead>
        <tr>
          <td v-for="column in columns" :key="column.field" @click="emits('sort', column.field)">
            {{ column.label }}
            <IconSortArrow v-if="column.field === sortField" :is-ascending="ascending" />
          </td>
          <td>Actions</td>
        </tr>
      </thead>
      <tbody>
        <template v-if="loading">
          <tr v-for="n in 3" :key="`skeleton-${n}`" class="skeleton-row" aria-hidden="true">
            <td colspan="7"><div class="skeleton-bar"></div></td>
          </tr>
        </template>
        <template v-else-if="jobApplications.length > 0">
          <tr
            v-for="(application, index) in jobApplications"
            :key="application.applicationId ?? index"
          >
            <td>{{ application.companyInformation?.societyName }}</td>
            <td>
              {{ application.isSpontaneous ? 'Spontaneous application' : application.jobTitle }}
            </td>
            <td>{{ application.sendDate?.toLocaleDateString() ?? '/' }}</td>
            <td>
              {{ application.responseDate?.toLocaleDateString() ?? '/' }}
            </td>
            <td>
              <span
                class="status"
                :class="{
                  'status-yes': application.positiveReponse === true,
                  'status-no': application.positiveReponse === false
                }"
                >{{ application.positiveReponse ?? '?' }}</span
              >
            </td>
            <td>
              <a
                v-if="application.applicationLink"
                :href="application.applicationLink"
                target="_blank"
                >offre's link</a
              >
              <p v-else>/</p>
            </td>
            <td class="actions">
              <IconEdit
                class="action-icon action-edit"
                color="currentColor"
                role="button"
                aria-label="Edit application"
                @click="onEditClicked(application)"
              />
              <IconDelete
                class="action-icon action-delete"
                color="currentColor"
                role="button"
                aria-label="Delete application"
                @click="onDeleteClicked(application.applicationId)"
              />
            </td>
          </tr>
        </template>
        <tr v-else class="error-row">
          <td colspan="7">
            <p class="empty-title">No application made yet</p>
            <p class="empty-hint">Use the “Add” button above to track your first application.</p>
          </td>
        </tr>
      </tbody>
    </table>
    <Paginator
      v-if="totalRecords > 0"
      :first="currentPage * rows"
      :rows="rows"
      :total-records="totalRecords"
      :rows-per-page-options="ROWS_PER_PAGE_OPTIONS"
      :page-link-size="5"
      template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
      class="table-paginator"
      @page="emits('page', { page: $event.page, rows: $event.rows })"
    />
  </div>
</template>
<script setup lang="ts">
import type JobApplication from '@/modules/model/jobApplication';
import Paginator from 'primevue/paginator';
import IconSortArrow from '../icons/IconSortArrow.vue';
import IconDelete from '../icons/IconDelete.vue';
import IconEdit from '../icons/IconEdit.vue';
import { ROWS_PER_PAGE_OPTIONS, type SortField } from '@/modules/model/jobApplicationPagination';

/**
 * Displays one page of applications. Paging and sorting are done by `useJobApplication`:
 * the table only emits `page` and `sort`.
 */
interface JobApplicationTableProps {
  /** Applications of the current page. */
  jobApplications: Array<JobApplication>;
  totalRecords: number;
  /** 0-based index of the displayed page. */
  currentPage: number;
  rows: number;
  sortField: SortField;
  ascending: boolean;
  loading?: boolean;
}

defineProps<JobApplicationTableProps>();

const columns: Array<{ field: SortField; label: string }> = [
  { field: 'societyName', label: 'Society name' },
  { field: 'jobTitle', label: "Post's name" },
  { field: 'sendDate', label: 'Send date' },
  { field: 'responseDate', label: 'response date' },
  { field: 'positiveReponse', label: 'Is accepted' },
  { field: 'applicationLink', label: 'Link' }
];

type JobApplicationTableEmits = {
  (e: 'delete', value: string | undefined): void;
  (e: 'update', value: JobApplication): void;
  (e: 'page', value: { page: number; rows: number }): void;
  (e: 'sort', value: SortField): void;
};

const emits = defineEmits<JobApplicationTableEmits>();

function onDeleteClicked(applicationId: string | undefined) {
  emits('delete', applicationId);
}

function onEditClicked(application: JobApplication) {
  emits('update', application);
}
</script>
<style lang="css" scoped>
.table-card {
  width: 100%;
  overflow-x: auto;
  margin-top: 0.5rem;
  border-radius: var(--cv-radius-lg);
  background: var(--cv-surface-strong);
  box-shadow: var(--cv-shadow);
}

table {
  width: 100%;
  border-collapse: collapse;
  font-variant-numeric: tabular-nums;
}

thead {
  background-color: var(--cv-steel);
}

thead td {
  position: relative;
  padding: 0.8rem 1rem;
  font-size: 0.78rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  font-weight: 600;
  color: var(--cv-white);
  white-space: nowrap;
  cursor: pointer;
  user-select: none;
  transition: background-color var(--cv-fast) var(--cv-ease);
}

thead td:hover {
  background-color: var(--cv-steel-hover);
}

thead td:last-child {
  cursor: default;
}

thead td:last-child:hover {
  background: none;
}

thead td :deep(.arrow) {
  margin-inline-start: 0.4rem;
  filter: brightness(0) invert(1);
}

tbody tr {
  border-top: 1px solid rgba(84, 140, 164, 0.15);
  transition: background-color var(--cv-fast) var(--cv-ease);
}

tbody tr:nth-child(2n) {
  background-color: var(--cv-steel-tint);
}

tbody tr:not(.error-row):not(.skeleton-row):hover {
  background-color: rgba(60, 196, 236, 0.16);
}

tr td {
  min-width: 9rem;
  padding: 0.75rem 1rem;
  text-align: center;
}

tr td:first-child,
tr td:nth-child(2),
thead td {
  text-align: start;
}

tbody td:first-child {
  font-weight: 500;
}

tbody a {
  padding: 0.15rem 0.4rem;
}

tbody a:hover {
  text-decoration: underline;
}

.status {
  display: inline-block;
  min-width: 3rem;
  padding: 0.1rem 0.6rem;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 500;
  background: rgba(44, 62, 80, 0.08);
}

.status-yes {
  background: var(--cv-steel);
  color: var(--cv-white);
}

.status-no {
  background: rgba(44, 62, 80, 0.14);
}

.actions {
  white-space: nowrap;
  display: flex;
  flex-direction: row;
  gap: 0.4rem;
}

.action-icon {
  box-sizing: content-box;
  padding: 0.35rem;
  margin-inline: 0.1rem;
  border-radius: 50%;
  color: var(--cv-ink);
  cursor: pointer;
  vertical-align: middle;
  transition:
    background-color var(--cv-fast) var(--cv-ease),
    color var(--cv-fast) var(--cv-ease),
    transform var(--cv-fast) var(--cv-ease);
}

.action-edit:hover {
  background: var(--cv-steel-tint);
  color: var(--cv-steel);
}

.action-delete:hover {
  background: rgba(180, 35, 24, 0.1);
  color: var(--cv-error);
}

.action-icon:active {
  transform: scale(0.92);
}

.error-row td {
  text-align: center !important;
  padding-block: 2.5rem;
}

.empty-title {
  font-weight: 600;
  font-size: 1.05rem;
}

.empty-hint {
  color: rgba(44, 62, 80, 0.7);
  font-size: 0.9rem;
}

/* ---------- Pagination (PrimeVue Paginator) ---------- */
.table-paginator {
  border-top: 1px solid rgba(84, 140, 164, 0.15);
}

.table-paginator :deep(.p-paginator) {
  flex-wrap: wrap;
  gap: 0.25rem;
  padding: 0.6rem 1rem;
  background: transparent;
  color: var(--cv-ink);
}

.table-paginator :deep(.p-paginator-page),
.table-paginator :deep(.p-paginator-first),
.table-paginator :deep(.p-paginator-prev),
.table-paginator :deep(.p-paginator-next),
.table-paginator :deep(.p-paginator-last) {
  color: var(--cv-steel);
  box-shadow: none;
}

.table-paginator :deep(.p-paginator-page:not(.p-paginator-page-selected):hover),
.table-paginator :deep(.p-paginator-first:not(:disabled):hover),
.table-paginator :deep(.p-paginator-prev:not(:disabled):hover),
.table-paginator :deep(.p-paginator-next:not(:disabled):hover),
.table-paginator :deep(.p-paginator-last:not(:disabled):hover) {
  background: var(--cv-steel-tint);
  color: var(--cv-steel-hover);
}

.table-paginator :deep(.p-paginator-page-selected) {
  background: var(--cv-steel);
  color: var(--cv-white);
}

.skeleton-bar {
  height: 1rem;
  border-radius: 6px;
  background: linear-gradient(
    100deg,
    rgba(84, 140, 164, 0.12) 30%,
    rgba(84, 140, 164, 0.24) 50%,
    rgba(84, 140, 164, 0.12) 70%
  );
  background-size: 200% 100%;
  animation: cv-shimmer 1.2s linear infinite;
}
</style>
