<template>
  <main>
    <h1>Register</h1>
    <form @submit="onSubmit">
      <fieldset>
        <input type="lastname" v-model="lastname" v-bind="lastnameAttrs" />
        <div>{{ errors.lastname }}</div>
        <input type="firstname" v-model="firstname" v-bind="firstnameAttrs" />
        <div>{{ errors.firstname }}</div>
      </fieldset>
      <fieldset>
        <input type="pseudo" v-model="pseudo" v-bind="pseudoAttrs" />
        <div>{{ errors.pseudo }}</div>
        <input type="email" v-model="email" v-bind="emailAttrs" />
        <div>{{ errors.email }}</div>
      </fieldset>
      <fieldset>
        <input type="password" v-model="password" v-bind="passwordAttrs" />
        <div>{{ errors.password }}</div>
        <input type="confirmationPwd" v-model="confirmationPwd" v-bind="confirmationPwdAttrs" />
        <div>{{ errors.confirmationPwd }}</div>
      </fieldset>
      <button type="submit">Register</button>
    </form>
  </main>
</template>
<script setup lang="ts">
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/yup'
import * as yup from 'yup'

const schema = toTypedSchema(
  yup.object({
    email: yup.string().required().email(),
    password: yup.string().required(),
    confirmationPwd: yup.string().required(),
    pseudo: yup.string().required(),
    lastname: yup.string().required(),
    firstname: yup.string().required()
  })
)

const { defineField, handleSubmit, errors } = useForm({ validationSchema: schema })

const [email, emailAttrs] = defineField('email')
const [password, passwordAttrs] = defineField('password')
const [confirmationPwd, confirmationPwdAttrs] = defineField('confirmationPwd')
const [pseudo, pseudoAttrs] = defineField('pseudo')
const [lastname, lastnameAttrs] = defineField('lastname')
const [firstname, firstnameAttrs] = defineField('firstname')

const onSubmit = handleSubmit((values) => {
  console.log(values)
})
</script>
<style lang="css"></style>
