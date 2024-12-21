<template>
  <nav class="auth-menu" v-if="!authStore.isAuthenticated">
    <RouterLink :to="{ name: 'login' }">Login</RouterLink>
    <RouterLink :to="{ name: 'register' }">Register</RouterLink>
  </nav>
  <div v-if="authStore.isAuthenticated">
    <p>{{ authStore.authenticatedUser?.pseudo }}</p>
    <span @click="onLogout()">Logout</span>
  </div>
</template>
<script setup lang="ts">
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

async function onLogout() {
  await authStore.logout();
  router.push('/');
}
</script>
<style lang="css"></style>
