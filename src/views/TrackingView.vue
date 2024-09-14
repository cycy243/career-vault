<template>
  <main>
    <h1>Your tracking</h1>
    <JobApplicationTable :job-applications="jobApplications" />
  </main>
</template>
<script setup lang="ts">
import JobApplicationTable from '@/components/table/JobApplicationTable.vue'

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
</script>
<style lang="css" scoped></style>
