<template>
  <main>
    <h1>Welcome on CareerVault!!!</h1>
    <section>
      <article>
        <p>You want to easily save your job research tracking?</p>
        <p>Or maybe you want to organize it better than with an excel tab?</p>
        <p>Then your in the right place!</p>
      </article>
      <article>
        <p>
          You can begin to use our tool just by registering
          <RouterLink :to="{ name: 'register' }">here</RouterLink>
        </p>
      </article>
    </section>
  </main>
</template>
