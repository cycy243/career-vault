import JobApplication from '@/modules/model/jobApplication';
import {
  deleteDoc,
  doc,
  endBefore,
  getCountFromServer,
  getDocs,
  limit,
  limitToLast,
  orderBy,
  query,
  setDoc,
  startAfter,
  updateDoc,
  where,
  type DocumentData,
  type Query,
  type QueryConstraint,
  type QueryDocumentSnapshot,
  type Timestamp
} from 'firebase/firestore';
import { storage, jobApplicationsCollection } from '../modules/configs/firebase';
import { getDownloadURL, ref as firebaseRef, uploadBytes } from 'firebase/storage';
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { v4 as uuidv4 } from 'uuid';
import {
  ROWS_PER_PAGE_OPTIONS,
  SORTABLE_FIELDS,
  type SortField
} from '@/modules/model/jobApplicationPagination';

/** Sortable top-level fields that must exist (possibly `null`) for `orderBy` to return the doc. */
const NULLABLE_SORT_FIELDS = [
  'jobTitle',
  'sendDate',
  'responseDate',
  'positiveReponse',
  'applicationLink'
] as const;

const toDate = (value: Timestamp | { seconds: number | string } | null | undefined) =>
  value ? new Date(Number(value.seconds) * 1000) : undefined;

/**
 * Converts a Firestore document into a JobApplication,
 * handling Firestore timestamps, `null` sort placeholders and legacy flat fields
 * (societyName, societyWebsite).
 */
const toJobApplication = (id: string, data: DocumentData): JobApplication =>
  JobApplication.createJobApplication({
    ...data,
    applicationId: id,
    societyName: data.companyInformation?.societyName ?? data.societyName,
    societyWebsite: data.companyInformation?.societyWebsite ?? data.societyWebsite,
    jobTitle: data.jobTitle ?? undefined,
    applicationLink: data.applicationLink ?? undefined,
    positiveReponse: data.positiveReponse ?? undefined,
    sendDate: toDate(data.sendDate),
    interviewDate: toDate(data.interviewDate),
    responseDate: toDate(data.responseDate)
  });

/**
 * Firestore `orderBy` leaves out documents that don't have the field, and `undefined` values
 * are dropped on write (`ignoreUndefinedProperties`), so sortable fields are stored as `null`.
 */
const toFirestoreData = (application: JobApplication) => ({
  ...application,
  jobTitle: application.jobTitle ?? null,
  sendDate: application.sendDate ?? null,
  responseDate: application.responseDate ?? null,
  positiveReponse: application.positiveReponse ?? null,
  applicationLink: application.applicationLink ?? null
});

/** Fields to add to a document written before sortable fields were always stored. */
const missingSortFieldsPatch = (data: DocumentData): DocumentData => {
  const patch: DocumentData = {};
  if (data.companyInformation?.societyName === undefined) {
    patch['companyInformation.societyName'] = data.societyName ?? '';
  }
  for (const field of NULLABLE_SORT_FIELDS) {
    if (data[field] === undefined) patch[field] = null;
  }
  return patch;
};

const toErrorMessage = (err: unknown) =>
  (err as { name?: string })?.name === 'FirebaseError'
    ? 'An error occured with an external service'
    : 'An unknow error occured';

const countDocs = async (q: Query) => (await getCountFromServer(q)).data().count;

type PageCursors = {
  /** starts[p] / ends[p]: first / last document of page p for the current sort and page size. */
  starts: Array<QueryDocumentSnapshot | undefined>;
  ends: Array<QueryDocumentSnapshot | undefined>;
};

export const useJobApplication = () => {
  /** Applications of the current page only. */
  const jobApplications = ref<Array<JobApplication>>([]);
  const totalRecords = ref(0);
  const currentPage = ref(0);
  const rows = ref(ROWS_PER_PAGE_OPTIONS[0]);
  const sortField = ref<SortField>('sendDate');
  const ascending = ref(false);
  const isLoading = ref(false);
  const error = ref<string>();

  const authStore = useAuthStore();

  let cursors: PageCursors = { starts: [], ends: [] };
  /** Sort fields already checked for documents missing them (see `refreshTotal`). */
  const checkedSortFields = new Set<SortField>();
  /** Id of the latest page request: answers of older requests are ignored. */
  let latestRequest = 0;

  const handleError = (err: unknown) => {
    console.error(err);
    error.value = toErrorMessage(err);
  };

  const resetCursors = () => {
    cursors = { starts: [], ends: [] };
  };

  const userQuery = (uid: string, ...constraints: QueryConstraint[]) =>
    query(jobApplicationsCollection, where('userId', '==', uid), ...constraints);

  const sortConstraint = () =>
    orderBy(SORTABLE_FIELDS[sortField.value], ascending.value ? 'asc' : 'desc');

  /** Adds the missing sortable fields to every application of the user. */
  const backfillSortFields = async (uid: string) => {
    const snapshot = await getDocs(userQuery(uid));
    await Promise.all(
      snapshot.docs.map((d) => {
        const patch = missingSortFieldsPatch(d.data());
        return Object.keys(patch).length > 0
          ? updateDoc(doc(jobApplicationsCollection, d.id), patch)
          : undefined;
      })
    );
  };

  /**
   * Counts the user's applications. The first time a column is sorted on, also checks that no
   * application is missing that field (it would be left out of the sorted queries) and
   * backfills the old documents if needed.
   */
  const refreshTotal = async (uid: string) => {
    const total = await countDocs(userQuery(uid));
    if (!checkedSortFields.has(sortField.value)) {
      const sortedTotal = await countDocs(userQuery(uid, sortConstraint()));
      if (sortedTotal < total) {
        await backfillSortFields(uid);
        Object.keys(SORTABLE_FIELDS).forEach((f) => checkedSortFields.add(f as SortField));
      } else {
        checkedSortFields.add(sortField.value);
      }
    }
    totalRecords.value = total;
  };

  /**
   * Fetches one page with the cheapest query the known cursors allow:
   * after the previous page's end, before the next page's start, the end of the list
   * for the last page, or else forward from the closest known page.
   */
  const fetchPageDocs = async (
    uid: string,
    page: number,
    pageCount: number
  ): Promise<QueryDocumentSnapshot[]> => {
    const { starts, ends } = cursors;
    const size = rows.value;
    const sort = sortConstraint();
    const fetch = async (...constraints: QueryConstraint[]) =>
      (await getDocs(userQuery(uid, sort, ...constraints))).docs;

    if (page === 0) return fetch(limit(size));
    if (ends[page - 1]) return fetch(startAfter(ends[page - 1]), limit(size));
    if (starts[page + 1]) return fetch(endBefore(starts[page + 1]), limitToLast(size));
    if (page === pageCount - 1) return fetch(limitToLast(totalRecords.value - page * size));

    let known = page - 1;
    while (known >= 0 && !ends[known]) known--;
    const fromPage = known + 1;
    const fetched = await fetch(
      ...(known >= 0 ? [startAfter(ends[known])] : []),
      limit((page - fromPage + 1) * size)
    );
    for (let p = fromPage; p < page; p++) {
      starts[p] = fetched[(p - fromPage) * size];
      ends[p] = fetched[(p - fromPage + 1) * size - 1];
    }
    return fetched.slice((page - fromPage) * size);
  };

  /** Loads `page` (clamped to the existing pages) into `jobApplications`. */
  const loadPage = async (uid: string, page: number, requestId: number) => {
    const pageCount = Math.max(1, Math.ceil(totalRecords.value / rows.value));
    const target = Math.min(Math.max(page, 0), pageCount - 1);
    const pageCursors = cursors;

    const docs = totalRecords.value === 0 ? [] : await fetchPageDocs(uid, target, pageCount);
    if (docs.length > 0) {
      pageCursors.starts[target] = docs[0];
      pageCursors.ends[target] = docs[docs.length - 1];
    }
    if (requestId !== latestRequest) return;

    currentPage.value = target;
    jobApplications.value = docs.map((d) => toJobApplication(d.id, d.data()));
  };

  /** Runs a page request for the current user, handling loading, errors and stale answers. */
  const runPageRequest = async (
    task: (uid: string, requestId: number) => Promise<void>
  ): Promise<boolean> => {
    const uid = authStore.authenticatedUser?.uid;
    if (!uid) return false;

    const requestId = ++latestRequest;
    isLoading.value = true;
    error.value = undefined;
    try {
      await task(uid, requestId);
      return true;
    } catch (err) {
      handleError(err);
      return false;
    } finally {
      if (requestId === latestRequest) isLoading.value = false;
    }
  };

  /** Recounts and reloads the current page, e.g. after the data changed. */
  const reload = (uid: string, requestId: number) => {
    resetCursors();
    return refreshTotal(uid).then(() => loadPage(uid, currentPage.value, requestId));
  };

  /** Loads the first page of the current user's applications. */
  const loadCurrentUserJobApplication = (): Promise<boolean> =>
    runPageRequest((uid, requestId) => {
      currentPage.value = 0;
      return reload(uid, requestId);
    });

  /** Goes to `page` (0-based), with `newRows` applications per page. */
  const changePage = (page: number, newRows: number = rows.value): Promise<boolean> =>
    runPageRequest((uid, requestId) => {
      if (newRows !== rows.value) {
        rows.value = newRows;
        resetCursors();
      }
      return loadPage(uid, page, requestId);
    });

  /** Sorts on `field` (toggling the direction if it is already the sort field), from page 1. */
  const sortBy = (field: SortField): Promise<boolean> =>
    runPageRequest((uid, requestId) => {
      if (sortField.value === field) {
        ascending.value = !ascending.value;
      } else {
        sortField.value = field;
        ascending.value = false;
      }
      currentPage.value = 0;
      return reload(uid, requestId);
    });

  /** Every application of the current user, in the current sort order (used for exports). */
  const fetchAllApplications = async (): Promise<Array<JobApplication>> => {
    const uid = authStore.authenticatedUser?.uid;
    if (!uid) return [];
    const snapshot = await getDocs(userQuery(uid, sortConstraint()));
    return snapshot.docs.map((d) => toJobApplication(d.id, d.data()));
  };

  /** Reloads the current page after a write; a failure there is reported like a load error. */
  const reloadAfterWrite = () => runPageRequest(reload);

  const uploadOfferDetails = async (offerDetails: File | string): Promise<string> => {
    if (!(offerDetails instanceof File)) return offerDetails;
    const storageRef = firebaseRef(storage, `offer-details/${uuidv4()}-${offerDetails.name}`);
    const uploaded = await uploadBytes(storageRef, offerDetails);
    return getDownloadURL(uploaded.ref);
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
        ...toFirestoreData(application),
        applicationId: createdDoc.id,
        userId: authStore.authenticatedUser?.uid
      });
      const added = { ...application, applicationId: createdDoc.id };
      await reloadAfterWrite();
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
      await updateDoc(
        doc(jobApplicationsCollection, application.applicationId),
        toFirestoreData(application)
      );
      await reloadAfterWrite();
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
      await reloadAfterWrite();
      return true;
    } catch (err) {
      handleError(err);
      return false;
    }
  };

  return {
    jobApplications,
    totalRecords,
    currentPage,
    rows,
    sortField,
    ascending,
    isLoading,
    error,
    loadCurrentUserJobApplication,
    changePage,
    sortBy,
    fetchAllApplications,
    addApplication,
    updateApplication,
    saveApplication,
    deleteApplication
  };
};
