<template>
  <nav class="auth-menu" v-if="!authStore.isAuthenticated">
    <RouterLink :to="{ name: 'login' }">Login</RouterLink>
    <RouterLink :to="{ name: 'register' }">Register</RouterLink>
  </nav>
  <div v-if="authStore.isAuthenticated">
    <p>{{ authStore.authenticatedUser?.pseudo }}</p>
  </div>
</template>
<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
</script>
<style lang="css"></style>
