import { ref } from 'vue'

import { auth, usersCollection } from '@/modules/repository/implementation/firebase/firebase'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { getDocs, query, where } from 'firebase/firestore'
import { useAuthStore } from '@/stores/auth'
import type User from '@/modules/model/User'

export const useAuth = () => {
  const { login } = useAuthStore()

  const error = ref<string>()
  const success = ref(false)

  const onLogin = (email: string, password: string) => {
    signInWithEmailAndPassword(auth, email, password)
      .then((cred) => {
        return getDocs(query(usersCollection, where('email', '==', email)))
      })
      .then((result) => {
        const docs = result.docs
        if (docs[0]) {
          login({
            ...(docs[0].data() as User),
            uid: docs[0].id
          })
          return true
        }
        throw new Error('No user found for the given credentials')
      })
      .catch((err) => {
        if ((err as any)?.code === 'auth/invalid-credential') {
          error.value = 'No user were found for the given credentials'
        } else if ((err as any)?.name === 'FirebaseError') {
          error.value = 'An error occured with an external service'
        } else {
          error.value = 'An unknow error occured'
        }
      })
  }

  return { error, onLogin, success }
}
