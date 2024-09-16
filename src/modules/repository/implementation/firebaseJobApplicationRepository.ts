import type JobApplication from '@/modules/model/jobApplication'
import type IJobApplicationRepository from '../IJobApplicationRepository'
import {
  doc,
  getDocs,
  query,
  setDoc,
  where,
  type CollectionReference,
  type DocumentData
} from 'firebase/firestore'
import { storage } from './firebase/firebase'
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'

export default class FirebaseJobApplicationRepository implements IJobApplicationRepository {
  constructor(private collection: CollectionReference<DocumentData>) {}
  async addApplication(
    application: JobApplication,
    offerDetails: File | string
  ): Promise<JobApplication | undefined> {
    try {
      const createdDoc = await doc(this.collection)
      if (offerDetails instanceof File) {
        const storageRef = ref(storage, `offer-details/${offerDetails.name}`) // With this we'll be able to access the root directory of our storage
        const songRef = await uploadBytes(storageRef, offerDetails) // This will tell firebase where to store the file and that the songs directory is the child of the root directory
        application.applicationLink = await getDownloadURL(songRef.ref)
      } else {
        application.applicationLink = offerDetails
      }
      await setDoc(createdDoc, { ...application })
      return application
    } catch (error) {
      console.error(error)
      return undefined
    }
  }
}
