import JobApplication from '@/modules/model/jobApplication';
import {
  deleteDoc,
  doc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
  type DocumentData,
  type Timestamp
} from 'firebase/firestore';
import { storage, jobApplicationsCollection } from '../modules/configs/firebase';
import { getDownloadURL, ref as firebaseRef, uploadBytes } from 'firebase/storage';
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { v4 as uuidv4 } from 'uuid';

const toDate = (value: Timestamp | { seconds: number | string } | undefined) =>
  value ? new Date(Number(value.seconds) * 1000) : undefined;

/**
 * Converts a Firestore document into a JobApplication,
 * handling Firestore timestamps and legacy flat fields (societyName, societyWebsite).
 */
const toJobApplication = (id: string, data: DocumentData): JobApplication =>
  JobApplication.createJobApplication({
    ...data,
    applicationId: id,
    societyName: data.companyInformation?.societyName ?? data.societyName,
    societyWebsite: data.companyInformation?.societyWebsite ?? data.societyWebsite,
    sendDate: toDate(data.sendDate),
    interviewDate: toDate(data.interviewDate),
    responseDate: toDate(data.responseDate)
  });

const toErrorMessage = (err: unknown) =>
  (err as { name?: string })?.name === 'FirebaseError'
    ? 'An error occured with an external service'
    : 'An unknow error occured';

export const useJobApplication = () => {
  const jobApplications = ref<Array<JobApplication>>([]);
  const isLoading = ref(false);
  const error = ref<string>();

  const authStore = useAuthStore();

  const handleError = (err: unknown) => {
    console.error(err);
    error.value = toErrorMessage(err);
  };

  const uploadOfferDetails = async (offerDetails: File | string): Promise<string> => {
    if (!(offerDetails instanceof File)) return offerDetails;
    const storageRef = firebaseRef(storage, `offer-details/${uuidv4()}-${offerDetails.name}`);
    const uploaded = await uploadBytes(storageRef, offerDetails);
    return getDownloadURL(uploaded.ref);
  };

  const loadCurrentUserJobApplication = async (): Promise<boolean> => {
    const uid = authStore.authenticatedUser?.uid;
    if (!uid) return false;

    isLoading.value = true;
    error.value = undefined;
    try {
      const snapshot = await getDocs(query(jobApplicationsCollection, where('userId', '==', uid)));
      jobApplications.value = snapshot.docs.map((d) => toJobApplication(d.id, d.data()));
      return true;
    } catch (err) {
      handleError(err);
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  const addApplication = async (
    application: JobApplication,
    offerDetails: File | string
  ): Promise<JobApplication | undefined> => {
    error.value = undefined;
    try {
      const createdDoc = doc(jobApplicationsCollection);
      application.applicationLink = await uploadOfferDetails(offerDetails);
      await setDoc(createdDoc, {
        ...application,
        applicationId: createdDoc.id,
        userId: authStore.authenticatedUser?.uid
      });
      const added = { ...application, applicationId: createdDoc.id };
      jobApplications.value.push(added);
      return added;
    } catch (err) {
      handleError(err);
      return undefined;
    }
  };

  const updateApplication = async (
    application: JobApplication
  ): Promise<JobApplication | undefined> => {
    error.value = undefined;
    try {
      await updateDoc(doc(jobApplicationsCollection, application.applicationId), {
        ...application
      });
      const index = jobApplications.value.findIndex(
        (a) => a.applicationId === application.applicationId
      );
      if (index !== -1) jobApplications.value[index] = application;
      return application;
    } catch (err) {
      handleError(err);
      return undefined;
    }
  };

  /** Adds the application if it has no id yet, updates it otherwise. */
  const saveApplication = (
    application: JobApplication,
    offerDetails: File | string
  ): Promise<JobApplication | undefined> =>
    application.applicationId === undefined
      ? addApplication(application, offerDetails)
      : updateApplication(application);

  const deleteApplication = async (applicationId: string): Promise<boolean> => {
    error.value = undefined;
    try {
      await deleteDoc(doc(jobApplicationsCollection, applicationId));
      jobApplications.value = jobApplications.value.filter(
        (a) => a.applicationId !== applicationId
      );
      return true;
    } catch (err) {
      handleError(err);
      return false;
    }
  };

  return {
    jobApplications,
    isLoading,
    error,
    loadCurrentUserJobApplication,
    addApplication,
    updateApplication,
    saveApplication,
    deleteApplication
  };
};
