<template>
  <form @submit="onSubmit">
    <fieldset>
      <FormGroupInputRadio
        label="Application type"
        :options="[
          { inputValue: 'spontaneous', value: 'Spatoneaous application' },
          { inputValue: 'job_offer', value: 'Job offer' }
        ]"
        input_name="application_type"
        v-model:value="applicationType"
        v-bind="applicationTypeAttrs"
      />
    </fieldset>
    <fieldset>
      <legend>General</legend>
      <FormInput
        :name="'societyName'"
        :title="'Company name'"
        :error="errors.societyName"
        :type="'text'"
        :defaultValue="jobApplication?.companyInformation.societyName"
        v-model="societyName"
        v-bind="societyNameAttrs"
      />
      <FormInput
        :name="'societyWebSite'"
        :title="'Company website'"
        :error="errors.societyWebsite"
        :type="'text'"
        :defaultValue="jobApplication?.companyInformation.societyWebsite"
        v-model="societyWebsite"
        v-bind="societyWebsiteAttrs"
      />
      <template v-if="applicationType === 'job_offer'">
        <FormInput
          :name="'jobTitle'"
          title="Job's title"
          :error="errors.jobTitle"
          :defaultValue="jobApplication?.jobTitle"
          :type="'text'"
          v-model="jobTitle"
          v-bind="jobTitleAttrs"
        />
      </template>
    </fieldset>
    <fieldset>
      <legend>Contact</legend>
      <FormInputSelect
        inputLabel="How did you apply?"
        inputName="apply-method"
        :options="[
          { name: 'email', value: 'By email' },
          { name: 'website', value: 'With a website' },
          { name: 'linkedin', value: 'Via LinkedIn' }
        ]"
        v-model="applyMethod"
        v-bind="applyMethodAttrs"
      />
      <template v-if="applyMethod === 'website'">
        <FormInput
          :name="'applyWebSite'"
          :title="'Website'"
          :error="errors.applyWebSite"
          :type="'text'"
          :defaultValue="jobApplication?.contactInformation?.name"
          v-model="applyWebSite"
          v-bind="applyWebSiteAttrs"
        />
      </template>
      <template v-if="applyMethod === 'email'">
        <FormInput
          :name="'contactName'"
          :title="'Name'"
          :error="errors.contactName"
          :type="'text'"
          :defaultValue="jobApplication?.contactInformation?.name"
          v-model="contactName"
          v-bind="contactNameAttrs"
        />
        <FormInput
          :name="'contactEmail'"
          :title="'Email'"
          :error="errors.contactEmail"
          :type="'email'"
          :defaultValue="jobApplication?.contactInformation?.mail"
          v-model="contactEmail"
          v-bind="contactEmailAttrs"
        />
        <FormInput
          :name="'contactFunction'"
          :title="'Function'"
          :error="errors.contactFunction"
          :type="'text'"
          :defaultValue="jobApplication?.contactInformation?.function"
          v-model="contactFunction"
          v-bind="contactFunctionAttrs"
        />
      </template>
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
        title="Date refusing"
        :error="errors.responseDate"
        :defaultValue="jobApplication?.responseDate?.toISOString().slice(0, 10)"
        type="date"
        v-model="responseDate"
        v-bind="responseDateAttrs"
      />
      <FormInput
        name="interviewDate"
        title="Date interview"
        :error="errors.interviewDate"
        :defaultValue="jobApplication?.interviewDate?.toISOString().slice(0, 10)"
        type="date"
        v-model="interviewDate"
        v-bind="interviewDateAttrs"
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
    <fieldset v-if="applicationType === 'job_offer'">
      <legend>Details</legend>
      <label for="offerDetails">Offer's details</label>
      <input
        name="offerDetails"
        type="file"
        v-bind="offerDetailsAttrs"
        @change.prevent="offerDetailsFileChanged($event)"
      />
      <FormInput
        name="offerDetails"
        title="Offer's details"
        :defaultValue="jobApplication?.applicationLink"
        type="text"
        v-model="offerDetails"
        v-bind="offerDetailsAttrs"
        @update:modelValue="(value) => offerDetailsChange(value)"
      />
      <div v-if="errors.offerDetails" class="error_wrapper">{{ errors.offerDetails }}</div>
    </fieldset>
    <!-- To decomment later because this is for adding "proof" -->
    <!-- <fieldset>
      <legend>Document</legend>
      <p>Document like resume or cover letter send to the employer</p>
      <input
        name="offerDetails"
        type="file"
        v-bind="offerDetailsAttrs"
        @change.prevent="onNewDocumentAdded($event)"
      />
      <p v-if="otherFiles.length === 0">No file added</p>
      <ul v-else>
        <li v-for="(file, index) in otherFiles" :key="index">{{ file.name }}</li>
      </ul>
    </fieldset> -->
    <button type="submit">Add</button>
  </form>
</template>
<script setup lang="ts">
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/yup';
import * as yup from 'yup';
import FormInput from './FormInput.vue';
import JobApplication from '@/modules/model/jobApplication';
import { ref, watch } from 'vue';
import FormGroupInputRadio from './FormGroupInputRadio.vue';
import FormInputSelect from './FormInputSelect.vue';

type JobApplicationFormProps = {
  jobApplication?: JobApplication;
};

const props = defineProps<JobApplicationFormProps>();
watch(
  () => props.jobApplication,
  (newValue) => {
    if (newValue) {
      societyName.value = newValue.companyInformation.societyName;
      sendDate.value = newValue.sendDate;
      responseDate.value = newValue.responseDate;
      offerDetails.value = newValue.applicationLink;
      isAccepted.value = newValue.positiveReponse;
      jobTitle.value = newValue.jobTitle;
    } else {
      resetForm();
    }
  },
  {
    deep: false
  }
);

const schema = toTypedSchema(
  yup.object({
    societyName: yup.string().required("The company's name is required"),
    contactName: yup.string(),
    applyMethod: yup.string(),
    contactEmail: yup
      .string()
      .email('The email should be a valid email')
      .when(['applicationType', 'applyMethod'], {
        is: (applicationType: string, applyMethod: string) =>
          isSpontaneousApplication(applicationType) && applyMethod === 'email',
        then: () =>
          yup
            .string()
            .email('The email should be a valid email')
            .required('You should provide the email you use to submit your application')
      }),
    applyWebSite: yup.string().when('applyMethod', {
      is: (applyMethod: string) => applyMethod === 'website',
      then: () => yup.string().url().required()
    }),
    contactFunction: yup.string(),
    societyWebsite: yup.string().url("The website's url should be a valid url"),
    jobTitle: yup.string().when('applicationType', {
      is: (applicationType: string) => !isSpontaneousApplication(applicationType),
      then: () => yup.string().required("The job's title is required")
    }),
    sendDate: yup.date().required('The sending date is required'),
    interviewDate: yup.date(),
    responseDate: yup.date(),
    isAccepted: yup.boolean().required('The accepting status is required'),
    applicationType: yup.string().required('You should provide what is your application is about'),
    offerDetails: yup.mixed().when('applicationType', {
      is: (applicationType: string) => !isSpontaneousApplication(applicationType),
      then: () => yup.mixed().required("You have to provide the offer's details")
    })
  })
);

const isSpontaneousApplication = (applicationType: string) => applicationType !== 'job_offer';

const { defineField, handleSubmit, errors, resetForm } = useForm({
  initialValues: {
    applicationType: 'spontaneous',
    applyMethod: 'email'
  },
  validationSchema: schema
});

type JobApplicationFormEmits = {
  (e: 'submit', value: JobApplication, application: File | string): void;
  (e: 'new-application', value: JobApplication, application: File | string): void;
};
const applicationFile = ref<File | string>();
const otherFiles = ref<Array<File>>([]);

const emit = defineEmits<JobApplicationFormEmits>();

const onSubmit = handleSubmit(
  (values) => {
    const submittedApplication = JobApplication.createJobApplication({
      ...values,
      positiveReponse: values.isAccepted
    });

    submittedApplication.applicationId = props.jobApplication?.applicationId;
    console.log('chch');

    emit('submit', submittedApplication, applicationFile.value || '');
  },
  ({ errors }) => {
    console.log(errors);
  }
);

function offerDetailsFileChanged($event: Event) {
  // eslint-disable-next-line no-unsafe-optional-chaining
  const event = $event as InputEvent;
  const files = event.dataTransfer
    ? [...event.dataTransfer.files]
    : [...((event.target as any)?.files as FileList)];
  offerDetails.value = files[0];
  offerDetailsChange(files[0]);
}

function onNewDocumentAdded($event: Event) {
  // eslint-disable-next-line no-unsafe-optional-chaining
  const event = $event as InputEvent;
  const files = event.dataTransfer
    ? [...event.dataTransfer.files]
    : [...((event.target as any)?.files as FileList)];
  otherFiles.value = [...otherFiles.value, ...files];
}

function offerDetailsChange(offerDetails: File | string) {
  applicationFile.value = offerDetails;
}

const validationOptions = { validateOnBlur: true };
const [societyName, societyNameAttrs] = defineField('societyName', validationOptions);
const [jobTitle, jobTitleAttrs] = defineField('jobTitle', validationOptions);
const [isAccepted, isAcceptedAttrs] = defineField('isAccepted', validationOptions);
const [sendDate, sendDateAttrs] = defineField('sendDate', validationOptions);
const [responseDate, responseDateAttrs] = defineField('responseDate', validationOptions);
const [offerDetails, offerDetailsAttrs] = defineField('offerDetails', validationOptions);
const [applicationType, applicationTypeAttrs] = defineField('applicationType', validationOptions);
const [interviewDate, interviewDateAttrs] = defineField('interviewDate', validationOptions);
const [societyWebsite, societyWebsiteAttrs] = defineField('societyWebsite', validationOptions);
const [contactEmail, contactEmailAttrs] = defineField('contactEmail', validationOptions);
const [contactFunction, contactFunctionAttrs] = defineField('contactFunction', validationOptions);
const [contactName, contactNameAttrs] = defineField('contactName', validationOptions);
const [applyMethod, applyMethodAttrs] = defineField('applyMethod', validationOptions);
const [applyWebSite, applyWebSiteAttrs] = defineField('applyWebSite', validationOptions);
</script>
<style lang="css"></style>
