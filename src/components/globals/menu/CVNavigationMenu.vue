<template>
  <nav class="menu" aria-label="Main">
    <RouterLink :to="{ name: 'home' }" class="cv-nav-link">Home</RouterLink>
    <RouterLink :to="{ name: 'about' }" class="cv-nav-link">About</RouterLink>
    <template v-if="authStore.isAuthenticated">
      <RouterLink :to="{ name: 'tracking' }" class="cv-nav-link">Job tracking</RouterLink>
    </template>
  </nav>
</template>
<script setup lang="ts">
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
</script>
<style lang="css" scoped>
.menu {
  display: flex;
  gap: 1.5rem;
}
</style>
