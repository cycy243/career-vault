<template>
  <main>
    <h1>Login</h1>
    <div v-if="authError">{{ authError }}</div>
    <form @submit="onSubmit">
      <fieldset>
        <label for="email">Email</label>
        <input type="email" id="email" name="email" v-model="email" v-bind="emailAttrs" />
        <div class="errors-container">{{ errors.email }}</div>
        <label for="password">Password</label>
        <input
          type="password"
          id="password"
          name="password"
          v-model="password"
          v-bind="passwordAttrs"
        />
        <div class="errors-container">{{ errors.password }}</div>
      </fieldset>
      <button type="submit">Sign in</button>
    </form>
    <button click="loadingClicked">Async loading</button>
  </main>
</template>
<script setup lang="ts">
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/yup'
import * as yup from 'yup'
import { useRouter } from 'vue-router'

import { useAuth } from '@/hooks/useAuth'

const { onLogin, error: authError } = useAuth()

const router = useRouter()

const schema = toTypedSchema(
  yup.object({
    email: yup
      .string()
      .required('You must provide an email')
      .email('You must provide a valid email'),
    password: yup.string().required('You must provide a password')
  })
)

const { defineField, handleSubmit, errors } = useForm({ validationSchema: schema })

const [email, emailAttrs] = defineField('email', {
  validateOnBlur: true,
  validateOnInput: false
})
const [password, passwordAttrs] = defineField('password', {
  validateOnBlur: true,
  validateOnInput: false
})

const onSubmit = handleSubmit(async (values) => {
  if (await onLogin(values.email, values.password)) {
    router.push({ name: 'tracking' })
  }
})
</script>
<style lang="css" scoped>
form {
  width: 350px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

fieldset {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
}

label::after {
  content: ':';
}

label {
  width: 75px;
}

input {
  width: 200px;
}

.errors-container {
  width: 100%;
  margin-inline-start: 75px;
  margin-block-end: 0.6rem;
  color: red;
  text-align: right;
}
</style>
