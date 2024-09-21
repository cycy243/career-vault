<template>
  <main>
    <h1>Register</h1>
    <form @submit="onSubmit">
      <fieldset>
        <label for="lastname">Lastname</label>
        <input name="lastname" type="text" v-model="lastname" v-bind="lastnameAttrs" />
        <div>{{ errors.lastname }}</div>
        <label for="firstname">Firstname</label>
        <input name="firstname" type="text" v-model="firstname" v-bind="firstnameAttrs" />
        <div>{{ errors.firstname }}</div>
      </fieldset>
      <fieldset>
        <label for="pseudo">pseudo</label>
        <input name="pseudo" type="text" v-model="pseudo" v-bind="pseudoAttrs" />
        <div>{{ errors.pseudo }}</div>
        <label for="email">email</label>
        <input name="email" type="text" v-model="email" v-bind="emailAttrs" />
        <div>{{ errors.email }}</div>
      </fieldset>
      <fieldset>
        <label for="password">password</label>
        <input name="password" type="password" v-model="password" v-bind="passwordAttrs" />
        <div>{{ errors.password }}</div>
        <label for="confirmationPwd">confirmationPwd</label>
        <input
          name="confirmationPwd"
          type="password"
          v-model="confirmationPwd"
          v-bind="confirmationPwdAttrs"
        />
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
import type IAuthRepository from '@/modules/repository/IAuthRepository'
import { inject } from 'vue'

import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()

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

const authRepository = inject<IAuthRepository>('userAuthReposiroty') as IAuthRepository

const router = useRouter()

const onSubmit = handleSubmit(async (values) => {
  authStore.login(
    (await authRepository.register({
      email: values.email,
      pseudo: values.pseudo,
      password: values.password,
      firstname: values.firstname,
      lastname: values.lastname
    }))!
  )
  router.push({ name: 'tracking' })
})
</script>
<style lang="css"></style>
