<template>
  <form @submit="onSubmit">
    <fieldset>
      <legend>General</legend>
      <FormInput
        :name="'societyName'"
        :title="'Company name'"
        :defaultValue="societyName"
        :error="errors.societyName"
        :type="'text'"
        v-model="societyName"
        v-bind="societyNameAttrs"
      />
      <FormInput
        :name="'jobTitle'"
        title="Job's title"
        :defaultValue="jobTitle"
        :error="errors.jobTitle"
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
        type="date"
        v-model="sendDate"
        v-bind="sendDateAttrs"
      />
      <FormInput
        name="responseDate"
        title="Date response"
        :error="errors.responseDate"
        type="date"
        v-model="responseDate"
        v-bind="responseDateAttrs"
      />
      <FormInput
        name="isAccepted"
        title="Date response"
        :defaultValue="isAccepted ? 'true' : 'false'"
        :error="errors.isAccepted"
        type="checkbox"
        v-model="isAccepted"
        v-bind="isAcceptedAttrs"
      />
    </fieldset>
    <fieldset>
      <legend>Details</legend>
      <label for="offerDetails">offerDetails</label>
      <input type="file" v-bind="offerDetailsAttrs" />
      <div>{{ errors.offerDetails }}</div>
      <FormInput
        name="offerDetails"
        title="Offer's details"
        :defaultValue="offerDetails ? `${offerDetails}` : ''"
        :error="errors.offerDetails"
        type="text"
        v-model="offerDetails"
        v-bind="offerDetailsAttrs"
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

const schema = toTypedSchema(
  yup.object({
    societyName: yup.string().required(),
    jobTitle: yup.string().required(),
    sendDate: yup.date().required(),
    responseDate: yup.date().required(),
    isAccepted: yup.boolean().required(),
    offerDetails: yup.mixed().required()
  })
)

const { defineField, handleSubmit, errors } = useForm({ validationSchema: schema })

type JobApplicationFormEmits = {
  (
    e: 'submit',
    value: {
      societyName: string
      jobTitle: string
      sendDate: Date
      responseDate: Date
      isAccepted: boolean
      offerDetails: any
    }
  ): void
}
const emit = defineEmits<JobApplicationFormEmits>()

const onSubmit = handleSubmit((values) => {
  emit('submit', values)
})

const [societyName, societyNameAttrs] = defineField('societyName')
const [jobTitle, jobTitleAttrs] = defineField('jobTitle')
const [isAccepted, isAcceptedAttrs] = defineField('isAccepted')
const [sendDate, sendDateAttrs] = defineField('sendDate')
const [responseDate, responseDateAttrs] = defineField('responseDate')
const [offerDetails, offerDetailsAttrs] = defineField('offerDetails')
</script>
<style lang="css"></style>
