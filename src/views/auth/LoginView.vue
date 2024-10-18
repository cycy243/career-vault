<template>
  <main>
    <h1>Login</h1>
    <div v-if="errorMessage">{{ errorMessage }}</div>
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

import { useAuthStore } from '@/stores/auth'
import { ref } from 'vue'

const { loginWithCredentials } = useAuthStore()
const errorMessage = ref<string>()

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

const [email, emailAttrs] = defineField('email')
const [password, passwordAttrs] = defineField('password')

const onSubmit = handleSubmit(async (values) => {
  const result = await loginWithCredentials(values.email, values.password)
  if (!result) {
    errorMessage.value = undefined
    router.push({ name: 'tracking' })
  } else {
    errorMessage.value = result
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
