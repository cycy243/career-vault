<template>
  <main>
    <h1>Your tracking</h1>
    <div>
      <button @click="toggleFormDisplay">Add</button>
      <IconToPDF @click="exportToPdf" title="Export to pdf" />
      <IconToExcel @click="exportToExcel" title="Export to excel" />
    </div>
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
import { inject, onMounted, provide, ref } from 'vue'

import { useAuthStore } from '@/stores/auth'
import type IJobApplicationService from '@/modules/services/IJobApplicationService'
import IconToPDF from '@/components/icons/IconToPDF.vue'
import type IExportJobApplication from '@/modules/services/files/iExportJobApplication'
import ServiceError from '@/modules/services/errors/serviceError'
import { toast } from 'vue3-toastify'
import IconToExcel from '@/components/icons/IconToExcel.vue'

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
const jobApplicationService = inject<IJobApplicationService>(
  'jobApplicationService'
) as IJobApplicationService

const onSubmit = async (values: JobApplication, application: File | string) => {
  const result = await jobApplicationService.saveApplication(values, application)
  if (result) {
    showForm.value = false
    if (values.applicationId) {
      const previousValueIndex = jobApplications.value.findIndex(
        (ja: JobApplication) => ja.applicationId === values.applicationId
      )
      jobApplications.value[previousValueIndex] = result
    } else {
      jobApplications.value.push(result)
    }
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

const exportJobApplicationService = inject<IExportJobApplication>('exportJobApplication')
const exportToPdf = async () => {
  try {
    await exportJobApplicationService?.exportToPdf(jobApplications.value)
    toast('Doc sucessfully exported', {
      type: 'success',
      autoClose: 1000
    })
  } catch (error) {
    if (error instanceof ServiceError) {
      toast(error.message, {
        type: 'error'
      })
    } else {
      toast('An unexpected error occured', {
        type: 'error'
      })
    }
  }
}

const exportToExcel = async () => {
  try {
    await exportJobApplicationService?.exportToExcel(jobApplications.value)
    toast('Doc sucessfully exported', {
      type: 'success',
      autoClose: 1000
    })
  } catch (error) {
    if (error instanceof ServiceError) {
      toast(error.message, {
        type: 'error'
      })
    } else {
      toast('An unexpected error occured', {
        type: 'error'
      })
    }
  }
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
