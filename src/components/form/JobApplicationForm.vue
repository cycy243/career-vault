<template>
  <form @submit="onSubmit">
    <fieldset>
      <legend>General</legend>
      <FormInput
        :name="'societyName'"
        :title="'Company name'"
        :error="errors.societyName"
        :type="'text'"
        :defaultValue="jobApplication?.societyName"
        v-model="societyName"
        v-bind="societyNameAttrs"
      />
      <FormInput
        :name="'jobTitle'"
        title="Job's title"
        :error="errors.jobTitle"
        :defaultValue="jobApplication?.jobTitle"
        :type="'text'"
        v-model="jobTitle"
        v-bind="jobTitleAttrs"
      />
    </fieldset>
    <fieldset>
      <legend>Satus</legend>
      <FormInput
        name="sendDate"
        title="Date send"
        :error="errors.sendDate"
        :defaultValue="jobApplication?.sendDate?.toISOString().slice(0, 10)"
        type="date"
        v-model="sendDate"
        v-bind="sendDateAttrs"
      />
      <FormInput
        name="responseDate"
        title="Date response"
        :error="errors.responseDate"
        :defaultValue="jobApplication?.responseDate?.toISOString().slice(0, 10)"
        type="date"
        v-model="responseDate"
        v-bind="responseDateAttrs"
      />
      <FormInput
        name="isAccepted"
        title="Is accepted"
        :error="errors.isAccepted"
        :defaultValue="`${jobApplication?.positiveReponse}`"
        type="checkbox"
        v-model="isAccepted"
        v-bind="isAcceptedAttrs"
      />
    </fieldset>
    <fieldset>
      <legend>Details</legend>
      <label for="offerDetails">Offer's details</label>
      <input
        name="offerDetails"
        type="file"
        v-bind="offerDetailsAttrs"
        @change.prevent="offerDetailsFileChanged($event)"
      />
      <div>{{ errors.offerDetails }}</div>
      <FormInput
        name="offerDetails"
        title="Offer's details"
        :error="errors.offerDetails"
        :defaultValue="jobApplication?.applicationLink"
        type="text"
        v-model="offerDetails"
        v-bind="offerDetailsAttrs"
        @update:modelValue="(value) => offerDetailsChange(value)"
      />
    </fieldset>
    <button type="submit">Add</button>
  </form>
</template>
<script setup lang="ts">
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/yup'
import * as yup from 'yup'
import FormInput from './FormInput.vue'
import JobApplication from '@/modules/model/jobApplication'
import { ref, watch } from 'vue'

type JobApplicationFormProps = {
  jobApplication?: JobApplication
}

const props = defineProps<JobApplicationFormProps>()
watch(
  () => props.jobApplication,
  (newValue) => {
    console.log('watch props')
    console.log(JSON.stringify(newValue))

    if (newValue) {
      societyName.value = newValue.societyName
      sendDate.value = newValue.sendDate
      responseDate.value = newValue.responseDate
      offerDetails.value = newValue.applicationLink
      isAccepted.value = newValue.positiveReponse
      jobTitle.value = newValue.jobTitle
    } else {
      resetForm()
    }
  },
  {
    deep: false
  }
)

const schema = toTypedSchema(
  yup.object({
    societyName: yup.string().required(),
    jobTitle: yup.string().required(),
    sendDate: yup.date(),
    responseDate: yup.date(),
    isAccepted: yup.boolean().required(),
    offerDetails: yup.mixed().required()
  })
)

const { defineField, handleSubmit, errors, resetForm } = useForm({
  validationSchema: schema
})

type JobApplicationFormEmits = {
  (e: 'submit', value: JobApplication, application: File | string): void
}
const applicationFile = ref<File | string>()

const emit = defineEmits<JobApplicationFormEmits>()

const onSubmit = handleSubmit((values) => {
  const submittedApplication = new JobApplication(
    values.societyName,
    values.jobTitle,
    values.sendDate,
    values.isAccepted,
    values.responseDate
  )
  submittedApplication.applicationId = props.jobApplication?.applicationId
  emit('submit', submittedApplication, applicationFile.value || '')
})

function offerDetailsFileChanged($event: Event) {
  // eslint-disable-next-line no-unsafe-optional-chaining
  const event = $event as InputEvent
  const files = event.dataTransfer
    ? [...event.dataTransfer.files]
    : [...((event.target as any)?.files as FileList)]
  offerDetails.value = files[0]
  offerDetailsChange(files[0])
}

function offerDetailsChange(offerDetails: File | string) {
  applicationFile.value = offerDetails
}

const validationOptions = { validateOnBlur: true }
const [societyName, societyNameAttrs] = defineField('societyName', validationOptions)
const [jobTitle, jobTitleAttrs] = defineField('jobTitle', validationOptions)
const [isAccepted, isAcceptedAttrs] = defineField('isAccepted', validationOptions)
const [sendDate, sendDateAttrs] = defineField('sendDate', validationOptions)
const [responseDate, responseDateAttrs] = defineField('responseDate', validationOptions)
const [offerDetails, offerDetailsAttrs] = defineField('offerDetails', validationOptions)
</script>
<style lang="css"></style>
