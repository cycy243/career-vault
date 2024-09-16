import JobApplication from '@/modules/model/jobApplication'
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
    uid: string,
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
      await setDoc(createdDoc, { ...application, pseudo: uid })
      return application
    } catch (error) {
      console.error(error)
      return undefined
    }
  }

  async getApplications(pseudo: string): Promise<Array<JobApplication> | undefined> {
    try {
      const result = Array<JobApplication>(0)
      const snapshot = await getDocs(query(this.collection, where('pseudo', '==', pseudo)))

      snapshot.forEach((doc) => {
        const data = doc.data() as any
        data.sendDate = new Date(Number.parseInt((data.sendDate as any).seconds) * 1000)
        data.responseDate = data.responseDate
          ? new Date(Number.parseInt((data.responseDate as any).seconds) * 1000)
          : undefined
        result.push(data as JobApplication)
      })

      return result
    } catch (error) {
      console.error(error)
      return undefined
    }
  }
}
