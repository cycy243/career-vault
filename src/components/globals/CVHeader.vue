<template>
  <header class="header">
    <img src="/src/assets/careervault-logo.svg" alt="Career Vault logo" class="career-vault-logo" />
    <div class="wrapper menu-wrapper">
      <CVNavigationMenu />
      <CVAuthMenu />
    </div>
  </header>
</template>
<script setup lang="ts">
import CVNavigationMenu from '@/components/globals/menu/CVNavigationMenu.vue'
import CVAuthMenu from '@/components/globals/menu/CVAuthMenu.vue'
</script>
<style lang="css" scoped>
.career-vault-logo {
  width: 8rem;
}

.header {
  align-items: flex-end;
}

.header,
.wrapper.menu-wrapper {
  display: flex;
  flex-direction: row;
}

.header .wrapper.menu-wrapper {
  justify-content: space-between;
  margin-inline: 2.5%;
  width: 100%;
}
</style>
