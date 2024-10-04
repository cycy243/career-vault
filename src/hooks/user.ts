import User from '@/modules/model/User'
import { usersCollection } from '@/modules/repository/implementation/firebase/firebase'
import { doc, getDocs, query, setDoc, where } from 'firebase/firestore'

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

  const addUser = async (user: User, userId: string): Promise<User> => {
    const createdDoc = await doc(usersCollection, userId)
    const userToAdd = { ...user, uid: userId }
    await setDoc(createdDoc, userToAdd)
    return userToAdd
  }

  return { getUserByEmail, addUser }
}
