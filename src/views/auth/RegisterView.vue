<template>
  <main>
    <h1>Register</h1>
    <form @submit="onSubmit">
      <fieldset>
        <label for="lastname">Lastname</label>
        <input name="lastname" type="text" v-model="lastname" v-bind="lastnameAttrs" />
        <div class="errors-container">{{ errors.lastname }}</div>
        <label for="firstname">Firstname</label>
        <input name="firstname" type="text" v-model="firstname" v-bind="firstnameAttrs" />
        <div class="errors-container">{{ errors.firstname }}</div>
      </fieldset>
      <fieldset>
        <label for="pseudo">Pseudo</label>
        <input name="pseudo" type="text" v-model="pseudo" v-bind="pseudoAttrs" />
        <div class="errors-container">{{ errors.pseudo }}</div>
        <label for="email">Email</label>
        <input name="email" type="text" v-model="email" v-bind="emailAttrs" />
        <div class="errors-container">{{ errors.email }}</div>
      </fieldset>
      <fieldset>
        <label for="password">Password</label>
        <input name="password" type="password" v-model="password" v-bind="passwordAttrs" />
        <div class="errors-container">{{ errors.password }}</div>
        <label for="confirmationPwd">Password confirmation</label>
        <input
          name="confirmationPwd"
          type="password"
          v-model="confirmationPwd"
          v-bind="confirmationPwdAttrs"
        />
        <div class="errors-container">{{ errors.confirmationPwd }}</div>
      </fieldset>
      <button type="submit">Sign up</button>
    </form>
  </main>
</template>
<script setup lang="ts">
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/yup'
import * as yup from 'yup'

import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

const { onRegister } = useAuth()

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
)

const { defineField, handleSubmit, errors } = useForm({ validationSchema: schema })

const [email, emailAttrs] = defineField('email')
const [password, passwordAttrs] = defineField('password')
const [confirmationPwd, confirmationPwdAttrs] = defineField('confirmationPwd')
const [pseudo, pseudoAttrs] = defineField('pseudo')
const [lastname, lastnameAttrs] = defineField('lastname')
const [firstname, firstnameAttrs] = defineField('firstname')

const router = useRouter()

const onSubmit = handleSubmit(async (values) => {
  const registerResult = await onRegister({
    email: values.email,
    pseudo: values.pseudo,
    password: values.password,
    firstname: values.firstname,
    lastname: values.lastname
  })
  if (registerResult) {
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

input[name='password'] {
  height: 24px;
}
</style>
