<template>
  <main>
    <h1>Your tracking</h1>
    <table>
      <thead>
        <tr>
          <td>Society name</td>
          <td>Postname</td>
          <td>Application date</td>
          <td>Application response date</td>
          <td>Is accepted</td>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(application, index) in jobApplications" :key="index">
          <td>{{ application.societyName }}</td>
          <td>{{ application.jobTitle }}</td>
          <td>{{ application.sendDate.toLocaleDateString() }}</td>
          <td>{{ application.responseDate?.toLocaleDateString() ?? 'No response yet' }}</td>
          <td>{{ application.positiveReponse ?? '?' }}</td>
        </tr>
      </tbody>
    </table>
  </main>
</template>
<script setup lang="ts">
import JobApplication from '@/modules/model/jobApplication'
import { ref } from 'vue'

const jobApplications = ref<Array<JobApplication>>([
  new JobApplication('Fake society1', 'Fake post1', new Date(), undefined, undefined),
  new JobApplication('Fake society2', 'Fake post2', new Date(), undefined, undefined),
  new JobApplication('Fake society3', 'Fake post3', new Date(), undefined, undefined),
  new JobApplication('Fake society4', 'Fake post4', new Date(), undefined, undefined),
  new JobApplication('Fake society5', 'Fake post5', new Date(), undefined, undefined)
])
</script>
