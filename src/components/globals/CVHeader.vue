<template>
  <header class="header">
    <div class="header-inner">
      <RouterLink :to="{ name: 'home' }" class="logo-link" aria-label="CareerVault home">
        <img
          src="/src/assets/careervault-logo.svg"
          alt="Career Vault logo"
          class="career-vault-logo"
        />
      </RouterLink>
      <div class="menu-wrapper">
        <CVNavigationMenu />
        <CVAuthMenu />
      </div>
    </div>
  </header>
</template>
<script setup lang="ts">
import CVNavigationMenu from '@/components/globals/menu/CVNavigationMenu.vue';
import CVAuthMenu from '@/components/globals/menu/CVAuthMenu.vue';
</script>
<style lang="css" scoped>
.header {
  position: sticky;
  top: 0;
  z-index: 20;
  background: var(--cv-steel);
  color: var(--cv-white);
  box-shadow: 0 4px 16px -8px rgba(30, 72, 92, 0.5);
}

.header-inner {
  max-width: 1200px;
  margin-inline: auto;
  padding: 0.5rem 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
}

.logo-link {
  display: flex;
  padding: 0;
}

.logo-link:hover {
  background: none;
}

.career-vault-logo {
  width: 6.5rem;
  display: block;
  transition: transform var(--cv-med) var(--cv-ease);
}

.logo-link:hover .career-vault-logo {
  transform: scale(1.04);
}

.menu-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

@media (max-width: 640px) {
  .header-inner {
    flex-direction: column;
    gap: 0.25rem;
  }

  .menu-wrapper {
    width: 100%;
    flex-wrap: wrap;
    justify-content: center;
  }
}
</style>
