import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import 'firebase/compat/auth'
import 'firebase/compat/firestore'
import 'firebase/compat/storage'
import { collection, getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

// Initialize Firebase
const app = initializeApp({
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: import.meta.env.VITE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_STORAGE_BUCK,
  appId: import.meta.env.VITE_APP_ID,
  messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID
})

const auth = getAuth(app)
const db = getFirestore(app)
const storage = getStorage(app)

// Initialize the table of the database
const usersCollection = collection(db, 'users')
const jobApplicationsCollection = collection(db, 'jobApplications')
const commentsCollection = collection(db, 'comments')

export { auth, db, usersCollection, jobApplicationsCollection, storage, commentsCollection }
