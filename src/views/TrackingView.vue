<template>
  <main>
    <h1>Your tracking</h1>
    <button @click="toggleFormDisplay">Add</button>
    <div v-if="showForm" class="job-application-form">
      <div class="form-header">
        <h2>Add an application</h2>
        <IconClose @click="toggleFormDisplay" class="close-icon" />
      </div>
      <JobApplicationForm class="form" @submit="onSubmit" />
    </div>
    <JobApplicationTable :job-applications="jobApplications" />
  </main>
</template>
<script setup lang="ts">
import JobApplicationForm from '@/components/form/JobApplicationForm.vue'
import IconClose from '@/components/icons/IconClose.vue'
import JobApplicationTable from '@/components/table/JobApplicationTable.vue'

import JobApplication from '@/modules/model/jobApplication'
import { ref } from 'vue'

const showForm = ref(false)

const jobApplications = ref<Array<JobApplication>>([
  new JobApplication('Fake society1', 'Fake post1', new Date(), undefined, undefined, ''),
  new JobApplication('Fake society2', 'Fake post2', new Date(), undefined, undefined, ''),
  new JobApplication('Fake society3', 'Fake post3', new Date(), undefined, undefined, ''),
  new JobApplication('Fake society4', 'Fake post4', new Date(), undefined, undefined, ''),
  new JobApplication('Fake society5', 'Fake post5', new Date(), undefined, undefined, '')
])

const toggleFormDisplay = () => (showForm.value = !showForm.value)

const onSubmit = (values: any) => {
  alert(JSON.stringify(values))
}
</script>
<style lang="css" scoped>
.close-icon {
  position: absolute;
  cursor: pointer;
  top: 4px;
  right: 4px;
}

.form-header {
  text-align: center;
  color: white;
  font-weight: bold;
  background-color: #548ca4;
  border-radius: 18px 18px 0 0;
}

.job-application-form {
  position: absolute;
  margin-top: 5rem;
  background-color: #92daf2;
  border-radius: 20px;
  border: 1px solid #548ca4;
}

.job-application-form .form {
  padding: 1rem;
}
</style>
