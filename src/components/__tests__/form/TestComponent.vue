<template>
  <div>
    <VForm @submit="onSubmit" @invalid-submit="(e) => console.log(e)" :validation-schema="schema">
      <VField name="email" type="email" />
      <VErrorMessage name="email" />
      <button type="submit">Send</button>
    </VForm>
  </div>
</template>
<script lang="ts" setup>
import {
  useForm,
  Form as VForm,
  Field as VField,
  ErrorMessage as VErrorMessage
} from 'vee-validate';
import * as yup from 'yup';

const emits = defineEmits<{
  (e: 'submit'): void;
  (e: 'onwrapper'): void;
}>();

const schema = yup.object({
  email: yup.string().required().email()
});

const onSubmit = () => {
  console.log('submit');

  emits('submit');
};
</script>
