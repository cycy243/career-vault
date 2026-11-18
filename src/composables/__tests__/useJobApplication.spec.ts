import { describe, expect, it, vi, assert, type Mocked } from 'vitest';

import { useJobApplication } from '../useJobApplication';
import JobApplication from '@/modules/model/jobApplication';
import { nextTick } from 'vue';
import { randomUUID } from 'crypto';
import { FirebaseError } from 'firebase/app';
import type { UploadResult } from 'firebase/storage';

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

const mockedFirestore = vi.hoisted(() => ({
  getDocs: vi.fn(),
  setDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  doc: vi.fn(() => {
    return {
      id: randomUUID()
    };
  }),
  query: vi.fn(),
  where: vi.fn()
}));

vi.mock('firebase/firestore', async () => {
  const actualModule = await vi.importActual('firebase/firestore');

  return { ...actualModule, ...mockedFirestore };
});

describe('useJobApplication Tests', () => {
  describe('add application', async () => {
    it('When application is valid then there is no error and the application is added', async () => {
      // Arrange
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
      expect(addResult).toBeTruthy();
      expect(error.value).toBeUndefined();
      expect(jobApplications.value).toHaveLength(1);
    });

    it('When application is valid file then there is no error and the file link has a uuid in it', async () => {
      // Arrange
      const { error, addApplication, jobApplications } = useJobApplication();
      let refPath = '';
      mockedFireStorage.uploadBytes.mockImplementationOnce((ref: any) => {
        refPath = ref.fullPath;
        return Promise.resolve({} as UploadResult);
      });

      // Act
      const addResult = await addApplication(
        JobApplication.createJobApplication({
          societyName: 'Delomit IT'
        }),
        new File([], 'test.pdf')
      );

      await nextTick();

      // Assert
      console.log(error.value);
      console.log('path: ' + refPath);

      expect(refPath).toBeDefined();
      assert.match(
        refPath.substring(refPath.indexOf('/') + 1),
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}.+$/i,
        'regex match'
      );
    });

    it('when error occurs, error is defined and function returns false', async () => {
      // Arrange
      mockedFirestore.setDoc.mockRejectedValue(new FirebaseError('', ''));
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
    it('maps firestore documents, timestamps and legacy flat fields', async () => {
      mockedFirestore.getDocs.mockResolvedValueOnce({
        docs: [
          {
            id: 'doc-1',
            data: () => ({
              societyName: 'Legacy Corp',
              jobTitle: 'Dev',
              sendDate: { seconds: 1700000000 }
            })
          },
          {
            id: 'doc-2',
            data: () => ({
              companyInformation: { societyName: 'New Corp', societyWebsite: 'new.io' }
            })
          }
        ]
      });
      const { jobApplications, loadCurrentUserJobApplication, isLoading } = useJobApplication();

      const result = await loadCurrentUserJobApplication();

      expect(result).toBeTruthy();
      expect(isLoading.value).toBeFalsy();
      expect(jobApplications.value).toHaveLength(2);
      expect(jobApplications.value[0].applicationId).toBe('doc-1');
      expect(jobApplications.value[0].companyInformation.societyName).toBe('Legacy Corp');
      expect(jobApplications.value[0].sendDate).toEqual(new Date(1700000000 * 1000));
      expect(jobApplications.value[1].companyInformation.societyWebsite).toBe('new.io');
    });

    it('when an error occurs, error is defined and function returns false', async () => {
      mockedFirestore.getDocs.mockRejectedValueOnce(new FirebaseError('', ''));
      const { error, loadCurrentUserJobApplication } = useJobApplication();

      expect(await loadCurrentUserJobApplication()).toBeFalsy();
      expect(error.value).toBeDefined();
    });
  });

  describe('save / update / delete', () => {
    const existing = () =>
      JobApplication.createJobApplication({ societyName: 'Corp', applicationId: 'doc-1' });

    it('saveApplication updates the application when it has an id', async () => {
      const { jobApplications, saveApplication } = useJobApplication();
      jobApplications.value = [existing()];
      const updated = { ...existing(), jobTitle: 'Lead' } as JobApplication;

      const result = await saveApplication(updated, '');

      expect(mockedFirestore.updateDoc).toHaveBeenCalled();
      expect(result).toEqual(updated);
      expect(jobApplications.value[0].jobTitle).toBe('Lead');
    });

    it('deleteApplication removes the application from the list', async () => {
      const { jobApplications, deleteApplication } = useJobApplication();
      jobApplications.value = [existing()];

      expect(await deleteApplication('doc-1')).toBeTruthy();
      expect(mockedFirestore.deleteDoc).toHaveBeenCalled();
      expect(jobApplications.value).toHaveLength(0);
    });

    it('deleteApplication keeps the list and sets error on failure', async () => {
      mockedFirestore.deleteDoc.mockRejectedValueOnce(new FirebaseError('', ''));
      const { jobApplications, deleteApplication, error } = useJobApplication();
      jobApplications.value = [existing()];

      expect(await deleteApplication('doc-1')).toBeFalsy();
      expect(error.value).toBeDefined();
      expect(jobApplications.value).toHaveLength(1);
    });
  });
});
