import './assets/main.css';

import { createApp, type App as AppType } from 'vue';
import { createPinia } from 'pinia';

import App from './App.vue';
import router from './router';
import { auth, usersCollection } from './modules/configs/firebase';
import { useAuthStore } from './stores/auth';
import Vue3Toastify, { type ToastContainerOptions } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';
import { useUser } from './composables/useUser';
import PrimeVue from 'primevue/config';
import Aura from '@primeuix/themes/aura';

if (import.meta.env.MODE === 'test') {
  import('firebase/firestore').then(({ getDocs, query, where, doc, deleteDoc }) => {
    import('firebase/auth').then(({ deleteUser, signInWithEmailAndPassword }) => {
      getDocs(query(usersCollection, where('email', '==', 'test@test.com'))).then(async (users) => {
        try {
          await signInWithEmailAndPassword(auth, 'test@test.com', 'Password123$');
          const user = users.docs[0];
          if (user) {
            const toDelete = doc(usersCollection, user.id);
            deleteDoc(toDelete).then(() => deleteUser(auth.currentUser!));
          }
        } catch (error) {
          console.log(error);
        }
      });
    });
  });
}

let app: AppType<Element> | undefined = undefined;

router.beforeEach((to, from, next) => {
  if (!to.meta.requiresAuth) {
    next();
    return;
  }

  const store = useAuthStore();

  if (store.isAuthenticated) {
    next();
  } else {
    next({ name: 'home' });
  }
});

app = createApp(App);

app.use(createPinia());
app.use(router);

app.use(Vue3Toastify, {
  autoClose: 3000,
  theme: 'dark'
} as ToastContainerOptions);

app.use(PrimeVue, {
  license: import.meta.env.VITE_PRIME_UI_LICENCE,
  theme: {
    preset: Aura,
    options: {
      darkModeSelector: false
    }
  }
});

app.mount('#app');
