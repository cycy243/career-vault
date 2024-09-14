<template>
  <main>
    <h1>Your tracking</h1>
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
        </tr>
      </thead>
      <tbody>
        <tr v-for="(application, index) in jobApplications" :key="index">
          <td>{{ application.societyName }}</td>
          <td>{{ application.jobTitle }}</td>
          <td>{{ application.sendDate.toLocaleDateString() }}</td>
          <td>
            {{ application.responseDate?.toLocaleDateString() ?? 'No response yet' }}
          </td>
          <td>{{ application.positiveReponse ?? '?' }}</td>
          <td><a :href="application.applicationLink">offre's link</a></td>
        </tr>
      </tbody>
    </table>
  </main>
</template>
<script setup lang="ts">
import IconSortArrow from '../components/icons/IconSortArrow.vue'

import JobApplication from '@/modules/model/jobApplication'
import { ref } from 'vue'

const sortColumn = ref<string>()

const ascending = ref(false)
const jobApplications = ref<Array<JobApplication>>([
  new JobApplication('Fake society1', 'Fake post1', new Date(), undefined, undefined, ''),
  new JobApplication('Fake society2', 'Fake post2', new Date(), undefined, undefined, ''),
  new JobApplication('Fake society3', 'Fake post3', new Date(), undefined, undefined, ''),
  new JobApplication('Fake society4', 'Fake post4', new Date(), undefined, undefined, ''),
  new JobApplication('Fake society5', 'Fake post5', new Date(), undefined, undefined, '')
])

function sort(col: keyof JobApplication) {
  if (sortColumn.value === col) {
    ascending.value = !ascending.value
  } else {
    ascending.value = false
    sortColumn.value = col
  }
  const isAscending = ascending.value
  jobApplications.value.sort((a, b) => {
    if (a[col]! > b[col]!) {
      return isAscending ? 1 : -1
    } else if (a[col]! < b[col]!) {
      return isAscending ? -1 : 1
    }
    return 0
  })
}
</script>
<style lang="css" scoped>
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
</style>
