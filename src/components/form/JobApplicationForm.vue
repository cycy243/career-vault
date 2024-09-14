<template>
  <form @submit="onSubmit">
    <fieldset>
      <legend>General</legend>
      <label for="societyName">societyName</label>
      <input type="text" v-model="societyName" v-bind="societyNameAttrs" />
      <div>{{ errors.societyName }}</div>
      <label for="jobTitle">jobTitle</label>
      <input type="text" v-model="jobTitle" v-bind="jobTitleAttrs" />
      <div>{{ errors.jobTitle }}</div>
    </fieldset>
    <fieldset>
      <legend>Satus</legend>
      <label for="sendDate">sendDate</label>
      <input type="date" v-model="sendDate" v-bind="sendDateAttrs" />
      <div>{{ errors.sendDate }}</div>
      <label for="responseDate">responseDate</label>
      <input type="date" v-model="responseDate" v-bind="responseDateAttrs" />
      <div>{{ errors.responseDate }}</div>
      <label for="isAccepted">isAccepted</label>
      <input type="checkbox" v-model="isAccepted" v-bind="isAcceptedAttrs" />
      <div>{{ errors.isAccepted }}</div>
    </fieldset>
    <fieldset>
      <legend>Details</legend>
      <label for="offerDetails">offerDetails</label>
      <input type="file" v-bind="offerDetailsAttrs" />
      <div>{{ errors.offerDetails }}</div>
      <label for="offerDetails">offerDetails</label>
      <input type="text" v-model="offerDetails" v-bind="offerDetailsAttrs" />
      <div>{{ errors.offerDetails }}</div>
    </fieldset>
  </form>
</template>
<script setup lang="ts">
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/yup'
import * as yup from 'yup'

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

const onSubmit = handleSubmit((values) => {})

const [societyName, societyNameAttrs] = defineField('societyName')
const [jobTitle, jobTitleAttrs] = defineField('jobTitle')
const [isAccepted, isAcceptedAttrs] = defineField('isAccepted')
const [sendDate, sendDateAttrs] = defineField('sendDate')
const [responseDate, responseDateAttrs] = defineField('responseDate')
const [offerDetails, offerDetailsAttrs] = defineField('offerDetails')
</script>
<style lang="css"></style>
