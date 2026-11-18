<template>
  <nav class="auth-menu" v-if="!authStore.isAuthenticated" aria-label="Account">
    <RouterLink :to="{ name: 'login' }" class="cv-nav-link">Login</RouterLink>
    <RouterLink :to="{ name: 'register' }" class="cv-nav-link">Register</RouterLink>
  </nav>
  <div v-if="authStore.isAuthenticated" class="auth-menu">
    <p class="user-pseudo">{{ authStore.authenticatedUser?.pseudo }}</p>
    <button type="button" class="logout" @click="onLogout()">Logout</button>
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
<style lang="css" scoped>
.auth-menu {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.user-pseudo {
  font-weight: 500;
  color: var(--cv-white);
}

.logout {
  padding: 0.3rem 0.9rem;
  background: transparent;
  color: var(--cv-white);
  border: 1px solid rgba(255, 255, 255, 0.7);
  box-shadow: none;
}

.logout:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: var(--cv-sky);
  box-shadow: none;
}
</style>
