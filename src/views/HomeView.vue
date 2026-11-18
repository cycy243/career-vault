<template>
  <main class="home">
    <h1>Welcome on CareerVault!!!</h1>
    <section class="cv-card home-card">
      <article class="intro">
        <p>You want to easily save your job research tracking?</p>
        <p>Or maybe you want to organize it better than with an excel tab?</p>
        <p class="intro-strong">Then your in the right place!</p>
      </article>
      <article class="cta">
        <p>
          You can begin to use our tool just by registering
          <RouterLink :to="{ name: 'register' }" class="cta-link">here</RouterLink>
        </p>
      </article>
    </section>
  </main>
</template>
<style scoped>
.home h1 {
  text-align: center;
  margin-block-start: 3rem;
}

.home-card {
  max-width: 42rem;
  width: 100%;
  padding: 2rem;
  display: grid;
  gap: 1.5rem;
}

.intro p {
  font-size: 1.1rem;
}

.intro-strong {
  margin-top: 0.5rem;
  font-weight: 600;
  color: var(--cv-steel);
}

.cta {
  padding-top: 1.25rem;
  border-top: 1px solid var(--cv-border);
}

.cta-link {
  display: inline-block;
  margin-inline-start: 0.25rem;
  padding: 0.3rem 1rem;
  border-radius: 999px;
  background: var(--cv-steel);
  color: var(--cv-white);
  transition:
    background-color var(--cv-fast) var(--cv-ease),
    transform var(--cv-fast) var(--cv-ease);
}

.cta-link:hover {
  background: var(--cv-steel-hover);
  color: var(--cv-white);
  transform: translateY(-1px);
}
</style>
