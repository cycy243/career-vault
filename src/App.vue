<script setup lang="ts">
import { RouterView } from 'vue-router';
import CVHeader from './components/globals/CVHeader.vue';
</script>

<template>
  <CVHeader class="header" />

  <RouterView v-slot="{ Component }">
    <Transition name="page" mode="out-in">
      <component :is="Component" class="page-content" />
    </Transition>
  </RouterView>
</template>

<style scoped>
.header {
  width: 100%;
}

.page-content {
  width: 100%;
  max-width: 1200px;
  padding: 0 16px 4rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>
