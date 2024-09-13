import './assets/main.css'

import { createApp, type App as AppType } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { auth, usersCollection } from './modules/repository/implementation/firebase/firebase'
import type IAuthRepository from './modules/repository/IAuthRepository'
import FireBaseAuthRepository from './modules/repository/implementation/firebase/fireBaseAuthRepository'

let app: AppType<Element> | undefined = undefined

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
