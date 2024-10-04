import type User from '@/modules/model/User'
import { usersCollection } from '@/modules/repository/implementation/firebase/firebase'
import { getDocs, query, where } from 'firebase/firestore'

export const useUser = () => {
  const getUserByEmail = async (email: string): Promise<User | null> => {
    const userDoc = (await getDocs(query(usersCollection, where('email', '==', email)))).docs[0]
    if (userDoc) {
      return {
        ...(userDoc.data() as User),
        uid: userDoc.id
      }
    }
    return null
  }

  return { getUserByEmail }
}
