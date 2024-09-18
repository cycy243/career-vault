<template>
  <main>
    <h1>Your tracking</h1>
    <button @click="toggleFormDisplay">Add</button>
    <div v-show="showForm" class="job-application-form">
      <div class="form-header">
        <h2>Add an application</h2>
        <IconClose @click="toggleFormDisplay" class="close-icon" />
      </div>
      <JobApplicationForm
        class="form"
        @submit="onSubmit"
        v-bind:job-application="selectedApplication"
      />
    </div>
    <JobApplicationTable
      :job-applications="jobApplications"
      @delete="onDeleteApplication"
      @update="onUpdate"
    />
  </main>
</template>
<script setup lang="ts">
import JobApplicationForm from '@/components/form/JobApplicationForm.vue'
import IconClose from '@/components/icons/IconClose.vue'
import JobApplicationTable from '@/components/table/JobApplicationTable.vue'

import JobApplication from '@/modules/model/jobApplication'
import type IJobApplicationRepository from '@/modules/repository/IJobApplicationRepository'
import { inject, onMounted, ref } from 'vue'

import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

const showForm = ref(false)

const jobApplications = ref<Array<JobApplication>>([])
const selectedApplication = ref<JobApplication | undefined>()

const toggleFormDisplay = () => {
  selectedApplication.value = undefined
  showForm.value = !showForm.value
}

const jobApplicationRepository = inject<IJobApplicationRepository>(
  'jobApplicationRepository'
) as IJobApplicationRepository

const onSubmit = async (values: JobApplication, application: File | string) => {
  const result = await jobApplicationRepository.addApplication(
    authStore.authenticatedUser?.uid!,
    values,
    application
  )
  if (result) {
    showForm.value = false
    jobApplications.value.push(result)
  }
}

const onDeleteApplication = async (applicationId: string | undefined) => {
  if (!applicationId) {
    console.info("Doc id shouldn't be empty")
    return false
  }

  const deleteResult = await jobApplicationRepository.deleteApplication(applicationId)
  if (deleteResult) {
    console.info('Doc sucessfully deleted')
    jobApplications.value = jobApplications.value.filter((a) => a.applicationId !== applicationId)
  } else {
    console.info('An error occured')
  }
}

const onUpdate = async (application: JobApplication) => {
  selectedApplication.value = application
  showForm.value = true
}

onMounted(async () => {
  const gettedApplications = await jobApplicationRepository.getApplications(
    authStore.authenticatedUser?.uid!
  )
  jobApplications.value = gettedApplications!
})
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
