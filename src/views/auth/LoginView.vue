<template>
  <main>
    <h1>Login</h1>
    <Transition name="form-error">
      <div v-if="errorMessage" class="form-error" role="alert">{{ errorMessage }}</div>
    </Transition>
    <form class="cv-card" @submit="onSubmit">
      <fieldset>
        <div class="field">
          <label for="email">Email</label>
          <input type="email" id="email" name="email" v-model="email" v-bind="emailAttrs" />
          <div class="errors-container">{{ errors.email }}</div>
        </div>
        <div class="field">
          <label for="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            v-model="password"
            v-bind="passwordAttrs"
          />
          <div class="errors-container">{{ errors.password }}</div>
        </div>
      </fieldset>
      <button type="submit">Sign in</button>
    </form>
  </main>
</template>
<script setup lang="ts">
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/yup';
import * as yup from 'yup';
import { useRouter } from 'vue-router';

import { useAuthStore } from '@/stores/auth';
import { ref } from 'vue';

const { loginWithCredentials } = useAuthStore();
const errorMessage = ref<string>();

const router = useRouter();

const schema = toTypedSchema(
  yup.object({
    email: yup
      .string()
      .required('You must provide an email')
      .email('You must provide a valid email'),
    password: yup.string().required('You must provide a password')
  })
);

const { defineField, handleSubmit, errors } = useForm({ validationSchema: schema });

const [email, emailAttrs] = defineField('email');
const [password, passwordAttrs] = defineField('password');

const onSubmit = handleSubmit(async (values) => {
  const result = await loginWithCredentials(values.email, values.password);
  if (!result) {
    errorMessage.value = undefined;
    router.push({ name: 'tracking' });
  } else {
    errorMessage.value = result;
  }
});
</script>
<style scoped src="../../assets/auth-form.css"></style>
