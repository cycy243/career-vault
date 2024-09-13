<template>
  <main>
    <h1>Your tracking</h1>
    <table>
      <thead>
        <tr>
          <td @click="sort('societyName')">Society name</td>
          <td @click="sort('jobTitle')">Post's name</td>
          <td @click="sort('sendDate')">Application date</td>
          <td @click="sort('responseDate')">Application response date</td>
          <td @click="sort('positiveReponse')">Is accepted</td>
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
        </tr>
      </tbody>
    </table>
  </main>
</template>
<script setup lang="ts">
import JobApplication from '@/modules/model/jobApplication'
import { ref } from 'vue'

const sortColumn = ref<string>()

const ascending = ref(false)
const jobApplications = ref<Array<JobApplication>>([
  new JobApplication('Fake society1', 'Fake post1', new Date(), undefined, undefined),
  new JobApplication('Fake society2', 'Fake post2', new Date(), undefined, undefined),
  new JobApplication('Fake society3', 'Fake post3', new Date(), undefined, undefined),
  new JobApplication('Fake society4', 'Fake post4', new Date(), undefined, undefined),
  new JobApplication('Fake society5', 'Fake post5', new Date(), undefined, undefined)
])

function sort(col: string) {
  if (sortColumn.value === col) {
    ascending.value = !ascending.value
  } else {
    ascending.value = false
    sortColumn.value = col
  }
  const isAscending = ascending.value
  jobApplications.value.sort((a, b) => {
    if (a[col] > b[col]) {
      return isAscending ? 1 : -1
    } else if (a[col] < b[col]) {
      return isAscending ? -1 : 1
    }
    return 0
  })
}
</script>
<style lang="css" scoped>
table {
  border-collapse: collapse;
}

tr:nth-child(2n),
thead {
  background-color: #548ca4;
}

tr td {
  text-align: center;
  min-width: 7rem;
  padding-inline: 0.5rem;
}

tr td:first-child {
  text-align: start;
}
</style>
