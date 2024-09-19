<template>
  <table>
    <thead>
      <tr>
        <td @click="sort('societyName')">
          Society name
          <IconSortArrow v-if="'societyName' == sortColumn" :is-ascending="ascending" />
        </td>
        <td @click="sort('jobTitle')">
          Post's name
          <IconSortArrow v-if="'jobTitle' == sortColumn" :is-ascending="ascending" />
        </td>
        <td @click="sort('sendDate')">
          Send date
          <IconSortArrow v-if="'sendDate' == sortColumn" :is-ascending="ascending" />
        </td>
        <td @click="sort('responseDate')">
          response date
          <IconSortArrow v-if="'responseDate' == sortColumn" :is-ascending="ascending" />
        </td>
        <td @click="sort('positiveReponse')">
          Is accepted
          <IconSortArrow v-if="'positiveReponse' == sortColumn" :is-ascending="ascending" />
        </td>
        <td @click="sort('applicationLink')">
          Is accepted
          <IconSortArrow v-if="'applicationLink' == sortColumn" :is-ascending="ascending" />
        </td>
        <td>Actions</td>
      </tr>
    </thead>
    <tbody>
      <template v-if="jobApplications.length > 0">
        <tr v-for="(application, index) in jobApplications" :key="index">
          <td>{{ application.societyName }}</td>
          <td>{{ application.jobTitle }}</td>
          <td>{{ application.sendDate?.toLocaleDateString() ?? 'Nothing sent yet' }}</td>
          <td>
            {{ application.responseDate?.toLocaleDateString() ?? 'No response yet' }}
          </td>
          <td>{{ application.positiveReponse ?? '?' }}</td>
          <td><a :href="application.applicationLink" target="_blank">offre's link</a></td>
          <td>
            <IconDelete @click="onDeleteClicked(application.applicationId)" /><IconEdit
              @click="onEditClicked(application)"
            />
          </td>
        </tr>
      </template>
      <tr v-else class="error-row">
        <td colspan="7">No application made yet</td>
      </tr>
    </tbody>
  </table>
</template>
<script setup lang="ts">
import type JobApplication from '@/modules/model/jobApplication'
import { ref } from 'vue'
import IconSortArrow from '../icons/IconSortArrow.vue'
import IconDelete from '../icons/IconDelete.vue'
import IconEdit from '../icons/IconEdit.vue'

interface JobApplicationTableProps {
  jobApplications: Array<JobApplication>
}

const props = defineProps<JobApplicationTableProps>()
const applications = ref<Array<JobApplication>>([])

const sortColumn = ref<string>()
const ascending = ref(false)
function sort(col: keyof JobApplication) {
  if (sortColumn.value === col) {
    ascending.value = !ascending.value
  } else {
    ascending.value = false
    sortColumn.value = col
  }
  const isAscending = ascending.value
  applications.value = props.jobApplications
  applications.value.sort((a, b) => {
    if (a[col]! > b[col]!) {
      return isAscending ? 1 : -1
    } else if (a[col]! < b[col]!) {
      return isAscending ? -1 : 1
    }
    if (a[col] === b[col]) {
      return 0
    }
    if (!a[col] || !b[col]) {
      return -1
    }
    return 0
  })
}

type JobApplicationTableEmits = {
  (e: 'delete', value: string | undefined): void
  (e: 'update', value: JobApplication): void
}

const emits = defineEmits<JobApplicationTableEmits>()

function onDeleteClicked(applicationId: string | undefined) {
  emits('delete', applicationId)
}

function onEditClicked(application: JobApplication) {
  emits('update', application)
}
</script>
<style lang="css">
table {
  border-collapse: collapse;
  margin-top: 1rem;
}

tr:nth-child(2n),
thead {
  background-color: #548ca4;
}

thead td {
  text-transform: uppercase;
  font-weight: bolder;
  color: white;
  text-align: start;
}

tr td {
  text-align: center;
  min-width: 10rem;
  padding-inline: 0.5rem;
}

tr td:first-child,
thead td {
  text-align: start;
}

td:last-child a {
  color: white;
}
td:last-child a:hover {
  text-decoration: underline;
}

.error-row td {
  text-align: center !important;
}
</style>
