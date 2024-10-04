import { ref } from 'vue'

import { auth, usersCollection } from '@/modules/repository/implementation/firebase/firebase'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { getDocs, query, where } from 'firebase/firestore'
import { useAuthStore } from '@/stores/auth'
import type User from '@/modules/model/User'
import { useUser } from './user'

export const useAuth = () => {
  const { login } = useAuthStore()
  const { getUserByEmail } = useUser()

  const error = ref<string>()

  const onLogin = async (email: string, password: string) => {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password)
      const user = await getUserByEmail(email)
      if (user) {
        login(user)
        return true
      }
      error.value = 'The user should connect but no data found for it'
      return false
    } catch (err) {
      if ((err as any)?.code === 'auth/invalid-credential') {
        error.value = 'No user were found for the given credentials'
      } else if ((err as any)?.name === 'FirebaseError') {
        error.value = 'An error occured with an external service'
      } else {
        error.value = 'An unknow error occured'
      }
    }
  }

  return { error, onLogin }
}
