import './assets/main.css'

import { createApp, type App as AppType } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import {
  auth,
  jobApplicationsCollection,
  usersCollection
} from './modules/repository/implementation/firebase/firebase'
import type IAuthRepository from './modules/repository/IAuthRepository'
import FireBaseAuthRepository from './modules/repository/implementation/firebase/fireBaseAuthRepository'
import { useAuthStore } from './stores/auth'
import type IJobApplicationRepository from './modules/repository/IJobApplicationRepository'
import FirebaseJobApplicationRepository from './modules/repository/implementation/firebaseJobApplicationRepository'
import type IJobApplicationService from './modules/services/IJobApplicationService'
import JobApplicationService from './modules/services/implementation/JobApplicationService'
import type IExportJobApplication from './modules/services/files/iExportJobApplication'
import ExportJobApplication from './modules/services/files/implementation/exportJobApplication'
import Vue3Toastify, { type ToastContainerOptions } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'

if (import.meta.env.MODE !== 'production') {
  import('firebase/firestore').then(({ getDocs, query, where, doc, deleteDoc }) => {
    import('firebase/auth').then(({ deleteUser, signInWithEmailAndPassword }) => {
      getDocs(query(usersCollection, where('email', '==', 'test@test.com'))).then(async (users) => {
        try {
          await signInWithEmailAndPassword(auth, 'test@test.com', 'Password123$')
          const user = users.docs[0]
          if (user) {
            const toDelete = doc(usersCollection, user.id)
            deleteDoc(toDelete).then(() => deleteUser(auth.currentUser!))
          }
        } catch (error) {
          console.log(error)
        }
      })
    })
  })
}

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

const jobApplicationRepository = new FirebaseJobApplicationRepository(jobApplicationsCollection)

auth.onAuthStateChanged(() => {
  /**
   * The app will only be initialized if the app is empty
   */
  if (!app) {
    app = createApp(App)

    app.use(createPinia())
    app.use(router)

    app.use(Vue3Toastify, {
      autoClose: 3000,
      theme: 'dark'
    } as ToastContainerOptions)

    app.provide<IAuthRepository>(
      'userAuthReposiroty',
      new FireBaseAuthRepository(usersCollection, auth)
    )

    app.provide<IJobApplicationRepository>('jobApplicationRepository', jobApplicationRepository)
    app.provide<IJobApplicationService>(
      'jobApplicationService',
      new JobApplicationService(jobApplicationRepository, auth)
    )

    app.provide<IExportJobApplication>('exportJobApplication', new ExportJobApplication())

    app.mount('#app')
  }
})
