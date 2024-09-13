import './assets/main.css'

import { createApp, type App as AppType } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { auth, usersCollection } from './modules/repository/implementation/firebase/firebase'
import type IAuthRepository from './modules/repository/IAuthRepository'
import FireBaseAuthRepository from './modules/repository/implementation/firebase/fireBaseAuthRepository'
import { useAuthStore } from './stores/auth'

let app: AppType<Element> | undefined = undefined

router.beforeEach((to, from, next) => {
  if (!to.meta.requiresAuth) {
    next()
    return
  }

  const store = useAuthStore()

  if (store.isAuthenticated) {
    next()
  } else {
    next({ name: 'home' })
  }
})

auth.onAuthStateChanged(() => {
  /**
   * The app will only be initialized if the app is empty
   */
  if (!app) {
    app = createApp(App)

    app.use(createPinia())
    app.use(router)

    app.provide<IAuthRepository>(
      'userAuthReposiroty',
      new FireBaseAuthRepository(usersCollection, auth)
    )

    app.mount('#app')
  }
})
