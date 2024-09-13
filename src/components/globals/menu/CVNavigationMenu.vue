<template>
  <nav class="menu">
    <RouterLink :to="{ name: 'home' }">Home</RouterLink>
    <RouterLink :to="{ name: 'about' }">About</RouterLink>
    <template v-if="authStore.isAuthenticated">
      <RouterLink :to="{ name: 'tracking' }">Job tracking</RouterLink>
    </template>
  </nav>
</template>
<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
</script>
<style lang="css" scoped>
.menu {
  min-width: 200px;
  display: flex;
  justify-content: space-between;
}
</style>
