<template>
  <main>
    <h1>Register</h1>
    <form @submit="onSubmit">
      <fieldset>
        <label for="email">email</label>
        <input type="email" v-model="email" v-bind="emailAttrs" />
        <div>{{ errors.email }}</div>
        <label for="password">password</label>
        <input type="password" v-model="password" v-bind="passwordAttrs" />
        <div>{{ errors.password }}</div>
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
import { useRouter } from 'vue-router'

import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

const schema = toTypedSchema(
  yup.object({
    email: yup.string().required().email(),
    password: yup.string().required()
  })
)

const { defineField, handleSubmit, errors } = useForm({ validationSchema: schema })

const [email, emailAttrs] = defineField('email')
const [password, passwordAttrs] = defineField('password')

const authRepository = inject<IAuthRepository>('userAuthReposiroty') as IAuthRepository

const router = useRouter()

const onSubmit = handleSubmit(async (values) => {
  authStore.login((await authRepository.loginWithCred(values.email, values.password))!)
  router.push({ name: 'tracking' })
})
</script>
<style lang="css"></style>
