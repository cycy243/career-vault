<template>
  <div class="about">
    <h1>About CareerVault</h1>
    <section class="cv-card">
      <h2>About its existence</h2>
      <p>
        The website is first create for myself, the creator, because I wanted to keep the tracking
        of my job research in something that's more friendly to use than an excel file.<br />And I
        also wanted to add some functionnalites like exporting in pdf or excel the tracking so it's
        more easy to share it with others.
      </p>
    </section>
    <section class="cv-card">
      <h2>About the creator</h2>
      <p>Hi! My name is Cyril and I am frechly graduated from a bachelor in Software Development</p>
    </section>
  </div>
</template>

<style scoped>
.about {
  gap: 1.25rem;
}

.about h1 {
  margin-block-start: 3rem;
}

.about section {
  width: 100%;
  max-width: 42rem;
}

.about p {
  max-width: 65ch;
}
</style>
