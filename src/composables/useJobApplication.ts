import JobApplication from '@/modules/model/jobApplication'
import type IJobApplicationRepository from '../modules/model/jobApplication'
import {
  deleteDoc,
  doc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
  type CollectionReference,
  type DocumentData
} from 'firebase/firestore'
import { storage, jobApplicationsCollection } from '../modules/configs/firebase'
import { getDownloadURL, ref as firebaseRef, uploadBytes } from 'firebase/storage'
import { inject, provide, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import type IJobApplicationService from '@/modules/services/IJobApplicationService'

export const useJobApplication = (
  jobApplicationService: IJobApplicationService = inject<IJobApplicationService>(
    'jobApplicationService'
  )!
) => {
  const jobApplications = ref<Array<JobApplication>>([])
  const error = ref<string>()

  const { authenticatedUser: currentUser } = useAuthStore()

  const loadCurrentUserJobApplication = async (): Promise<boolean> => {
    return Promise.resolve(true)
  }

  const addApplication = async (
    application: JobApplication,
    offerDetails: File | string
  ): Promise<boolean> => {
    try {
      const createdDoc = await doc(jobApplicationsCollection)
      if (offerDetails instanceof File) {
        const storageRef = firebaseRef(storage, `offer-details/${offerDetails.name}`) // With this we'll be able to access the root directory of our storage
        const songRef = await uploadBytes(storageRef, offerDetails) // This will tell firebase where to store the file and that the songs directory is the child of the root directory
        application.applicationLink = await getDownloadURL(songRef.ref)
      } else {
        application.applicationLink = offerDetails
      }
      await setDoc(createdDoc, {
        ...application,
        applicationId: createdDoc.id,
        userId: currentUser?.uid
      })
      jobApplications.value.push({ ...application, applicationId: createdDoc.id })
      return true
    } catch (err) {
      if ((err as any)?.name === 'FirebaseError') {
        error.value = 'An error occured with an external service'
      } else {
        error.value = 'An unknow error occured'
      }
      return false
    }
  }

  const deleteApplication = async (): Promise<boolean> => {
    return Promise.resolve(true)
  }

  const editApplication = async (): Promise<boolean> => {
    return Promise.resolve(true)
  }

  const saveApplication = async (): Promise<boolean> => {
    return Promise.resolve(true)
  }

  return {
    jobApplications,
    loadCurrentUserJobApplication,
    addApplication,
    deleteApplication,
    editApplication,
    saveApplication,
    error
  }
}
