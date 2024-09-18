import type User from '@/modules/model/User'
import type IAuthRepository from '../../IAuthRepository'
import {
  doc,
  getDocs,
  query,
  setDoc,
  where,
  type CollectionReference,
  type DocumentData
} from 'firebase/firestore'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  type Auth
} from 'firebase/auth'
import { usersCollection } from './firebase'

export default class FireBaseAuthRepository implements IAuthRepository {
  constructor(
    private collection: CollectionReference<DocumentData>,
    private auth: Auth
  ) {}

  async register(user: User): Promise<User> {
    const userCred = await createUserWithEmailAndPassword(this.auth, user.email, user.password)

    const createdDoc = await doc(this.collection, userCred.user.uid)
    await setDoc(createdDoc, { ...user })

    return user
  }

  async loginWithCred(email: string, password: string): Promise<User | undefined> {
    const cred = await signInWithEmailAndPassword(this.auth, email, password)
    return {
      ...((
        await getDocs(query(usersCollection, where('email', '==', email)))
      ).docs[0].data() as User),
      uid: cred.user.uid
    }
  }
}
