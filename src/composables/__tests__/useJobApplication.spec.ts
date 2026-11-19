import { beforeEach, describe, expect, it, vi, assert } from 'vitest';

import { useJobApplication } from '../useJobApplication';
import JobApplication from '@/modules/model/jobApplication';
import { nextTick } from 'vue';
import { FirebaseError } from 'firebase/app';
import type { UploadResult } from 'firebase/storage';

const UID = '123456789-123456789';

vi.mock('../../modules/configs/firebase', async (importOriginal) => {
  const actualModule = await importOriginal<typeof import('firebase/firestore')>();
  return {
    ...actualModule,
    jobApplicationsCollection: vi.fn()
  };
});

vi.mock('../../stores/auth', () => {
  return {
    useAuthStore: () => {
      return {
        authenticatedUser: {
          uid: '123456789-123456789'
        }
      };
    }
  };
});

const mockedFireStorage = vi.hoisted(() => ({
  getDownloadURL: vi.fn(),
  uploadBytes: vi.fn()
}));

vi.mock('firebase/storage', async (importOriginal) => {
  const actualModule = await importOriginal<typeof import('firebase/storage')>();
  return { ...actualModule, ...mockedFireStorage };
});

/**
 * Minimal in-memory Firestore: `query` returns its constraints and `getDocs` /
 * `getCountFromServer` apply them to `store`, the way Firestore does (orderBy leaves out
 * documents missing the field, cursors are document snapshots).
 */
const fakeFirestore = vi.hoisted(() => {
  type Data = Record<string, any>;
  type Constraint = { type: string; [key: string]: any };
  const store: Array<{ id: string; data: Data }> = [];

  const getPath = (data: Data, path: string) =>
    path.split('.').reduce<any>((value, key) => (value == null ? undefined : value[key]), data);
  const rank = (value: any) => {
    if (value === null) return -Infinity;
    if (value instanceof Date) return value.getTime();
    if (typeof value === 'object' && 'seconds' in value) return Number(value.seconds) * 1000;
    return value;
  };
  const snapshot = (entry: { id: string; data: Data }) => ({
    id: entry.id,
    data: () => entry.data
  });

  const run = (constraints: Constraint[]) => {
    let docs = [...store];
    for (const c of constraints.filter((c) => c.type === 'where')) {
      docs = docs.filter((d) => getPath(d.data, c.field) === c.value);
    }
    const order = constraints.find((c) => c.type === 'orderBy');
    if (order) {
      const sign = order.dir === 'desc' ? -1 : 1;
      docs = docs
        .filter((d) => getPath(d.data, order.field) !== undefined)
        .sort((a, b) => {
          const [x, y] = [rank(getPath(a.data, order.field)), rank(getPath(b.data, order.field))];
          if (x !== y) return x > y ? sign : -sign;
          return a.id > b.id ? sign : -sign;
        });
    }
    for (const c of constraints) {
      const index = () => docs.findIndex((d) => d.id === c.snapshot.id);
      if (c.type === 'startAfter') docs = docs.slice(index() + 1);
      if (c.type === 'endBefore') docs = docs.slice(0, index());
      if (c.type === 'limit') docs = docs.slice(0, c.n);
      if (c.type === 'limitToLast') docs = docs.slice(-c.n);
    }
    return docs;
  };

  const set = (id: string, data: Data) => {
    const existing = store.find((d) => d.id === id);
    if (existing) existing.data = data;
    else store.push({ id, data });
  };

  let nextId = 0;
  const mocks = {
    query: vi.fn((_collection: unknown, ...constraints: Constraint[]) => ({ constraints })),
    where: vi.fn((field: string, _op: string, value: unknown) => ({ type: 'where', field, value })),
    orderBy: vi.fn((field: string, dir = 'asc') => ({ type: 'orderBy', field, dir })),
    limit: vi.fn((n: number) => ({ type: 'limit', n })),
    limitToLast: vi.fn((n: number) => ({ type: 'limitToLast', n })),
    startAfter: vi.fn((snapshot: { id: string }) => ({ type: 'startAfter', snapshot })),
    endBefore: vi.fn((snapshot: { id: string }) => ({ type: 'endBefore', snapshot })),
    getDocs: vi.fn(async (q: { constraints: Constraint[] }) => ({
      docs: run(q.constraints).map(snapshot)
    })),
    getCountFromServer: vi.fn(async (q: { constraints: Constraint[] }) => ({
      data: () => ({ count: run(q.constraints).length })
    })),
    doc: vi.fn((_collection: unknown, id?: string) => ({ id: id ?? `new-${++nextId}` })),
    setDoc: vi.fn(async (ref: { id: string }, data: Data) => set(ref.id, structuredClone(data))),
    updateDoc: vi.fn(async (ref: { id: string }, patch: Data) => {
      const data = store.find((d) => d.id === ref.id)!.data;
      for (const [path, value] of Object.entries(patch)) {
        const keys = path.split('.');
        const parent = keys.slice(0, -1).reduce((obj, key) => (obj[key] ??= {}), data);
        parent[keys[keys.length - 1]] = value;
      }
    }),
    deleteDoc: vi.fn(async (ref: { id: string }) => {
      store.splice(
        store.findIndex((d) => d.id === ref.id),
        1
      );
    })
  };

  return { store, mocks };
});
const mockedFirestore = fakeFirestore.mocks;

vi.mock('firebase/firestore', async () => {
  const actualModule = await vi.importActual('firebase/firestore');
  return { ...actualModule, ...fakeFirestore.mocks };
});

/** Seeds `count` applications of the current user, sent on consecutive days (id app-<n>). */
const seed = (count: number) => {
  for (let i = 1; i <= count; i++) {
    fakeFirestore.store.push({
      id: `app-${String(i).padStart(3, '0')}`,
      data: {
        userId: UID,
        companyInformation: { societyName: `Society ${i}`, societyWebsite: '' },
        jobTitle: `Job ${i}`,
        sendDate: { seconds: 1700000000 + i * 86400 },
        responseDate: null,
        positiveReponse: null,
        applicationLink: null
      }
    });
  }
};

const titles = (applications: JobApplication[]) => applications.map((a) => a.jobTitle);
/** Job titles of a sendDate-descending page out of `total` seeded applications. */
const expectedTitles = (total: number, from: number, size: number) =>
  Array.from({ length: size }, (_, i) => `Job ${total - from - i}`);

describe('useJobApplication Tests', () => {
  beforeEach(() => {
    fakeFirestore.store.splice(0);
    vi.clearAllMocks();
  });

  describe('add application', async () => {
    it('When application is valid then there is no error and the application is added', async () => {
      // Arrange
      const { error, addApplication, jobApplications, totalRecords } = useJobApplication();

      // Act
      const addResult = await addApplication(
        JobApplication.createJobApplication({
          societyName: 'Delomit IT'
        }),
        'dolomit-it.com'
      );

      await nextTick();

      // Assert
      expect(addResult).toBeTruthy();
      expect(error.value).toBeUndefined();
      expect(jobApplications.value).toHaveLength(1);
      expect(totalRecords.value).toBe(1);
    });

    it('stores missing sortable fields as null so sorted queries still return the application', async () => {
      const { addApplication } = useJobApplication();

      await addApplication(JobApplication.createJobApplication({ societyName: 'Corp' }), '');

      const stored = fakeFirestore.store[0].data;
      expect(stored.jobTitle).toBeNull();
      expect(stored.sendDate).toBeNull();
      expect(stored.responseDate).toBeNull();
    });

    it('When application is valid file then there is no error and the file link has a uuid in it', async () => {
      // Arrange
      const { addApplication } = useJobApplication();
      let refPath = '';
      mockedFireStorage.uploadBytes.mockImplementationOnce((ref: any) => {
        refPath = ref.fullPath;
        return Promise.resolve({} as UploadResult);
      });

      // Act
      await addApplication(
        JobApplication.createJobApplication({
          societyName: 'Delomit IT'
        }),
        new File([], 'test.pdf')
      );

      await nextTick();

      // Assert
      expect(refPath).toBeDefined();
      assert.match(
        refPath.substring(refPath.indexOf('/') + 1),
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}.+$/i,
        'regex match'
      );
    });

    it('when error occurs, error is defined and function returns false', async () => {
      // Arrange
      mockedFirestore.setDoc.mockRejectedValueOnce(new FirebaseError('', ''));
      const { error, addApplication, jobApplications } = useJobApplication();

      // Act
      const addResult = await addApplication(
        JobApplication.createJobApplication({
          societyName: 'Delomit IT'
        }),
        'dolomit-it.com'
      );

      await nextTick();

      // Assert
      expect(addResult).toBeFalsy();
      expect(error.value).toBeDefined();
      expect(jobApplications.value).toHaveLength(0);
    });
  });

  describe('load applications', () => {
    it('maps firestore documents, timestamps and backfills legacy documents', async () => {
      fakeFirestore.store.push(
        {
          id: 'doc-1',
          data: {
            userId: UID,
            societyName: 'Legacy Corp',
            jobTitle: 'Dev',
            sendDate: { seconds: 1700000000 }
          }
        },
        {
          id: 'doc-2',
          data: {
            userId: UID,
            // No sendDate: the default sort (sendDate) triggers the backfill.
            companyInformation: { societyName: 'New Corp', societyWebsite: 'new.io' }
          }
        }
      );
      const { jobApplications, loadCurrentUserJobApplication, isLoading, totalRecords } =
        useJobApplication();

      const result = await loadCurrentUserJobApplication();

      expect(result).toBeTruthy();
      expect(isLoading.value).toBeFalsy();
      expect(totalRecords.value).toBe(2);
      expect(jobApplications.value).toHaveLength(2);
      expect(jobApplications.value[0].applicationId).toBe('doc-1');
      expect(jobApplications.value[0].companyInformation.societyName).toBe('Legacy Corp');
      expect(jobApplications.value[0].sendDate).toEqual(new Date(1700000000 * 1000));
      expect(jobApplications.value[1].companyInformation.societyWebsite).toBe('new.io');
      expect(jobApplications.value[1].isSpontaneous).toBe(true);

      // Old documents now have every sortable field, so no column sort will drop them.
      const legacy = fakeFirestore.store.find((d) => d.id === 'doc-1')!.data;
      expect(legacy.companyInformation.societyName).toBe('Legacy Corp');
      expect(legacy.responseDate).toBeNull();
      expect(legacy.applicationLink).toBeNull();
      expect(fakeFirestore.store.find((d) => d.id === 'doc-2')!.data.sendDate).toBeNull();
    });

    it('does not backfill when every document has the sort field', async () => {
      seed(3);
      const { loadCurrentUserJobApplication } = useJobApplication();

      await loadCurrentUserJobApplication();

      expect(mockedFirestore.updateDoc).not.toHaveBeenCalled();
    });

    it('when an error occurs, error is defined and function returns false', async () => {
      mockedFirestore.getCountFromServer.mockRejectedValueOnce(new FirebaseError('', ''));
      const { error, loadCurrentUserJobApplication } = useJobApplication();

      expect(await loadCurrentUserJobApplication()).toBeFalsy();
      expect(error.value).toBeDefined();
    });
  });

  describe('pagination', () => {
    it('loads the first 15 applications, most recent first', async () => {
      seed(40);
      const { jobApplications, totalRecords, currentPage, rows, loadCurrentUserJobApplication } =
        useJobApplication();

      await loadCurrentUserJobApplication();

      expect(totalRecords.value).toBe(40);
      expect(currentPage.value).toBe(0);
      expect(rows.value).toBe(15);
      expect(titles(jobApplications.value)).toEqual(expectedTitles(40, 0, 15));
    });

    it('goes to the next, last and previous pages', async () => {
      seed(40);
      const { jobApplications, currentPage, loadCurrentUserJobApplication, changePage } =
        useJobApplication();
      await loadCurrentUserJobApplication();

      await changePage(1);
      expect(titles(jobApplications.value)).toEqual(expectedTitles(40, 15, 15));
      expect(mockedFirestore.startAfter).toHaveBeenCalled();

      await changePage(2);
      expect(currentPage.value).toBe(2);
      expect(titles(jobApplications.value)).toEqual(expectedTitles(40, 30, 10));

      await changePage(1);
      expect(titles(jobApplications.value)).toEqual(expectedTitles(40, 15, 15));
    });

    it('jumps to the last page without reading the pages before it', async () => {
      seed(100); // pages 0..6, the last one holding 10 applications
      const { jobApplications, loadCurrentUserJobApplication, changePage } = useJobApplication();
      await loadCurrentUserJobApplication();
      mockedFirestore.getDocs.mockClear();

      await changePage(6);

      expect(mockedFirestore.limitToLast).toHaveBeenCalledWith(10);
      expect(mockedFirestore.getDocs).toHaveBeenCalledTimes(1);
      expect(titles(jobApplications.value)).toEqual(expectedTitles(100, 90, 10));

      // Previous page reads backwards from the last page's first document.
      await changePage(5);
      expect(mockedFirestore.endBefore).toHaveBeenCalled();
      expect(titles(jobApplications.value)).toEqual(expectedTitles(100, 75, 15));
    });

    it('jumps several pages forward', async () => {
      seed(100);
      const { jobApplications, loadCurrentUserJobApplication, changePage } = useJobApplication();
      await loadCurrentUserJobApplication();

      await changePage(3);
      expect(titles(jobApplications.value)).toEqual(expectedTitles(100, 45, 15));

      await changePage(2);
      expect(titles(jobApplications.value)).toEqual(expectedTitles(100, 30, 15));
    });

    it('changes the page size', async () => {
      seed(40);
      const { jobApplications, rows, loadCurrentUserJobApplication, changePage } =
        useJobApplication();
      await loadCurrentUserJobApplication();

      await changePage(0, 25);

      expect(rows.value).toBe(25);
      expect(titles(jobApplications.value)).toEqual(expectedTitles(40, 0, 25));
    });

    it('sorts from the first page and toggles the direction on the same column', async () => {
      seed(40);
      const {
        jobApplications,
        currentPage,
        sortField,
        ascending,
        loadCurrentUserJobApplication,
        changePage,
        sortBy
      } = useJobApplication();
      await loadCurrentUserJobApplication();
      await changePage(1);

      await sortBy('sendDate');
      expect(sortField.value).toBe('sendDate');
      expect(ascending.value).toBe(true);
      expect(currentPage.value).toBe(0);
      expect(jobApplications.value[0].jobTitle).toBe('Job 1');

      await sortBy('societyName');
      expect(ascending.value).toBe(false);
      expect(mockedFirestore.orderBy).toHaveBeenLastCalledWith(
        'companyInformation.societyName',
        'desc'
      );
    });

    it('goes back one page when the only application of the last page is deleted', async () => {
      seed(16);
      const {
        jobApplications,
        currentPage,
        totalRecords,
        loadCurrentUserJobApplication,
        changePage,
        deleteApplication
      } = useJobApplication();
      await loadCurrentUserJobApplication();
      await changePage(1);
      expect(jobApplications.value).toHaveLength(1);

      expect(await deleteApplication(jobApplications.value[0].applicationId!)).toBeTruthy();

      expect(totalRecords.value).toBe(15);
      expect(currentPage.value).toBe(0);
      expect(jobApplications.value).toHaveLength(15);
    });

    it('fetchAllApplications returns every application in the current order', async () => {
      seed(40);
      const { fetchAllApplications } = useJobApplication();

      expect(titles(await fetchAllApplications())).toEqual(expectedTitles(40, 0, 40));
    });
  });

  describe('save / update / delete', () => {
    beforeEach(() => seed(1));

    it('saveApplication updates the application when it has an id', async () => {
      const { jobApplications, saveApplication } = useJobApplication();
      const updated = JobApplication.createJobApplication({
        societyName: 'Corp',
        jobTitle: 'Lead',
        applicationId: 'app-001'
      });

      const result = await saveApplication(updated, '');

      expect(mockedFirestore.updateDoc).toHaveBeenCalled();
      expect(result).toEqual(updated);
      expect(jobApplications.value[0].jobTitle).toBe('Lead');
    });

    it('deleteApplication removes the application from the list', async () => {
      const { jobApplications, deleteApplication, loadCurrentUserJobApplication } =
        useJobApplication();
      await loadCurrentUserJobApplication();

      expect(await deleteApplication('app-001')).toBeTruthy();
      expect(mockedFirestore.deleteDoc).toHaveBeenCalled();
      expect(jobApplications.value).toHaveLength(0);
    });

    it('deleteApplication keeps the list and sets error on failure', async () => {
      mockedFirestore.deleteDoc.mockRejectedValueOnce(new FirebaseError('', ''));
      const { jobApplications, deleteApplication, error, loadCurrentUserJobApplication } =
        useJobApplication();
      await loadCurrentUserJobApplication();

      expect(await deleteApplication('app-001')).toBeFalsy();
      expect(error.value).toBeDefined();
      expect(jobApplications.value).toHaveLength(1);
    });
  });
});
