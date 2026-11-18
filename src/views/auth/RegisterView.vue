<template>
  <main>
    <h1>Register</h1>
    <Transition name="form-error">
      <p v-if="errorMessage" class="form-error" role="alert">{{ errorMessage }}</p>
    </Transition>
    <form class="cv-card" @submit="onSubmit">
      <fieldset>
        <div class="field">
          <label for="lastname">Lastname</label>
          <input
            id="lastname"
            name="lastname"
            type="text"
            v-model="lastname"
            v-bind="lastnameAttrs"
          />
          <div class="errors-container">{{ errors.lastname }}</div>
        </div>
        <div class="field">
          <label for="firstname">Firstname</label>
          <input
            id="firstname"
            name="firstname"
            type="text"
            v-model="firstname"
            v-bind="firstnameAttrs"
          />
          <div class="errors-container">{{ errors.firstname }}</div>
        </div>
      </fieldset>
      <fieldset>
        <div class="field">
          <label for="pseudo">Pseudo</label>
          <input id="pseudo" name="pseudo" type="text" v-model="pseudo" v-bind="pseudoAttrs" />
          <div class="errors-container">{{ errors.pseudo }}</div>
        </div>
        <div class="field">
          <label for="email">Email</label>
          <input id="email" name="email" type="text" v-model="email" v-bind="emailAttrs" />
          <div class="errors-container">{{ errors.email }}</div>
        </div>
      </fieldset>
      <fieldset>
        <div class="field">
          <label for="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            v-model="password"
            v-bind="passwordAttrs"
          />
          <div class="errors-container">{{ errors.password }}</div>
        </div>
        <div class="field">
          <label for="confirmationPwd">Password confirmation</label>
          <input
            id="confirmationPwd"
            name="confirmationPwd"
            type="password"
            v-model="confirmationPwd"
            v-bind="confirmationPwdAttrs"
          />
          <div class="errors-container">{{ errors.confirmationPwd }}</div>
        </div>
      </fieldset>
      <button type="submit">Sign up</button>
    </form>
  </main>
</template>
<script setup lang="ts">
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/yup';
import * as yup from 'yup';
import { ref } from 'vue';

import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const { register } = useAuthStore();
const errorMessage = ref<string>();

const schema = toTypedSchema(
  yup.object({
    email: yup
      .string()
      .required('You must provide an email')
      .email('You must provide a valid email'),
    password: yup.string().required('You must provide a password'),
    confirmationPwd: yup.string().required('You must confirm your password'),
    pseudo: yup.string().required('You must provide a pseudo'),
    lastname: yup.string().required('You must provide a lastname'),
    firstname: yup.string().required('You must provide a firstname')
  })
);

const { defineField, handleSubmit, errors } = useForm({ validationSchema: schema });

const [email, emailAttrs] = defineField('email');
const [password, passwordAttrs] = defineField('password');
const [confirmationPwd, confirmationPwdAttrs] = defineField('confirmationPwd');
const [pseudo, pseudoAttrs] = defineField('pseudo');
const [lastname, lastnameAttrs] = defineField('lastname');
const [firstname, firstnameAttrs] = defineField('firstname');

const router = useRouter();

const onSubmit = handleSubmit(async (values) => {
  const registerResult = await register({
    email: values.email,
    pseudo: values.pseudo,
    password: values.password,
    firstname: values.firstname,
    lastname: values.lastname
  });
  if (!registerResult) {
    errorMessage.value = undefined;
    router.push({ name: 'tracking' });
  } else {
    errorMessage.value = registerResult;
  }
});
</script>
<style scoped src="../../assets/auth-form.css"></style>
<style scoped>
main {
  --auth-form-width: 36rem;
  --auth-form-cols: 1fr 1fr;
}
</style>
